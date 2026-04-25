import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = req.headers.get("x-admin-token");
  if (token !== "nova-admin-auth-token") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const {
    year, make, model, trim, bodyStyle, price, mileage,
    transmission, fuelType, engine, exteriorColor, interiorColor, dealRating,
  } = body;

  const dealLabel: Record<string, string> = {
    great: "Great Deal",
    good: "Good Deal",
    fair: "Fair Deal",
    high: "High Price",
  };

  const userPrompt =
    `Write a professional dealership listing description for this vehicle: ` +
    `${year} ${make} ${model}${trim ? " " + trim : ""}, ${bodyStyle}, ` +
    `${mileage ? Number(mileage).toLocaleString() : "N/A"} miles, ` +
    `${transmission} transmission, ${fuelType}, ` +
    `${engine || "N/A"} engine, ` +
    `${exteriorColor || "N/A"} exterior, ${interiorColor || "N/A"} interior. ` +
    `Price: $${price ? Number(price).toLocaleString() : "N/A"}. ` +
    `Deal Rating: ${dealLabel[dealRating] ?? dealRating}. ` +
    `Make it compelling and professional.`;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system:
          "You are a professional car dealership copywriter. Write compelling, accurate, and SEO-friendly vehicle descriptions for car listings. Keep descriptions between 100-150 words. Highlight key features, condition, and value. Use professional automotive language. Do not make up features not provided.",
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json().catch(() => ({}));
      const msg = (err as { error?: { message?: string } }).error?.message ?? "Anthropic API error";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const data = await anthropicRes.json();
    const description: string = (data.content?.[0]?.text ?? "").trim();
    return NextResponse.json({ description });
  } catch (err) {
    console.error("[generate-description] error:", err);
    return NextResponse.json({ error: "Failed to generate description." }, { status: 500 });
  }
}
