import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const posts = [
  {
    title: "Finding the right co-founder while in university",
    summary: "How African students are matching on AfriStart and what makes a strong pairing.",
    tag: "Guides",
    minutes: "6 min read",
  },
  {
    title: "From idea to MVP: playbook for campus builders",
    summary: "A lightweight process to validate and ship your first version with limited resources.",
    tag: "Product",
    minutes: "8 min read",
  },
  {
    title: "Stories from the community",
    summary: "Early teams formed on AfriStart share what worked and what didn't.",
    tag: "Community",
    minutes: "5 min read",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-primary">Blog</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Insights for African student founders.</h1>
            <p className="text-muted-foreground">Fresh stories and playbooks. Full archive coming soon.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.title} className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{post.tag}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{post.minutes}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{post.summary}</p>
                  <p className="text-xs text-primary mt-4">Full post coming soon</p>
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
