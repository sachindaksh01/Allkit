"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, Search, Sun, Moon, Laptop, X } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from '@/components/ui/navigation-menu';
import { Logo } from "@/components/Logo";

const toolsCategories = [
  {
    title: "Media Tools",
    items: [
      {
        title: "Image Tools",
        href: "/tools/image-tools",
        description: "Edit, convert, and optimize your images",
        items: [
          {
            title: "Background Remover",
            href: "/bgremover",
            description: "Remove background from images"
          }
        ]
      },
      {
        title: "Video Processing",
        href: "/tools/video-processing-tools",
        description: "Convert and process video files"
      },
      {
        title: "Audio Processing",
        href: "/tools/audio-processing-tools",
        description: "Edit and convert audio files"
      }
    ]
  },
  {
    title: "Document Tools",
    items: [
      {
        title: "PDF Tools",
        href: "/tools/pdf-tools",
        description: "Edit and convert PDF documents"
      },
      {
        title: "Document Convert",
        href: "/tools/document-convert",
        description: "Convert between document formats"
      }
    ]
  },
  {
    title: "Development Tools",
    items: [
      {
        title: "Code & Dev Tools",
        href: "/tools/code-and-dev-tools",
        description: "Tools for developers"
      },
      {
        title: "Text & String Tools",
        href: "/tools/text-and-string-tools",
        description: "Manipulate and format text"
      },
      {
        title: "Data Converters",
        href: "/tools/data-converters",
        description: "Convert between data formats"
      }
    ]
  },
  {
    title: "Utility Tools",
    items: [
      {
        title: "Network & Web Tools",
        href: "/tools/network-and-web-tools",
        description: "Network utilities and web tools"
      },
      {
        title: "Security & Crypto",
        href: "/tools/security-and-crypto-tools",
        description: "Security and cryptography tools"
      },
      {
        title: "QR & Barcode",
        href: "/tools/qr-and-barcode-tools",
        description: "Generate and scan QR codes"
      },
      {
        title: "Calculators",
        href: "/tools/calculators-and-converters",
        description: "Various calculators and converters"
      }
    ]
  }
]

export function Header() {
  const [megaMenuOpen, setMegaMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const menuWrapperRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menus on route change
  React.useEffect(() => {
    const handler = () => {
      setMegaMenuOpen(false);
      setIsMobileMenuOpen(false);
      setIsSearchOpen(false);
    };
    window.addEventListener('hashchange', handler);
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('hashchange', handler);
      window.removeEventListener('popstate', handler);
    };
  }, []);

  // Click outside and Escape key to close
  React.useEffect(() => {
    if (!megaMenuOpen && !isMobileMenuOpen && !isSearchOpen) return;
    
    function handleClick(e: MouseEvent) {
      if (menuWrapperRef.current && !menuWrapperRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    }
    
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMegaMenuOpen(false);
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [megaMenuOpen, isMobileMenuOpen, isSearchOpen]);

  // Focus search input when search is opened
  React.useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center min-w-[120px]">
          <Link href="/" className="flex items-center space-x-2" aria-label="AllKit Home">
            <Logo color={useTheme().theme === 'dark' ? '#fff' : '#0E0E0E'} height={24} />
          </Link>
        </div>
        {/* Center: Navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-6 text-sm font-medium absolute left-1/2 top-0 h-16 -translate-x-1/2">
          <Link href="/" className="transition-colors hover:text-foreground/80">
            Home
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9">Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="absolute left-1/2 -translate-x-1/2 z-50 w-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-6 min-w-[700px] max-w-[90vw] bg-popover rounded-xl shadow-xl border border-border">
                      {toolsCategories.map((cat) => (
                        <div key={cat.title}>
                          <div className="font-bold mb-2 text-base">{cat.title}</div>
                          <ul className="space-y-1">
                            {cat.items.map((item) => (
                              <li key={item.title}>
                                <NavigationMenuLink asChild>
                                  <Link 
                                    href={item.href} 
                                    className="block px-2 py-1 rounded hover:bg-accent transition-colors"
                                    onClick={() => setMegaMenuOpen(false)}
                                  >
                                    <div className="font-medium text-sm">{item.title}</div>
                                    <div className="text-xs text-muted-foreground">{item.description}</div>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Link href="/why-free" className="transition-colors hover:text-foreground/80">
            Why Free
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2">
                Resources
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem asChild>
                <Link href="/docs" className="w-full cursor-pointer">
                  Documentation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/api" className="w-full cursor-pointer">
                  API Reference
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        {/* Right: Search + Theme Toggle */}
        <div className="flex items-center gap-2 min-w-[220px] justify-end flex-shrink-0 ml-auto">
          {/* Search */}
          <div className="relative">
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
            ) : (
              <div className="relative w-[200px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search tools..."
                  className="pl-8 w-full"
                  aria-label="Search tools"
                />
              </div>
            )}
            {/* Mobile Search Overlay */}
            {isMobile && isSearchOpen && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
                <div className="container flex items-center h-16">
                  <div className="relative w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search tools..."
                      className="pl-8 w-full"
                      aria-label="Search tools"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
          {/* Theme Toggle */}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
} 