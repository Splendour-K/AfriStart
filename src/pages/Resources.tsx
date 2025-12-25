import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Users, 
  Lightbulb, 
  Rocket,
  ExternalLink,
  Search,
  Star,
  Clock,
  TrendingUp
} from "lucide-react";
import { useMemo, useState } from "react";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: "guide" | "video" | "article" | "tool" | "community";
  link: string;
  tags: string[];
  duration?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  featured?: boolean;
}

const resources: Resource[] = [
  {
    id: "1",
    title: "How to Find the Perfect Co-Founder",
    description: "A comprehensive guide on identifying complementary skills, shared values, and vision alignment when searching for a startup co-founder.",
    category: "guide",
  link: "https://www.ycombinator.com/library/4J-how-to-find-a-co-founder",
    tags: ["co-founder", "team building", "startup basics"],
    duration: "15 min read",
    difficulty: "beginner",
    featured: true,
  },
  {
    id: "2",
    title: "Validating Your Startup Idea in African Markets",
    description: "Lean validation tactics with examples from Lagos, Nairobi, and Cairo ecosystems.",
    category: "article",
    link: "https://www.alexanderjarvis.com/30-ways-validate-startup-idea/",
    tags: ["validation", "market research", "Africa"],
    duration: "12 min read",
    difficulty: "beginner",
  },
  {
    id: "3",
    title: "Building MVPs on a Budget",
    description: "Video tutorial on creating minimum viable products using no-code and scrappy stacks.",
    category: "video",
    link: "https://www.youtube.com/watch?v=Zr6kP6B4yC8",
    tags: ["MVP", "product development", "budget"],
    duration: "45 min",
    difficulty: "intermediate",
    featured: true,
  },
  {
    id: "4",
    title: "Fundraising for African Startups",
    description: "Navigate the African VC landscape, understand what investors look for, and learn how to pitch effectively.",
    category: "guide",
  link: "https://paulgraham.com/pe.html",
    tags: ["fundraising", "investors", "pitch deck"],
    duration: "25 min read",
    difficulty: "intermediate",
  },
  {
    id: "5",
    title: "Legal Basics for Student Entrepreneurs",
    description: "Essential legal knowledge for starting a business while in university, including registration, IP, and contracts.",
    category: "article",
  link: "https://www.ycombinator.com/library/6g-legal-and-administrative-considerations-for-startups",
    tags: ["legal", "registration", "intellectual property"],
    duration: "12 min read",
    difficulty: "beginner",
  },
  {
    id: "6",
    title: "African Startup Community Hub",
    description: "Join our vibrant community of student entrepreneurs across Africa to share ideas, get feedback, and find collaborators.",
    category: "community",
    link: "https://twitter.com/AfriStartHQ",
    tags: ["community", "networking", "collaboration"],
    featured: true,
  },
  {
    id: "7",
    title: "No-Code Tools for Rapid Prototyping",
    description: "Master tools like Bubble, Webflow, and Airtable to build functional prototypes without writing code.",
    category: "tool",
  link: "https://www.notion.so/No-Code-Stack-for-Founders-27f60fdf0c494552b5f1b2a1a40fe572",
    tags: ["no-code", "prototyping", "tools"],
    duration: "30 min",
    difficulty: "beginner",
  },
  {
    id: "8",
    title: "Growth Hacking Strategies for Emerging Markets",
  description: "Growth loops and community-led tactics that work in emerging markets with lean budgets.",
    category: "video",
  link: "https://www.youtube.com/watch?v=CBYhVcO4WgI",
    tags: ["growth", "marketing", "Africa"],
    duration: "35 min",
    difficulty: "advanced",
  },
  {
    id: "9",
    title: "Building a Startup While in University",
    description: "Practical advice on balancing academics with entrepreneurship, leveraging university resources, and managing time effectively.",
    category: "guide",
  link: "https://www.ycombinator.com/library/67-how-to-start-a-startup",
    tags: ["university", "time management", "student life"],
    duration: "18 min read",
    difficulty: "beginner",
    featured: true,
  },
  {
    id: "10",
    title: "Financial Planning for Early-Stage Startups",
    description: "Create financial projections, manage cash flow, and understand key metrics every founder should track.",
    category: "article",
    link: "https://a16z.com/the-only-metrics-that-really-matter/",
    tags: ["finance", "projections", "metrics"],
    duration: "20 min read",
    difficulty: "intermediate",
  },
  {
    id: "11",
    title: "Pitch Deck Template for African Founders",
    description: "A lean, investor-friendly deck structure tailored for early-stage African startups.",
    category: "tool",
    link: "https://docs.google.com/presentation/d/1n4qhhEDVYy8Wc46Rt9YHZ4MoI4Qh4FGELjQkBz-_U6Y/copy",
    tags: ["pitch", "deck", "investors"],
    duration: "Copy template",
    difficulty: "beginner",
    featured: true,
  },
  {
    id: "12",
    title: "Customer Discovery Script",
    description: "Battle-tested interview questions to uncover real problems and willingness to pay.",
    category: "guide",
    link: "https://www.notion.so/Customer-Discovery-Script-d8c10c9d86af4f0db9b0d0d1c8f48dd2",
    tags: ["customer discovery", "interviews", "validation"],
    duration: "10 min read",
    difficulty: "beginner",
  },
];

