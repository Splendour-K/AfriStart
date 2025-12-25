import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Rocket } from "lucide-react";

const roles = [
  {
    title: "Community Lead (Remote, Africa)",
    summary: "Grow and support student founder communities across campuses.",
  },
  {
    title: "Growth Intern (Remote)",
    summary: "Experiment with acquisition channels and refine messaging to reach student founders.",
  },
  {
    title: "Product Design Intern (Remote)",
    summary: "Craft delightful flows for matching, messaging, and goal tracking.",
  },
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-primary">Careers</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Join us in empowering African builders.</h1>
            <p className="text-muted-foreground">
              We are a remote-first team across Africa. Passionate about students, startups, and collaboration? Let's talk.
            </p>
          </div>

          <div className="space-y-4">
            {roles.map((role) => (
              <Card key={role.title} className="shadow-soft">
                <CardHeader>
                  <CardTitle>{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">{role.summary}</p>
                  <Button variant="outline" asChild>
                    <a href="mailto:talent@splennet.com?subject=Role%20Application:%20AfriStart">Apply via email</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-soft">
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">Don't see your role?</p>
                <p className="text-muted-foreground">We love meeting builders. Send us your portfolio and what you'd like to work on.</p>
              </div>
              <Button asChild>
                <a href="mailto:talent@splennet.com?subject=Open%20Application">Reach out</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
