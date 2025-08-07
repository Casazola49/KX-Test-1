
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import { NAVIGATION_LINKS } from '@/lib/constants';
import type { NavItem as NavItemType } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronDown } from 'lucide-react';
import { AnimatedHamburgerIcon } from '@/components/icons/AnimatedHamburgerIcon';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, setIsOpen }) => {
  
  const NavItem: React.FC<{ item: NavItemType; onLinkClick: () => void }> = ({ item, onLinkClick }) => {
    if (item.subItems) {
      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={item.label} className="border-b-0">
            <AccordionTrigger className="text-lg font-medium py-3 hover:no-underline transition-colors w-full justify-between text-foreground">
              {item.label}
              <ChevronDown className="h-5 w-5 transition-transform duration-200 accordion-chevron" />
            </AccordionTrigger>
            <AccordionContent className="pl-4">
              <ul>
                {item.subItems.map((subItem) => (
                  <li key={subItem.label}>
                    <Link href={subItem.href} passHref>
                      <SheetClose asChild>
                        <Button variant="ghost" className="text-md text-muted-foreground w-full justify-start px-0 py-2" onClick={onLinkClick}>
                          {subItem.label}
                        </Button>
                      </SheetClose>
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }
    return (
      <Link href={item.href} passHref>
        <SheetClose asChild>
          <Button variant="ghost" className="text-lg font-medium w-full justify-start px-0 py-3 text-foreground" onClick={onLinkClick}>
            {item.label}
          </Button>
        </SheetClose>
      </Link>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] bg-background p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle>
            <Logo />
            <span className="sr-only">KartXperience Bolivia Menú</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Menú de navegación principal
          </SheetDescription>
        </SheetHeader>
        <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
          <ul>
            {NAVIGATION_LINKS.map((item) => (
              <li key={item.label} className="border-b border-border last:border-b-0">
                <NavItem item={item} onLinkClick={() => setIsOpen(false)} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} KartXperience Bolivia. Todos los derechos reservados.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
