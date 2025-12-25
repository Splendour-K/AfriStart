import { Brain, Shield, MessageSquare, Target, BookOpen, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Intelligent Matching",
    description: "Our AI-powered algorithm analyzes skills, interests, and goals to find your ideal co-founder match.",
    color: "terracotta",
  },
  {
    icon: Shield,
    title: "University Verified",
    description: "All members are verified university students, ensuring a trusted and authentic community.",
    color: "forest",
  },
  {
    icon: MessageSquare,
    title: "Seamless Communication",
    description: "Built-in messaging and video calls make it easy to connect and collaborate with potential partners.",
    color: "ochre",
  },
  {
    icon: Target,
    title: "Accountability Partners",
    description: "Set goals, track progress, and stay motivated with built-in accountability features.",
    color: "terracotta",
  },
  {
    icon: BookOpen,
    title: "Learning Resources",
    description: "Access curated content on startup building, from ideation to scaling your business.",
    color: "forest",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor your startup journey with intuitive dashboards and milestone tracking.",
    color: "ochre",
  },
];

const FeaturesSection = () => {
  return (
  <section id="features" className="py-16 sm:py-24 bg-gradient-to-b from-background via-card to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-ochre/10 text-ochre text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="text-gradient-warm">Build & Grow</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful tools designed to help African university students connect, collaborate, and succeed.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-card rounded-2xl p-8 border border-border/50 hover:border-terracotta/30 transition-all duration-300 hover:shadow-warm overflow-hidden"
            >
              {/* Background Decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${
                feature.color === 'terracotta' ? 'bg-terracotta' :
                feature.color === 'ochre' ? 'bg-ochre' : 'bg-forest'
              }`} />

              {/* Icon */}
              <div className={`relative w-14 h-14 rounded-xl mb-6 flex items-center justify-center ${
                feature.color === 'terracotta' ? 'bg-terracotta/10' :
                feature.color === 'ochre' ? 'bg-ochre/10' : 'bg-forest/10'
              }`}>
                <feature.icon className={`w-7 h-7 ${
                  feature.color === 'terracotta' ? 'text-terracotta' :
                  feature.color === 'ochre' ? 'text-ochre' : 'text-forest'
                }`} />
              </div>

              {/* Content */}
              <h3 className="relative font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="relative text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
