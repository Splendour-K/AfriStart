import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Video, FileText, ExternalLink, TrendingUp, Users, Lightbulb, Code } from "lucide-react";

const Resources = () => {
  const resourceCategories = [
    {
      title: "Startup Guides",
      icon: Lightbulb,
      color: "text-terracotta",
      resources: [
        { name: "Starting a Tech Startup in Africa", type: "Article", link: "#" },
        { name: "Finding Your Co-founder", type: "Guide", link: "#" },
        { name: "MVP Development Basics", type: "Article", link: "#" },
        { name: "Startup Legal Requirements", type: "Guide", link: "#" },
      ]
    },
    {
      title: "Business & Strategy",
      icon: TrendingUp,
      color: "text-sahara",
      resources: [
        { name: "Business Model Canvas", type: "Template", link: "#" },
        { name: "Market Research for Startups", type: "Guide", link: "#" },
        { name: "Pitch Deck Templates", type: "Template", link: "#" },
        { name: "Financial Planning 101", type: "Article", link: "#" },
      ]
    },
    {
      title: "Technical Resources",
      icon: Code,
      color: "text-baobab",
      resources: [
        { name: "Web Development Fundamentals", type: "Course", link: "#" },
        { name: "Mobile App Development", type: "Course", link: "#" },
        { name: "Cloud Infrastructure Guide", type: "Guide", link: "#" },
        { name: "API Design Best Practices", type: "Article", link: "#" },
      ]
    },
    {
      title: "Fundraising",
      icon: TrendingUp,
      color: "text-terracotta",
      resources: [
        { name: "African VC Landscape 2024", type: "Report", link: "#" },
        { name: "Grant Opportunities", type: "Directory", link: "#" },
        { name: "Investor Pitch Guide", type: "Guide", link: "#" },
        { name: "Term Sheet Essentials", type: "Article", link: "#" },
      ]
    },
    {
      title: "Community & Events",
      icon: Users,
      color: "text-sahara",
      resources: [
        { name: "Startup Events Calendar", type: "Calendar", link: "#" },
        { name: "Tech Communities in Africa", type: "Directory", link: "#" },
        { name: "Hackathons & Competitions", type: "List", link: "#" },
        { name: "Mentorship Programs", type: "Directory", link: "#" },
      ]
    },
    {
      title: "Learning Materials",
      icon: BookOpen,
      color: "text-baobab",
      resources: [
        { name: "Recommended Books", type: "List", link: "#" },
        { name: "Online Courses", type: "Directory", link: "#" },
        { name: "Podcasts for Entrepreneurs", type: "List", link: "#" },
        { name: "YouTube Channels", type: "List", link: "#" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Resources</h1>
              <p className="text-muted-foreground">Curated resources to help you build and grow</p>
            </div>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Suggest Resource
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Featured Section */}
        <Card className="p-6 mb-8 bg-gradient-warm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Featured: Startup Success Stories</h2>
              <p className="text-white/90 mb-4">
                Watch inspiring stories from successful African entrepreneurs who started with just an idea
              </p>
              <Button variant="secondary" className="gap-2">
                <Video className="w-4 h-4" />
                Watch Now
              </Button>
            </div>
          </div>
        </Card>

        {/* Resource Categories */}
        <div className="grid md:grid-cols-2 gap-6">
          {resourceCategories.map((category) => (
            <Card key={category.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{category.title}</h3>
              </div>
              
              <div className="space-y-3">
                {category.resources.map((resource) => (
                  <a
                    key={resource.name}
                    href={resource.link}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-terracotta transition-colors">
                          {resource.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{resource.type}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="p-8 text-center mt-8">
          <BookOpen className="w-12 h-12 text-terracotta mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Can't find what you're looking for?</h2>
          <p className="text-muted-foreground mb-4">
            Let us know what resources would help you most on your startup journey
          </p>
          <Button className="gap-2">
            Request Resources
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default Resources;
