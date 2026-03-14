"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  MessageSquare,
  BarChart3,
  Settings,
  CreditCard,
  Globe,
  LogOut,
  Route,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/parcours", label: "Parcours Client", icon: Route },
  { href: "/customers", label: "Clients", icon: Users },
  { href: "/campaigns", label: "Campagnes", icon: Megaphone },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/analytics", label: "Analyses", icon: BarChart3 },
  { href: "/settings/pages", label: "Pages Publiques", icon: Globe },
  { href: "/billing", label: "Facturation", icon: CreditCard },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      data-collapsed={isCollapsed}
      className={cn(
        "glass h-screen flex flex-col fixed left-0 top-0 z-30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-white/5",
        isCollapsed ? "w-20" : "w-[240px]"
      )}
    >
      <div className="h-16 flex items-center px-6 border-b border-white/5 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-default rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(147,23,253,0.3)]">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold font-heading text-text-primary tracking-tight transition-all opacity-100">
              Fidelyz
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : ""}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-violet-default/10 border border-violet-default/20 text-text-primary"
                  : "text-text-secondary border border-transparent hover:bg-white/5 hover:text-text-primary"
              )}
            >
              <Icon size={20} className={cn("shrink-0", isActive ? "text-violet-default" : "text-text-secondary group-hover:text-text-primary")} />
              {!isCollapsed && (
                <span className="truncate opacity-100 transition-opacity">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-2">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors w-full group"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="opacity-100 transition-opacity">Deconnexion</span>}
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-10 rounded-xl hover:bg-white/5 text-text-secondary"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
    </aside>
  );
}
