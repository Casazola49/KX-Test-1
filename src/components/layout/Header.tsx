
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Logo from '@/components/shared/Logo';
import MobileMenu from '@/components/layout/MobileMenu';
import { NAVIGATION_LINKS } from '@/lib/constants';
import type { NavItem as NavItemType } from '@/lib/types';
import { AnimatedHamburgerIcon } from '@/components/icons/AnimatedHamburgerIcon';
import { ChevronDown, Sun, Moon, LogIn, LogOut, UserCog } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from 'next-themes';
import Cookies from 'js-cookie';

const NavItemDesktop: React.FC<{ item: NavItemType }> = ({ item }) => {
  if (item.subItems && item.subItems.length > 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            {item.label}
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background border-border">
          {item.subItems.map((subItem) => (
            <DropdownMenuItem key={subItem.label} asChild>
              <Link href={subItem.href} className="text-sm hover:text-primary transition-colors">
                {subItem.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link href={item.href} passHref>
      <Button variant="ghost" className="text-sm font-medium hover:text-primary transition-colors">
        {item.label}
      </Button>
    </Link>
  );
};

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const checkAuth = () => {
      const token = Cookies.get('admin-token');
      setIsAuthenticated(!!token);
    };

    // Initial check
    checkAuth();

    // The login/logout pages will redirect and refresh the page, which will cause this component to remount
    // and re-check the cookie. This is a simple but effective way to sync the state.
    // For more complex apps, a global state (Context) or a 'storage' event listener could be used.

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [router]); // Re-checking on router changes can help sync state after navigation

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    Cookies.remove('admin-token'); // Immediately remove cookie from client
    setIsAuthenticated(false);
    router.push('/');
    router.refresh();
  };
  
  const AdminButton = () => {
    if (!mounted) return null;

    if (isAuthenticated) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/news">
                        <UserCog className="mr-2 h-4 w-4" /> Panel
                    </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Salir
                </Button>
            </div>
        )
    }

    return (
        <Button variant="outline" size="sm" asChild>
            <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Admin
            </Link>
        </Button>
    )
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full h-20 bg-transparent">
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
            <div className="flex-1"></div>
            <div className="flex-1 text-center"><Logo /></div>
            <div className="flex-1"></div>
        </div>
      </header>
    );
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-lg shadow-lg border-b border-border' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <div className="md:hidden">
          <AnimatedHamburgerIcon open={isMobileMenuOpen} toggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        </div>
        
        <div className="hidden md:flex md:flex-1 md:justify-start">
          <Logo />
        </div>

        <nav className="hidden md:flex md:justify-center space-x-1 items-center">
          {NAVIGATION_LINKS.map((item) => (
            <NavItemDesktop key={item.label} item={item} />
          ))}
        </nav>
        
        <div className="flex items-center gap-2 md:flex-1 md:justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}
            className="h-9 w-9"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {/* Ocultamos el botón de Admin para usuarios públicos. El componente se mantiene para acceso directo vía URL. */}
          <div className="hidden">
            <AdminButton />
          </div>
        </div>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
    </header>
  );
};

export default Header;
