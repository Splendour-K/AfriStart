import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "",
    password: "",
    confirmPassword: "",
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUp, user, profile } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (profile && !profile.is_onboarded) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, profile, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isSchoolEmail = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase() || "";
    return domain.includes(".edu") || domain.includes(".ac.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const schoolEmail = isSchoolEmail(formData.email);

    if (!schoolEmail && !documentFile) {
      toast({
        title: "Proof required",
        description: "Please upload an admission letter or school ID to continue.",
        variant: "destructive",
      });
      return;
    }

    const { error, user: newUser } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.university
    );

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (!newUser) {
        throw new Error("Could not retrieve new user.");
      }

      if (schoolEmail) {
        // Auto-approve using school email domain
        await supabase
          .from("profiles")
          .update({ verification_status: "approved", verification_method: "email_domain" })
          .eq("id", newUser.id);
        toast({
          title: "Welcome to AfriStart!",
          description: "Your account is verified via your school email. Please complete onboarding.",
        });
      } else {
        // Upload document and create verification request
        const filePath = `verification-docs/${newUser.id}/${Date.now()}-${documentFile!.name}`;
        const { error: uploadError } = await supabase.storage
          .from("verification-docs")
          .upload(filePath, documentFile!, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage.from("verification-docs").getPublicUrl(filePath);
        const documentUrl = publicUrlData.publicUrl;

        await supabase.from("verification_requests").insert({
          user_id: newUser.id,
          document_url: documentUrl,
          status: "pending",
        });

        await supabase
          .from("profiles")
          .update({
            verification_status: "pending",
            verification_method: "document",
            verification_document_url: documentUrl,
          })
          .eq("id", newUser.id);

        toast({
          title: "Verification submitted",
          description: "We received your document. Your account will be activated after admin review.",
        });
      }
    } catch (postError: any) {
      console.error(postError);
      toast({
        title: "Verification step failed",
        description: postError?.message ?? "Please try again or contact support.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-earth ankara-pattern items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-forest/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-terracotta/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-md text-center">
          <h2 className="font-display text-4xl font-bold text-cream mb-6">
            Start Your
            <br />
            <span className="text-ochre">Entrepreneurial Journey</span>
          </h2>
          <p className="text-cream/70 text-lg mb-8">
            Join a community of ambitious African university students ready to build the next generation of startups.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-cream/5 rounded-xl p-4 backdrop-blur-sm border border-cream/10">
              <p className="font-display text-2xl font-bold text-ochre">2.5K+</p>
              <p className="text-cream/60 text-sm">Students</p>
            </div>
            <div className="bg-cream/5 rounded-xl p-4 backdrop-blur-sm border border-cream/10">
              <p className="font-display text-2xl font-bold text-ochre">50+</p>
              <p className="text-cream/60 text-sm">Universities</p>
            </div>
            <div className="bg-cream/5 rounded-xl p-4 backdrop-blur-sm border border-cream/10">
              <p className="font-display text-2xl font-bold text-ochre">100+</p>
              <p className="text-cream/60 text-sm">Startups</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-warm flex items-center justify-center shadow-warm">
              <span className="text-primary-foreground font-display font-bold text-xl">A</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">AfriStart</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              Join the community and start finding your co-founder
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
              {!isSchoolEmail(formData.email) && (
                <p className="text-sm text-amber-600">Use your school email for instant approval.</p>
              )}
            </div>

            {!isSchoolEmail(formData.email) && (
              <div className="space-y-2">
                <Label htmlFor="document">Upload proof of enrollment</Label>
                <Input
                  id="document"
                  name="document"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Admission letter or school ID. Images or PDF are accepted.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="university"
                  name="university"
                  type="text"
                  placeholder="e.g., University of Nairobi"
                  value={formData.university}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>

          {/* Login Link */}
          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
