import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Splennet connected me with my co-founder who shares my passion for fintech. Together, we've built a payment solution that's now serving 5,000+ users across Kenya.",
    name: "Amina Okafor",
    role: "Co-Founder, PayQuick",
    university: "University of Nairobi",
    image: null,
  },
  {
    quote: "I was struggling to find someone who understood both technology and agriculture. Splennet's matching helped me find the perfect partner for our agritech startup.",
    name: "Kwame Mensah",
    role: "Co-Founder, FarmConnect",
    university: "University of Ghana",
    image: null,
  },
  {
    quote: "The accountability features kept us on track when things got tough. We went from an idea to a funded startup in just 8 months thanks to Splennet's resources.",
    name: "Fatima Hassan",
    role: "Co-Founder, EduBridge",
    university: "University of Cape Town",
    image: null,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-card to-background ankara-diamond">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-sm font-medium mb-4">
            Success Stories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Hear From Our{" "}
            <span className="text-gradient-warm">Community</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Real stories from African students who found their co-founders and built successful startups.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative bg-background rounded-2xl p-8 shadow-soft hover:shadow-warm transition-all duration-300 border border-border/50"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center shadow-warm">
                  <Quote className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 pt-4 leading-relaxed italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-terracotta">{testimonial.university}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
