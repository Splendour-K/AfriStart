import { UserPlus, Search, Handshake, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and build your detailed profile showcasing your skills, interests, and startup ideas.",
    color: "terracotta",
  },
  {
    icon: Search,
    title: "Discover Co-Founders",
    description: "Our intelligent matching connects you with compatible partners from your university and beyond.",
    color: "ochre",
  },
  {
    icon: Handshake,
    title: "Connect & Collaborate",
    description: "Reach out, start conversations, and find the perfect partner who complements your strengths.",
    color: "forest",
  },
  {
    icon: Rocket,
    title: "Build Together",
    description: "Access resources, stay accountable, and turn your shared vision into a successful startup.",
    color: "terracotta",
  },
];

const HowItWorks = () => {
  return (
  <section id="how-it-works" className="py-16 sm:py-24 bg-card ankara-pattern">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-forest/10 text-forest text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Your Journey to Finding the{" "}
            <span className="text-gradient-warm">Perfect Co-Founder</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Four simple steps to connect with like-minded innovators and start building your dream startup.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-terracotta/30 to-ochre/30" />
              )}
              
              <div className="relative bg-background rounded-2xl p-8 shadow-soft hover:shadow-warm transition-all duration-300 hover:-translate-y-2 border border-border/50">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-warm text-primary-foreground flex items-center justify-center font-bold text-sm shadow-warm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
                  step.color === 'terracotta' ? 'bg-terracotta/10' :
                  step.color === 'ochre' ? 'bg-ochre/10' : 'bg-forest/10'
                }`}>
                  <step.icon className={`w-8 h-8 ${
                    step.color === 'terracotta' ? 'text-terracotta' :
                    step.color === 'ochre' ? 'text-ochre' : 'text-forest'
                  }`} />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
