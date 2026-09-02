import Link from "next/link";
import { Camera, Calendar, Frame, Grid3X3, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { LogoutButton } from "@/components/admin/LogoutButton";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/layouts", label: "Layouts", icon: Grid3X3 },
  { href: "/admin/frames", label: "Frames", icon: Frame },
  { href: "/admin", label: "Settings", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f2eb] text-ink md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-b border-black/10 bg-white px-4 py-4 md:min-h-screen md:border-b-0 md:border-r">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-md bg-ink p-2 text-white"><Camera size={20} /></div>
          <div>
            <div className="font-serif text-xl">AWH</div>
            <div className="text-xs uppercase tracking-wide text-black/50">Virtual Photobooth</div>
          </div>
        </div>
        <nav className="grid gap-1">
          {items.map((item) => (
            <Link key={item.label} href={item.href} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-linen">
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          <LogoutButton>
            <LogOut size={18} />
          </LogoutButton>
        </nav>
      </aside>
      <main className="p-5 md:p-8">{children}</main>
    </div>
  );
}