const categoryIcons: Record<Resource["category"], React.ReactNode> = {
  guide: <BookOpen className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  article: <FileText className="h-5 w-5" />,
  tool: <Lightbulb className="h-5 w-5" />,
  community: <Users className="h-5 w-5" />,
};

const categoryColors: Record<Resource["category"], string> = {
  guide: "bg-blue-500/10 text-blue-500",
  video: "bg-red-500/10 text-red-500",
  article: "bg-green-500/10 text-green-500",
  tool: "bg-yellow-500/10 text-yellow-500",
  community: "bg-purple-500/10 text-purple-500",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-500",
  intermediate: "bg-yellow-500/10 text-yellow-500",
  advanced: "bg-red-500/10 text-red-500",
};

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(
    () => Array.from(new Set(resources.flatMap((resource) => resource.tags))).sort(),
    []
  );

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeTab === "all" || resource.category === activeTab;
    const matchesTag = !activeTag || resource.tags.includes(activeTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  const featuredResources = resources.filter((r) => r.featured);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground mt-1">
            Curated guides, tools, and content to help you on your startup journey
          </p>
        </div>

        {/* Featured Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Featured Resources</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {featuredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${categoryColors[resource.category]}`}>
                      {categoryIcons[resource.category]}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Featured
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-2">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {resource.description}
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={resource.link} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Resource
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={activeTag === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveTag(null)}
          >
            All tags
          </Badge>
          {allTags.map((tag) => (
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

        {/* Tabs and Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="guide">
              <BookOpen className="h-4 w-4 mr-1" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="h-4 w-4 mr-1" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="article">
              <FileText className="h-4 w-4 mr-1" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="tool">
              <Lightbulb className="h-4 w-4 mr-1" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="community">
              <Users className="h-4 w-4 mr-1" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredResources.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No resources found</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${categoryColors[resource.category]}`}>
                          {categoryIcons[resource.category]}
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.difficulty && (
                            <Badge className={difficultyColors[resource.difficulty]}>
                              {resource.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        {resource.duration && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {resource.duration}
                          </div>
                        )}
                        <Button asChild variant="outline" size="sm">
                          <a href={resource.link} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.length}</div>
              <p className="text-xs text-muted-foreground">
                Curated for African student entrepreneurs
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Video Tutorials</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resources.filter((r) => r.category === "video").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Step-by-step video guides
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Learning Paths</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Structured courses coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">More Resources Coming Soon!</h3>
                <p className="text-sm text-muted-foreground">
                  We're adding new guides, videos, and tools every week.
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <a href="mailto:hello@splennet.com?subject=Resource%20request" target="_blank" rel="noreferrer">
                Request a Topic
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
