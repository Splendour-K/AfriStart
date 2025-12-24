import { Link } from "react-router-dom";
import { Mail, MapPin, Linkedin, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "How It Works", path: "/#how-it-works" },
      { name: "Features", path: "/#features" },
      { name: "Pricing", path: "/pricing" },
      { name: "FAQ", path: "/faq" },
    ],
    company: [
      { name: "About Us", path: "/about" },
      { name: "Careers", path: "/careers" },
      { name: "Blog", path: "/blog" },
      { name: "Contact", path: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Cookie Policy", path: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/splennet", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/splennet", label: "LinkedIn" },
    { icon: Instagram, href: "https://instagram.com/splennet", label: "Instagram" },
  ];

  return (
    <footer className="bg-earth text-cream ankara-pattern">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">S</span>
              </div>
              <span className="font-display font-bold text-xl text-cream">Splennet</span>
            </Link>
            <p className="text-cream/70 max-w-xs mb-6 leading-relaxed">
              Empowering African university students to connect, collaborate, and build the future of innovation together.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-terracotta transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={18} className="text-cream" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-display font-semibold text-cream mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-cream/70 hover:text-ochre transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-semibold text-cream mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-cream/70 hover:text-ochre transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-display font-semibold text-cream mb-4">Contact</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-cream/70 text-sm">
                <Mail size={16} />
                <a href="mailto:hello@splennet.com" className="hover:text-ochre transition-colors">
                  hello@splennet.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-cream/70 text-sm">
                <MapPin size={16} />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
            <h4 className="font-display font-semibold text-cream mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-cream/70 hover:text-ochre transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/50 text-sm">
            © {currentYear} Splennet. All rights reserved.
          </p>
          <p className="text-cream/50 text-sm">
            Made with ❤️ for African innovators
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
