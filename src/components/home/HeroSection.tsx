import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 ankara-diamond opacity-50" />
      
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-10 w-64 h-64 bg-terracotta/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-ochre/10 rounded-full blur-3xl animate-float delay-300" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-forest/10 rounded-full blur-3xl animate-float delay-500" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta/10 border border-terracotta/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-terracotta" />
            <span className="text-sm font-medium text-terracotta">Empowering African Innovators</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up leading-tight">
            Find Your Perfect{" "}
            <span className="text-gradient-warm">Co-Founder</span>
            <br />
            Build Africa's Future
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-200 leading-relaxed">
            Connect with ambitious university students across Africa. Discover compatible co-founders, 
            stay accountable, and transform your startup ideas into thriving businesses.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-300">
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/#how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="animate-slide-up delay-400">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-ochre border-2 border-background flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 text-primary-foreground" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">2,500+ Students</p>
                <p className="text-sm text-muted-foreground">from 50+ universities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            className="fill-card"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
