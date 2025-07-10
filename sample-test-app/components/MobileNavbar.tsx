"use client";

import Link from "next/link";
import { ShoppingCart, Heart, Home, Search, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { usePathname } from "next/navigation";

export default function MobileNavbar() {
  const totalQty = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.quantity, 0)
  );
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/shop", icon: Search },
    { label: "Cart", href: "/cart", icon: ShoppingCart, badge: totalQty },
    { label: "Favorites", href: "/favorites", icon: Heart },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="mobile-nav md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item touch-target ${isActive ? 'active' : ''}`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
