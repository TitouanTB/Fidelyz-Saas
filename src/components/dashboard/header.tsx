"use client";

import { Bell, Search } from "lucide-react";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { useAuthContext } from "@/components/providers/auth-provider";
import { usePathname } from "next/navigation";

export function Header() {
  const { user, isLoading } = useAuthContext();
  const pathname = usePathname();

  // Simple logic to get page title from pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Vue d'ensemble";
    if (pathname.startsWith("/customers")) return "Clients";
    if (pathname.startsWith("/analytics")) return "Analyses";
    if (pathname.startsWith("/settings")) return "Paramètres";
    return "Tableau de bord";
  };

  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20 bg-bg-base/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold font-heading text-text-primary">
          {getPageTitle()}
        </h1>
        <div className="hidden md:flex items-center ml-8">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-violet-default transition-colors" />
            <input
              type="search"
              placeholder="Rechercher..."
              className="pl-9 pr-4 py-1.5 text-xs bg-white/4 border border-white/8 rounded-xl focus:outline-none focus:border-violet-default/50 focus:bg-violet-default/5 focus:ring-4 focus:ring-violet-default/10 text-text-primary w-48 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-xl transition-all">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-violet-default rounded-full shadow-[0_0_10px_rgba(147,23,253,0.5)]" />
        </button>

        {!isLoading && user && <UserDropdown user={user} />}
      </div>
    </header>
  );
}