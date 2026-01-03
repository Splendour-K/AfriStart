import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/#how-it-works" },
    { name: "Features", path: "/#features" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center shadow-warm group-hover:shadow-elevated transition-shadow">
              <span className="text-primary-foreground font-display font-bold text-xl">A</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">AfriStart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                >
                  {profile?.full_name ? `Sign out (${profile.full_name.split(" ")[0]})` : "Sign out"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 text-foreground"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[85%] sm:max-w-sm p-0 border-r border-border/70 bg-background"
            >
              <div className="flex flex-col h-full pt-16">
                <div className="px-6">
                  <Link to="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center shadow-warm">
                      <span className="text-primary-foreground font-display font-bold text-xl">A</span>
                    </div>
                    <span className="font-display font-semibold text-lg text-foreground">AfriStart</span>
                  </Link>
                </div>
                <nav className="flex-1 px-6 py-6 space-y-1 overflow-y-auto">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.name}>
                      <Link
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive(link.path)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="px-6 pb-8 pt-4 border-t border-border space-y-3">
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                            Dashboard
                          </Link>
                        </Button>
                      </SheetClose>
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={async () => {
                          await signOut();
                          setIsMenuOpen(false);
                          navigate("/");
                        }}
                      >
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button variant="outline" asChild className="w-full">
                          <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                            Log In
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="hero" asChild className="w-full">
                          <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                            Get Started
                          </Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
