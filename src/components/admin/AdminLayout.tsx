"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Car,
  Handshake,
  CalendarDays,
  Users,
  ReceiptText,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
};

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "manager", "sales", "finance"] },
  { href: "/admin/listings", label: "Inventory", icon: Car, roles: ["owner", "manager", "sales"] },
  { href: "/admin/deals", label: "Deals & Sales", icon: Handshake, roles: ["owner", "manager", "sales"] },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays, roles: ["owner", "manager", "sales"] },
  { href: "/admin/customers", label: "Customers", icon: Users, roles: ["owner", "manager", "sales"] },
  { href: "/admin/finance", label: "Finance", icon: ReceiptText, roles: ["owner", "manager", "finance"] },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, roles: ["owner", "manager", "finance"] },
  { href: "/admin/users", label: "Users", icon: UserCog, roles: ["owner"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["owner"] },
];

type AdminUser = { id: string; fullName: string; email: string; role: string; avatarUrl: string };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("nova-admin-token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    try {
      const u = JSON.parse(localStorage.getItem("nova-admin-user") || "null");
      setUser(u);
    } catch {
      // ignore
    }
    setReady(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("nova-admin-token");
    localStorage.removeItem("nova-admin-user");
    router.push("/admin/login");
  };

  const visibleNav = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : item.roles.includes("sales")
  );

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));

  const roleColor: Record<string, string> = {
    owner: "bg-purple-500",
    manager: "bg-blue-500",
    sales: "bg-green-500",
    finance: "bg-amber-500",
  };

  const initials = user
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0073bb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`bg-[#0f172a] text-white flex flex-col h-full transition-all duration-300 ${
        mobile ? "w-64" : collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-white/10 h-16 shrink-0 ${collapsed && !mobile ? "justify-center px-2" : "px-4 gap-3"}`}>
        <div className="w-8 h-8 bg-[#0073bb] rounded-lg flex items-center justify-center shrink-0">
          <Car size={16} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">Nova Motors</p>
            <p className="text-xs text-slate-400 truncate">DMS Portal</p>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-slate-400 hover:text-white transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {visibleNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            title={collapsed && !mobile ? label : undefined}
            className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors group relative ${
              collapsed && !mobile ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
            } ${
              isActive(href)
                ? "bg-[#0073bb] text-white"
                : "text-slate-400 hover:text-white hover:bg-white/8"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {(!collapsed || mobile) && <span>{label}</span>}
            {collapsed && !mobile && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                {label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User + actions */}
      <div className="border-t border-white/10 p-2 shrink-0">
        {(!collapsed || mobile) ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${roleColor[user?.role || "sales"] ?? "bg-slate-500"}`}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={initials} className="w-8 h-8 rounded-full object-cover" />
                ) : initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.fullName ?? "User"}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role ?? "staff"}</p>
              </div>
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
            >
              <ExternalLink size={16} />
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${roleColor[user?.role || "sales"] ?? "bg-slate-500"}`}>
                {initials}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex justify-center w-full py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full">
            <SidebarContent mobile />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 left-64 ml-2 z-10 bg-white rounded-full p-1 shadow"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden bg-[#0f172a] text-white px-4 h-14 flex items-center justify-between shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-md hover:bg-white/10">
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm">Nova Motors DMS</span>
          <button onClick={handleLogout} className="p-2 rounded-md hover:bg-white/10">
            <LogOut size={18} />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
