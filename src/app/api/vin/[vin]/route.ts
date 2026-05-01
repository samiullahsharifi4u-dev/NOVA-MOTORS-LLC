export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

interface NHTSAResult {
  Make: string;
  Model: string;
  ModelYear: string;
  BodyClass: string;
  DisplacementL: string;
  EngineConfiguration: string;
  EngineCylinders: string;
  FuelTypePrimary: string;
  TransmissionStyle: string;
  PlantCountry: string;
  ErrorCode: string;
  ErrorText: string;
  Trim: string;
  Series: string;
  VehicleType: string;
  DriveType: string;
  Doors: string;
}

function mapBodyStyle(body: string): string {
  if (!body) return "";
  const b = body.toLowerCase();
  if (b.includes("sedan") || b.includes("saloon")) return "Sedan";
  if (b.includes("suv") || b.includes("utility") || b.includes("multipurpose")) return "SUV";
  if (b.includes("pickup") || b.includes("truck")) return "Truck";
  if (b.includes("hatchback") || b.includes("liftback") || b.includes("notchback")) return "Hatchback";
  if (b.includes("coupe")) return "Coupe";
  if (b.includes("minivan") || b.includes("van")) return "Van";
  if (b.includes("convertible") || b.includes("cabriolet") || b.includes("roadster")) return "Convertible";
  if (b.includes("wagon")) return "Wagon";
  return body;
}

function mapFuelType(fuel: string): string {
  if (!fuel) return "";
  const f = fuel.toLowerCase();
  if (f.includes("plug-in") || f.includes("phev")) return "Plug-in Hybrid";
  if ((f.includes("electric") && f.includes("gas")) || f.includes("hybrid")) return "Hybrid";
  if (f.includes("electric") || f === "ev") return "Electric";
  if (f.includes("diesel")) return "Diesel";
  if (f.includes("gasoline") || f.includes("gas") || f.includes("petrol")) return "Gas";
  return fuel;
}

function mapTransmission(trans: string): string {
  if (!trans) return "";
  const t = trans.toLowerCase();
  if (t.includes("cvt") || t.includes("continuously variable")) return "CVT";
  if (t.includes("automatic") || t.includes("auto")) return "Automatic";
  if (t.includes("manual") || t.includes("standard")) return "Manual";
  if (t.includes("semi")) return "Semi-Automatic";
  return trans;
}

function buildEngine(r: NHTSAResult): string {
  const parts: string[] = [];

  const liters = parseFloat(r.DisplacementL);
  if (!isNaN(liters) && liters > 0) {
    parts.push(`${liters.toFixed(1)}L`);
  }

  const cyls = parseInt(r.EngineCylinders);
  if (!isNaN(cyls) && cyls > 0) {
    const cylNames: Record<number, string> = {
      3: "3-Cylinder", 4: "4-Cylinder", 5: "5-Cylinder",
      6: "6-Cylinder", 8: "V8", 10: "V10", 12: "V12",
    };
    parts.push(cylNames[cyls] ?? `${cyls}-Cylinder`);
  }

  return parts.join(" ");
}

function isValidResult(r: NHTSAResult): boolean {
  // ErrorCode "0" = clean, "1" = decoded with minor issues
  // We accept 0 and 1, reject 6 (invalid chars), 8 (incomplete), 11 (not found)
  if (!r.Make && !r.Model) return false;
  const code = r.ErrorCode ?? "";
  if (code.includes("6") || code.includes("11")) return false;
  return true;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ vin: string }> }
) {
  const { vin } = await params;

  if (!vin || !/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
    return NextResponse.json(
      { error: "Invalid VIN format. VINs are 17 characters (letters and digits, no I, O, or Q)." },
      { status: 400 }
    );
  }

  try {
    const nhtsaRes = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin.toUpperCase()}?format=json`,
      { next: { revalidate: 86400 } } // cache 24 h — VINs don't change
    );

    if (!nhtsaRes.ok) {
      return NextResponse.json(
        { error: "NHTSA API is temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const json = await nhtsaRes.json();
    const result: NHTSAResult = json?.Results?.[0];

    if (!result) {
      return NextResponse.json({ error: "No data returned from NHTSA." }, { status: 404 });
    }

    if (!isValidResult(result)) {
      return NextResponse.json(
        {
          error:
            result.ErrorText?.split(";")[0]?.trim() ||
            "VIN not found in the NHTSA database. Please verify the VIN is correct.",
        },
        { status: 404 }
      );
    }

    const bodyStyle = mapBodyStyle(result.BodyClass);
    const fuelType = mapFuelType(result.FuelTypePrimary);
    const transmission = mapTransmission(result.TransmissionStyle);
    const engine = buildEngine(result);

    return NextResponse.json({
      make: result.Make || "",
      model: result.Model || "",
      year: result.ModelYear || "",
      trim: result.Trim || result.Series || "",
      bodyStyle,
      engine,
      fuelType,
      transmission,
      plantCountry: result.PlantCountry || "",
      driveType: result.DriveType || "",
      doors: result.Doors || "",
      vehicleType: result.VehicleType || "",
      // Raw for display in public section
      raw: {
        bodyClass: result.BodyClass,
        fuelTypePrimary: result.FuelTypePrimary,
        transmissionStyle: result.TransmissionStyle,
        engineCylinders: result.EngineCylinders,
        displacementL: result.DisplacementL,
      },
    });
  } catch (err) {
    console.error("VIN decode error:", err);
    return NextResponse.json(
      { error: "Failed to connect to NHTSA. Check your internet connection." },
      { status: 500 }
    );
  }
}
