import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-earth via-earth to-forest" />
      <div className="absolute inset-0 ankara-pattern opacity-30" />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-ochre/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream/10 border border-cream/20 mb-8">
            <Sparkles className="w-4 h-4 text-ochre" />
            <span className="text-sm font-medium text-cream">Join the Movement</span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-6 leading-tight">
            Ready to Find Your Co-Founder and
            <br />
            <span className="text-ochre">Build Something Amazing?</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-cream/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of ambitious African university students who are turning their 
            startup dreams into reality. Your perfect co-founder is waiting.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="accent" size="xl" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              asChild
              className="border-cream/30 text-cream hover:bg-cream/10"
            >
              <Link to="/contact">
                Talk to Us
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-cream/60 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-forest-light" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-forest-light" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>University verified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-forest-light" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
