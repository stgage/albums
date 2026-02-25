import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Disc3,
  Plus,
  ListOrdered,
  LogOut,
  Settings,
} from "lucide-react";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-white/5 flex flex-col fixed inset-y-0 left-0 bg-surface-1">
        <div className="p-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center">
              <Disc3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              Sam&apos;s Albums
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/admin/albums/new", icon: Plus, label: "Add Album" },
            { href: "/admin/albums", icon: Disc3, label: "Manage Albums" },
            { href: "/admin/rankings", icon: ListOrdered, label: "Rankings" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen">{children}</main>
    </div>
  );
}
