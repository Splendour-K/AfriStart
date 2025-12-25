import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, Search, Sparkles } from "lucide-react";

const posts = [
  {
    title: "Finding the right co-founder while in university",
    summary: "How African students are matching on AfriStart and what makes a strong pairing.",
    tag: "Guides",
    minutes: "6 min read",
    url: "https://www.ycombinator.com/library/4J-how-to-find-a-co-founder",
    date: "2024-11-03",
  },
  {
    title: "From idea to MVP: playbook for campus builders",
    summary: "A lightweight process to validate and ship your first version with limited resources.",
    tag: "Product",
    minutes: "8 min read",
    url: "https://www.ycombinator.com/library/6q-a-simple-guide-to-building-products",
    date: "2024-10-10",
  },
  {
    title: "Stories from the community",
    summary: "Early teams formed on AfriStart share what worked and what didn't.",
    tag: "Community",
    minutes: "5 min read",
    url: "https://www.firstround.com/review/10-lessons-from-successful-founder-pairs/",
    date: "2024-09-15",
  },
  {
    title: "Fundraising sanity checklist for first-time founders",
    summary: "What African student founders should prepare before first investor conversations.",
    tag: "Fundraising",
    minutes: "7 min read",
    url: "https://www.ycombinator.com/library/4H-how-to-raise-a-seed-round",
    date: "2024-08-01",
  },
];

export default function Blog() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const tags = useMemo(() => Array.from(new Set(posts.map((post) => post.tag))), []);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesQuery =
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.summary.toLowerCase().includes(query.toLowerCase());
        const matchesTag = !activeTag || post.tag === activeTag;
        return matchesQuery && matchesTag;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [query, activeTag]);

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Add your email",
        description: "We'll only send occasional founder updates.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Subscribed",
      description: "You're on the list. Expect the next drop soon!",
    });
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-primary">Blog</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Insights for African student founders.</h1>
            <p className="text-muted-foreground">Fresh stories and playbooks for African student founders.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by topic or keyword"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeTag === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveTag(null)}
              >
                All
              </Badge>
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={activeTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {filteredPosts.map((post, index) => (
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
                  <p className="text-sm text-muted-foreground mb-3">{post.summary}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(post.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    {index === 0 && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Sparkles className="h-3 w-3" />
                        New
                      </span>
                    )}
                  </div>
                  <Button asChild variant="link" className="px-0 mt-2">
                    <a href={post.url} target="_blank" rel="noreferrer">
                      Read article →
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-soft">
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">Newsletter</p>
                <h3 className="text-xl font-display font-semibold">Get the AfriStart founder digest</h3>
                <p className="text-muted-foreground text-sm">Actionable stories, resources, and product drops. No spam.</p>
              </div>
              <form onSubmit={handleSubscribe} className="flex w-full flex-col gap-2 md:flex-row md:w-auto">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="whitespace-nowrap">Subscribe</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
