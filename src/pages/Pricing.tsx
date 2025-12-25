import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For students exploring collaborators",
    features: [
      "Co-founder matching",
      "Messaging",
      "Goals tracking",
      "Resource library",
    ],
    cta: "Get started",
  },
  {
    name: "Growth",
    price: "$9 / mo",
    description: "For teams ready to move faster",
    features: [
      "Everything in Starter",
      "Priority matching",
      "Advanced analytics",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start free trial",
  },
  {
    name: "Campus",
    price: "Contact us",
    description: "For university programs & hubs",
    features: [
      "Custom onboarding",
      "Reporting & oversight",
      "Integration support",
      "Dedicated success manager",
    ],
    cta: "Talk to us",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-10">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h1 className="text-3xl font-display font-bold text-foreground">Simple plans for builders.</h1>
          <p className="text-muted-foreground">Choose a plan that fits your team. Start free, upgrade when you're ready.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`shadow-soft h-full ${plan.highlighted ? 'border-primary' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  {plan.highlighted && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Popular</span>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-display font-bold text-foreground">{plan.price}</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlighted ? "default" : "outline"} className="w-full">
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
