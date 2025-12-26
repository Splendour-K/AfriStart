import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AvatarUpload } from "@/components/AvatarUpload";
import { 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Target, 
  Briefcase, 
  Lightbulb,
  Loader2,
  CheckCircle2,
  Linkedin,
  Twitter,
  Globe
} from "lucide-react";

const skillOptions = [
  "Software Development",
  "UI/UX Design",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Data Science",
  "AI/ML",
  "Product Management",
  "Business Development",
  "Content Creation",
  "Legal",
  "HR/Recruitment",
  "Customer Support",
];

const interestOptions = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "AgriTech",
  "E-commerce",
  "Clean Energy",
  "Logistics",
  "Real Estate",
  "Entertainment",
  "Social Impact",
  "Food & Beverage",
  "Fashion",
  "Tourism",
  "B2B SaaS",
];

const roleOptions = [
  "Looking for a co-founder",
  "Ready to join as co-founder",
  "Just exploring",
  "Looking for team members",
  "Mentor/Advisor",
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    skills: [] as string[],
    interests: [] as string[],
    role: "",
    linkedin_url: "",
    twitter_url: "",
    website_url: "",
  });
  const { toast } = useToast();
  const { updateProfile, profile } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 4;

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.bio) {
      toast({
        title: "Please add a bio",
        description: "Tell others a bit about yourself.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && formData.skills.length === 0) {
      toast({
        title: "Select at least one skill",
        description: "This helps us match you with the right people.",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && formData.interests.length === 0) {
      toast({
        title: "Select at least one interest",
        description: "This helps us find startups that match your interests.",
        variant: "destructive",
      });
      return;
    }
    
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!formData.role) {
      toast({
        title: "Please select your status",
        description: "Let us know what you're looking for.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await updateProfile({
      bio: formData.bio,
      skills: formData.skills,
      interests: formData.interests,
      role: formData.role,
      linkedin_url: formData.linkedin_url || undefined,
      twitter_url: formData.twitter_url || undefined,
      website_url: formData.website_url || undefined,
      is_onboarded: true,
    });

    if (error) {
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Welcome aboard! 🎉",
      description: "Your profile is complete. Start exploring potential co-founders!",
    });

    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center shadow-warm">
                <span className="text-primary-foreground font-display font-bold text-xl">A</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">AfriStart</span>
            </div>
            
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    s <= step ? "bg-terracotta" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Step 1: Bio */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-terracotta" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    Tell us about yourself
                  </h1>
                  <p className="text-muted-foreground">
                    Hi {profile?.full_name?.split(' ')[0] || 'there'}! Let's set up your profile.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Picture (Optional)</Label>
                  <AvatarUpload
                    currentAvatarUrl={formData.avatar_url}
                    onUploadComplete={(url) => setFormData((prev) => ({ ...prev, avatar_url: url }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add a profile picture to help others recognize you
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Your Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell potential co-founders about yourself, your background, and what drives you..."
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    className="min-h-[150px] resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Social Links (Optional)</Label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="LinkedIn profile URL"
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="Twitter profile URL"
                        value={formData.twitter_url}
                        onChange={(e) => setFormData((prev) => ({ ...prev, twitter_url: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="Personal website URL"
                        value={formData.website_url}
                        onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-ochre/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-ochre" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    What are your skills?
                  </h1>
                  <p className="text-muted-foreground">
                    Select the skills you bring to the table
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.skills.includes(skill)
                        ? "bg-terracotta text-white border-terracotta"
                        : "bg-card border-border hover:border-terracotta/50 hover:bg-terracotta/5"
                    }`}
                  >
                    {skill}
                    {formData.skills.includes(skill) && (
                      <CheckCircle2 className="inline-block w-4 h-4 ml-2" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Selected: {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-forest" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    What industries interest you?
                  </h1>
                  <p className="text-muted-foreground">
                    Select the sectors you'd like to build in
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.interests.includes(interest)
                        ? "bg-forest text-white border-forest"
                        : "bg-card border-border hover:border-forest/50 hover:bg-forest/5"
                    }`}
                  >
                    {interest}
                    {formData.interests.includes(interest) && (
                      <CheckCircle2 className="inline-block w-4 h-4 ml-2" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Selected: {formData.interests.length} interest{formData.interests.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Step 4: Role/Status */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-terracotta" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    What are you looking for?
                  </h1>
                  <p className="text-muted-foreground">
                    Let us know your current status
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    onClick={() => setFormData((prev) => ({ ...prev, role }))}
                    className={`w-full p-4 rounded-xl border text-left font-medium transition-all ${
                      formData.role === role
                        ? "bg-terracotta text-white border-terracotta"
                        : "bg-card border-border hover:border-terracotta/50 hover:bg-terracotta/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{role}</span>
                      {formData.role === role && <CheckCircle2 className="w-5 h-5" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className={step === 1 ? "invisible" : ""}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button variant="hero" onClick={handleNext}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button variant="hero" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finishing up...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
