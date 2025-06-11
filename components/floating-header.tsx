"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Diamond, ExternalLink, Menu, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavigationItem {
  value: string;
  label: string;
  href: string;
  external?: boolean;
  icon?: React.ReactNode;
}

export function FloatingHeader() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [activeLink, setActiveLink] = useState("create-vote");
  const [walletConnected, setWalletConnected] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Update active link based on current pathname
  useEffect(() => {
    if (pathname === "/") {
      setActiveLink("create-vote");
    } else if (pathname === "/implement") {
      setActiveLink("implement");
    } else if (pathname === "/participate") {
      setActiveLink("participate");
    } else if (pathname === "/explorer") {
      setActiveLink("explorer");
    }
  }, [pathname]);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scrolling down and past 100px
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);

  const navigationItems: NavigationItem[] = [
    { value: "create-vote", label: "Create a Vote", href: "/" },
    { value: "explorer", label: "Explorer", href: "/explorer" },
    { value: "implement", label: "Implement DAVINCI", href: "/implement" },
    { value: "participate", label: "Participate", href: "/participate" },
    {
      value: "about",
      label: "About",
      href: "https://davinci.vote",
      external: true,
    },
    {
      value: "whitepaper",
      label: "Whitepaper",
      href: "https://whitepaper.vocdoni.io",
      external: true,
    },
  ];

  const handleLinkClick = (value: string, href: string, external?: boolean) => {
    setActiveLink(value);
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  };

  const handleConnectWallet = () => {
    setWalletConnected(!walletConnected);
  };

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Card className="bg-davinci-paper-base/95 backdrop-blur-md border border-davinci-callout-border/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/images/davinci-logo.png"
              alt="DAVINCI"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:block">
            <nav className="flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() =>
                    handleLinkClick(item.value, item.href, item.external)
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-1 ${
                    activeLink === item.value
                      ? "bg-davinci-soft-neutral text-davinci-black-alt"
                      : "text-davinci-black-alt hover:text-davinci-black-alt hover:bg-davinci-soft-neutral/50"
                  }`}
                >
                  {item.label}
                  {item.icon && item.icon}
                  {item.external && <ExternalLink className="w-3 h-3" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-davinci-callout-border"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-davinci-paper-base">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <button
                      key={item.value}
                      onClick={() =>
                        handleLinkClick(item.value, item.href, item.external)
                      }
                      className={`flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeLink === item.value
                          ? "bg-davinci-soft-neutral text-davinci-black-alt"
                          : "text-davinci-black-alt hover:text-davinci-black-alt hover:bg-davinci-soft-neutral/50"
                      }`}
                    >
                      {item.label}
                      {item.icon && item.icon}
                      {item.external && <ExternalLink className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Connect Wallet Button */}
          <div className="w-40 flex justify-end">
            <Button
              className="bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base whitespace-nowrap"
              onClick={handleConnectWallet}
            >
              {walletConnected ? (
                <>
                  <Diamond className="w-4 h-4 mr-2" />
                  <span>johndoe.eth</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
