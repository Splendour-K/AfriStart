import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "How does matching work?",
    answer: "We look at skills, interests, goals, and availability to suggest complementary co-founders. You can refine matches in Discover.",
  },
  {
    question: "Is AfriStart free?",
    answer: "Yes, the Starter plan is free for students. We offer paid tiers for advanced features and campus programs.",
  },
  {
    question: "Can I use AfriStart outside university?",
    answer: "Our focus is African university students, but alumni and recent grads are welcome to collaborate.",
  },
  {
    question: "Is my data private?",
    answer: "Yes. Profiles are only visible in the community. Messages are private. See our Privacy Policy for details.",
  },
  {
    question: "How do I report an issue?",
    answer: "Use the Contact page or email support@splennet.com. Include screenshots or steps to reproduce if possible.",
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-primary">FAQ</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Answers to common questions.</h1>
            <p className="text-muted-foreground">Need more help? Reach out via the Contact page.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question} className="shadow-soft">
                <CardContent className="p-6 space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">{faq.question}</h2>
                  <p className="text-muted-foreground">{faq.answer}</p>
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
