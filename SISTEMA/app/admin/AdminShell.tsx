"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heading, Button } from "@/components/ui";

function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <Button type="button" variant="subtle" className="w-full" onClick={handleLogout}>
      Log out
    </Button>
  );
}

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/journal", label: "Journal" },
  { href: "/admin/legal", label: "Legal" },
  { href: "/admin/site-settings", label: "Site Text" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/users", label: "Users" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const isForbidden = pathname === "/admin/forbidden";

  if (isLogin || isForbidden) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-stone flex">
      <aside className="w-56 border-r border-charcoal/10 flex flex-col">
        <div className="p-6 border-b border-charcoal/10">
          <Heading as="h1" level={4} className="text-charcoal">
            Admin
          </Heading>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-sans text-sm uppercase tracking-[0.15em] px-4 py-2 rounded transition-colors ${
                pathname === item.href
                  ? "bg-charcoal/10 text-charcoal"
                  : "text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-charcoal/10">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
