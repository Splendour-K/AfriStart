import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Name, email, subject, and message are required.",
        variant: "destructive",
      });
      return false;
    }

    const emailValid = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(form.email);
    if (!emailValid) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email so we can reach you.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        source: "contact_page",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Message sent",
        description: "We received your note and will reply within one business day.",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      console.error("Contact form submission failed", error);
      toast({
        title: "Couldn't send via form",
        description: "Please email hello@splennet.com while we fix this.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">Contact</p>
              <h1 className="text-3xl font-display font-bold text-foreground">We'd love to hear from you.</h1>
              <p className="text-muted-foreground">
                Questions, feedback, or partnerships? Send us a note and we'll respond promptly.
              </p>
            </div>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Send a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        required
                        value={form.name}
                        onChange={handleChange("name")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={form.email}
                        onChange={handleChange("email")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      required
                      value={form.subject}
                      onChange={handleChange("subject")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Write your message"
                      rows={5}
                      required
                      value={form.message}
                      onChange={handleChange("message")}
                    />
                  </div>
                  <Button className="w-full md:w-auto" type="submit" disabled={isSubmitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Sending..." : "Send message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Contact details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:hello@splennet.com" className="hover:text-foreground">hello@splennet.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+254 (0) 700 000 000</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Nairobi, Kenya</span>
                </div>
                <p className="text-xs">Response time: within 1 business day.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
