import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";
import logo from "@/assets/no-bg-logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <img
              src={logo}
              alt="L'Riyu - Steps that suit you"
              className="h-16 w-auto object-contain mb-4"
            />
            <p className="text-xs text-primary-foreground/60 mt-2">
              Handcrafted luxury shoes with Italian elegance
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-luxury"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-luxury"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-luxury"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-luxury"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-primary-foreground/80">Size Guide</li>
              <li className="text-primary-foreground/80">Shipping Info</li>
              <li className="text-primary-foreground/80">Returns</li>
              <li className="text-primary-foreground/80">Care Instructions</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-gold transition-luxury"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-gold transition-luxury"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-gold transition-luxury"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} L'Riyu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
