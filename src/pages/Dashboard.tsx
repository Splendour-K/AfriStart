import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Compass, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Target,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "discover", label: "Discover", icon: Compass },
    { id: "connections", label: "Connections", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const recentMatches = [
    { name: "Ade Johnson", role: "Tech/Engineering", university: "University of Lagos", match: 92 },
    { name: "Fatima Ali", role: "Marketing/Sales", university: "University of Cape Town", match: 88 },
    { name: "Kofi Mensah", role: "Finance/Operations", university: "University of Ghana", match: 85 },
  ];

  const upcomingGoals = [
    { title: "Complete MVP wireframes", dueDate: "Dec 28", status: "in-progress" },
    { title: "Finalize pitch deck", dueDate: "Jan 2", status: "pending" },
    { title: "Schedule mentor meeting", dueDate: "Jan 5", status: "pending" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center shadow-warm">
              <span className="text-primary-foreground font-display font-bold text-xl">S</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">Splennet</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? "bg-terracotta/10 text-terracotta"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Amara Obi</p>
              <p className="text-xs text-muted-foreground truncate">University of Nairobi</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search co-founders, resources..."
              className="pl-10 bg-background"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-muted">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-terracotta rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center lg:hidden">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Welcome back, Amara! 👋
            </h1>
            <p className="text-muted-foreground">
              Ready to find your perfect co-founder today?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-terracotta" />
                </div>
                <span className="text-xs font-medium text-forest bg-forest/10 px-2 py-1 rounded-full">
                  +12% this week
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground mb-1">156</p>
              <p className="text-sm text-muted-foreground">Potential Matches</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-ochre/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-ochre" />
                </div>
                <span className="text-xs font-medium text-terracotta bg-terracotta/10 px-2 py-1 rounded-full">
                  2 due soon
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground mb-1">8</p>
              <p className="text-sm text-muted-foreground">Active Goals</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-forest" />
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-foreground mb-1">85%</p>
              <p className="text-sm text-muted-foreground">Profile Completion</p>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Matches */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-soft">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Top Co-Founder Matches
                </h2>
                <Link to="/discover" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {recentMatches.map((match, index) => (
                  <div key={index} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">
                        {match.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{match.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {match.role} • {match.university}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-forest/10 text-forest text-sm font-medium">
                        {match.match}% match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="bg-card rounded-2xl border border-border shadow-soft">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Upcoming Goals
                </h2>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="p-4 space-y-3">
                {upcomingGoals.map((goal, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-foreground">{goal.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        goal.status === 'in-progress' 
                          ? 'bg-ochre/10 text-ochre' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {goal.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Due: {goal.dueDate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
