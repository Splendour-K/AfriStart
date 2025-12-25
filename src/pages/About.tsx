import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Globe, Target, Sparkles } from "lucide-react";

const values = [
  { title: "Community-first", description: "Built for African student founders to find collaborators and thrive.", icon: Users },
  { title: "Practical", description: "Actionable tools: matching, messaging, goals, and resources that move you forward.", icon: Target },
  { title: "Inclusive", description: "Designed for diverse skills and backgrounds—tech, business, design, and more.", icon: Globe },
  { title: "Ambitious", description: "We believe African innovators will lead the next wave of global products.", icon: Sparkles },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-primary">About AfriStart</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Connecting Africa's next generation of founders.</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              AfriStart is a platform for African university students to find co-founders, align on ideas, track goals,
              and launch together. We're building the collaboration layer for the continent's next wave of innovation.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {values.map((value) => (
              <Card key={value.title} className="shadow-soft">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <value.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">{value.title}</h2>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
