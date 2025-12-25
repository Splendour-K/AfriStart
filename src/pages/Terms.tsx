import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "Using AfriStart",
    items: [
      "You must be 16+ and provide accurate account details.",
      "Keep your account secure; you're responsible for activity under it.",
      "Don't misuse the platform (spam, harassment, illegal content).",
    ],
  },
  {
    title: "Content & Ownership",
    items: [
      "You own the content you create. You grant AfriStart a license to display it to provide the service.",
      "Don't post content you don't have rights to or that infringes others.",
    ],
  },
  {
    title: "Matches, Goals, and Messaging",
    items: [
      "Matches and recommendations are best-effort; we don't guarantee outcomes.",
      "Please keep messaging respectful and professional.",
    ],
  },
  {
    title: "Disclaimers",
    items: [
      "AfriStart is provided as-is; we don't guarantee uninterrupted availability.",
      "We are not liable for business outcomes between users; do your own diligence.",
    ],
  },
  {
    title: "Termination",
    items: [
      "You can close your account anytime. We may suspend accounts that violate these terms.",
    ],
  },
  {
    title: "Contact",
    items: [
      "terms@splennet.com",
      "Nairobi, Kenya",
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">Terms of Service</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Simple, clear ground rules.</h1>
            <p className="text-muted-foreground">
              These terms help keep AfriStart safe and fair for everyone. By using the platform, you agree to them.
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
