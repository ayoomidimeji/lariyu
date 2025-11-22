import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.jpg";

interface NavbarProps {
  cartItemsCount?: number;
}

const Navbar = ({ cartItemsCount = 0 }: NavbarProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="L'Riyu - Steps that suit you"
              className="h-12 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-luxury relative ${isActive(link.path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
                  }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold" />
                )}
              </Link>
            ))}
          </div>

          {/* Cart & User Actions */}
          <div className="flex items-center space-x-4">
            {user && isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
            )}

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-gold-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-luxury ${isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
