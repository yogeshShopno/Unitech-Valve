'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Factory, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Quotations', href: '/quotations', icon: FileText },
  { name: 'Proforma Invoice', href: '/proforma-invoices', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart },
  { name: 'Sales Party', href: '/clients', icon: Users },
  { name: 'Purchase Party', href: '/purchase-parties', icon: Users },
  { name: 'Purchase Order', href: '/purchase-orders', icon: FileText },
  { name: 'Items', href: '/products', icon: Package },
  { name: 'Master', href: '/master', icon: Settings },
  // { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
       document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // Redirect to login
   router.push('/login')
      // await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}admin/logout`, {
      //   method: 'POST',
      //   credentials: 'include',
      // });
      // // Force redirect to login to clear all client-side state and ensure middleware hit
      // window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="flex flex-col h-screen w-64 fixed left-0 top-0 border-r border-surface-container-high bg-surface-container-low font-headline text-sm font-semibold uppercase">
      <div className="px-6 py-8 flex flex-col gap-1">
        <div className="w-12 h-12 bg-primary mb-4 flex items-center justify-center">
          <Factory className="text-white w-6 h-6" />
        </div>
        <div className="text-lg font-black text-on-surface tracking-tighter">The Digital Foreman</div>
        <div className="text-[10px] text-secondary tracking-widest">Engineering Precision</div>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-all",
                isActive 
                  ? "bg-surface-container-lowest text-primary border-l-4 border-primary" 
                  : "text-secondary hover:bg-surface-container-high"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 mb-4">
        <Link 
          href="/quotations/new"
          className="w-full bg-primary text-white py-3 font-bold tracking-tight hover:bg-primary-dim transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          NEW QUOTE
        </Link>
      </div>

      <div className="mt-auto border-t border-surface-container-high p-4 space-y-1">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-secondary hover:text-on-surface transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </aside>
  );
}
