import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "What Are Cookies?",
    items: [
      "Small text files stored on your device to keep you signed in and remember preferences.",
    ],
  },
  {
    title: "How We Use Cookies",
    items: [
      "Authentication and session management (required).",
      "Security and fraud prevention (required).",
      "Basic analytics to understand feature usage (optional).",
    ],
  },
  {
    title: "Your Choices",
    items: [
      "You can block non-essential cookies in your browser settings.",
      "Blocking essential cookies may prevent sign-in or core features from working.",
    ],
  },
  {
    title: "Contact",
    items: [
      "privacy@splennet.com",
    ],
  },
];

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">Cookie Policy</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Cookies, kept simple.</h1>
            <p className="text-muted-foreground">
              We use a few cookies to keep you signed in, secure, and to improve the product. Here's the breakdown.
            </p>
            <p className="text-xs text-muted-foreground">Last updated: December 25, 2025</p>
          </div>

          <div className="grid gap-6">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="text-xl font-semibold mb-3 text-foreground">{section.title}</h2>
                <ul className="space-y-2 text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
