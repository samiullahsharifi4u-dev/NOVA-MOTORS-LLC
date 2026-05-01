export type DealRating = "great" | "good" | "fair" | "high";
export type CarStatus = "active" | "sold" | "draft";

export interface Car {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  engine: string;
  exteriorColor: string;
  interiorColor: string;
  vin: string;
  stockNumber: string;
  description: string;
  features: string[];
  images: string[];
  status: CarStatus;
  dealRating: DealRating;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface FilterState {
  search: string;
  minPrice: number;
  maxPrice: number;
  makes: string[];
  models: string[];
  minYear: number;
  maxYear: number;
  mileageRange: string;
  bodyStyles: string[];
  transmissions: string[];
  fuelTypes: string[];
  colors: string[];
  sortBy: string;
}

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
export type AppointmentType = "test-drive" | "purchase-inquiry" | "financing" | "service" | "other";

export interface Appointment {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  type: AppointmentType;
  carId: string;
  carInterest: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string;
  assignedStaff: string;
  createdAt: string;
}

export type CustomerStatus = "active" | "inactive" | "prospect";

export interface CustomerNote {
  id: string;
  date: string;
  author: string;
  text: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: CustomerStatus;
  source: string;
  assignedSalesperson: string;
  totalPurchases: number;
  totalSpent: number;
  notes: CustomerNote[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type DealStatus = "lead" | "negotiating" | "pending" | "closed" | "lost";
export type FinancingType = "cash" | "financed" | "lease";

export interface TradeIn {
  hasTradeIn: boolean;
  year?: number;
  make?: string;
  model?: string;
  mileage?: number;
  condition?: string;
  value?: number;
}

export interface Financing {
  type: FinancingType;
  lender: string;
  loanAmount: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  financeReserve: number;
}

export interface FIProducts {
  extendedWarranty: { included: boolean; price: number };
  gapInsurance: { included: boolean; price: number };
  paintProtection: { included: boolean; price: number };
  tireWheel: { included: boolean; price: number };
}

export interface Deal {
  id: string;
  dealNumber: string;
  customerId: string;
  carId: string;
  carSnapshot: string;
  salePrice: number;
  tradeIn: TradeIn;
  financing: Financing;
  fiProducts: FIProducts;
  taxRate: number;
  docFee: number;
  status: DealStatus;
  salesperson: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dealId: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  notes: string;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  paidAt: string | null;
}

export type ExpenseCategory =
  | "Vehicle Purchase Cost"
  | "Repairs/Prep"
  | "Advertising"
  | "Utilities"
  | "Insurance"
  | "Rent/Mortgage"
  | "Salaries"
  | "Office Supplies"
  | "Other";

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidBy: string;
  receiptUrl: string;
  carId: string;
  createdAt: string;
}

export type UserRole = "owner" | "manager" | "sales" | "finance";
export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string;
  lastLogin: string | null;
  createdAt: string;
}

export interface BusinessHours {
  day: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  headline: string;
  subheadline: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
}

export interface SiteSettings {
  dealershipName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  sliderSpeed: number;
  contact: {
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    googleMapsUrl: string;
  };
  businessHours: BusinessHours[];
  slides: HeroSlide[];
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    googleAnalyticsId: string;
  };
}
