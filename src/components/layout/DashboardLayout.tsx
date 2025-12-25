import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useUnreadCount } from "@/hooks/useMessaging";
import NotificationsDropdown from "./NotificationsDropdown";
import { 
  Home, 
  Users, 
  Compass, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  LogOut,
  Search,
  Menu,
  X,
  Lightbulb,
  Target,
  Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

const DashboardLayout = ({ children, title, subtitle, headerActions }: DashboardLayoutProps) => {
  const { profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: unreadCount } = useUnreadCount();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "discover", label: "Discover", icon: Compass, path: "/discover" },
    { id: "connections", label: "Connections", icon: Users, path: "/connections" },
    { id: "groups", label: "Groups", icon: Users, path: "/groups" },
    { id: "ideas", label: "My Ideas", icon: Lightbulb, path: "/ideas" },
    { id: "goals", label: "Goals", icon: Target, path: "/goals" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/messages" },
    { id: "resources", label: "Resources", icon: BookOpen, path: "/resources" },
    { id: "profile", label: "Profile", icon: Settings, path: "/profile" },
    ...(isAdmin
      ? [{ id: "admin", label: "Admin", icon: Shield, path: "/admin/messages" }]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center shadow-warm">
              <span className="text-primary-foreground font-display font-bold text-xl">A</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">AfriStart</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-terracotta/10 text-terracotta"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.id === "messages" && unreadCount && unreadCount > 0 && (
                    <span className="ml-auto bg-terracotta text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
              <span className="text-primary-foreground font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                {profile?.full_name || 'User'}
                {isAdmin && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Admin</span>}
              </p>
              <p className="text-xs text-muted-foreground truncate">{profile?.university || 'University'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-warm flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold">A</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground">AfriStart</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationsDropdown className="-mr-2" />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg animate-slide-up">
            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive(item.path)
                          ? "bg-terracotta/10 text-terracotta"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-muted-foreground" 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border mt-14 lg:mt-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              {title && (
                <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {headerActions}
              <div className="relative w-64 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 bg-background"
                />
              </div>
              <NotificationsDropdown className="hidden lg:flex" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} AfriStart. Empowering African Innovators.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
