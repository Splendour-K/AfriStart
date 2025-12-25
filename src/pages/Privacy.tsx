import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "Information We Collect",
    items: [
      "Account details such as name, email, university, and profile information you provide.",
      "Usage data including device info, log data, and interactions with features (matches, messages, goals).",
      "Content you share such as messages, goals, startup ideas, and profile fields.",
    ],
  },
  {
    title: "How We Use Your Information",
    items: [
      "To provide core features like matching, messaging, goals, and resources.",
      "To improve recommendations (e.g., match scores) and platform reliability.",
      "To communicate important updates, security alerts, and support responses.",
    ],
  },
  {
    title: "Sharing & Disclosure",
    items: [
      "We do not sell your data. We only share with service providers needed to run the platform (e.g., hosting, analytics).",
      "You control what appears on your public profile. Messages stay private between participants.",
      "We may disclose information to comply with law or protect platform security.",
    ],
  },
  {
    title: "Data Security",
    items: [
      "Data is encrypted in transit (HTTPS) and stored with trusted cloud providers.",
      "Access to production systems is limited and audited.",
      "Report issues to security@splennet.com and we'll investigate promptly.",
    ],
  },
  {
    title: "Your Rights",
    items: [
      "Access, update, or delete your profile data in Settings.",
      "Export your data by contacting privacy@splennet.com.",
      "Opt out of non-essential communications via email preferences.",
    ],
  },
  {
    title: "Cookies & Tracking",
    items: [
      "We use essential cookies for authentication and security.",
      "Analytics cookies help us improve usability; you can block them in your browser settings.",
    ],
  },
  {
    title: "Contact",
    items: [
      "privacy@splennet.com",
      "Nairobi, Kenya",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">Privacy Policy</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Your privacy, protected.</h1>
            <p className="text-muted-foreground">
              We only collect the data we need to run AfriStart, and we handle it with care. This page explains what
              we collect, how we use it, and the choices you have.
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
