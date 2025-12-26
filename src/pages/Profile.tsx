import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEndorsements } from "@/hooks/useEndorsements";
import { AvatarUpload } from "@/components/AvatarUpload";
import { 
  Edit2,
  Save,
  X,
  Linkedin,
  Twitter,
  Globe,
  GraduationCap,
  Mail,
  Loader2,
  CheckCircle2,
  ThumbsUp
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

const Profile = () => {
  const { profile, user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch endorsements for the current user
  const { data: endorsements } = useEndorsements(user?.id);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    university: profile?.university || "",
    skills: profile?.skills || [],
    interests: profile?.interests || [],
    linkedin_url: profile?.linkedin_url || "",
    twitter_url: profile?.twitter_url || "",
    website_url: profile?.website_url || "",
  });

  // Get endorsement count for a skill
  const getEndorsementCount = (skill: string) => {
    return endorsements?.find(e => e.skill === skill)?.count || 0;
  };

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

  const handleSave = async () => {
    setIsLoading(true);
    
    const { error } = await updateProfile({
      full_name: formData.full_name,
      bio: formData.bio,
      university: formData.university,
      skills: formData.skills,
      interests: formData.interests,
      linkedin_url: formData.linkedin_url || undefined,
      twitter_url: formData.twitter_url || undefined,
      website_url: formData.website_url || undefined,
    });

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved.",
      });
      setIsEditing(false);
    }
    
    setIsLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      university: profile?.university || "",
      skills: profile?.skills || [],
      interests: profile?.interests || [],
      linkedin_url: profile?.linkedin_url || "",
      twitter_url: profile?.twitter_url || "",
      website_url: profile?.website_url || "",
    });
    setIsEditing(false);
  };

  return (
    <DashboardLayout 
      title="My Profile"
      subtitle="Manage your account and preferences"
      headerActions={
        !isEditing ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/settings/notifications">Notification Settings</Link>
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button variant="hero" onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        )
      }
    >
      <div className="max-w-3xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar Section */}
            <div className="w-full md:w-auto flex justify-center md:block">
              {isEditing ? (
                <AvatarUpload
                  currentAvatarUrl={profile?.avatar_url}
                  onUploadSuccess={(url) => {
                    toast({
                      title: "Avatar updated!",
                      description: "Your profile picture has been updated.",
                    });
                  }}
                  onUploadError={(error) => {
                    toast({
                      title: "Upload failed",
                      description: error,
                      variant: "destructive",
                    });
                  }}
                  size="lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-terracotta to-ochre flex items-center justify-center flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile?.full_name || "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-foreground font-bold text-4xl">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    <Input
                      id="university"
                      value={formData.university}
                      onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-bold text-foreground">{profile?.full_name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>{profile?.university}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{profile?.email}</span>
                  </div>
                  {profile?.role && (
                    <Badge className="mt-3">{profile.role}</Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">About Me</h3>
          {isEditing ? (
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell others about yourself..."
              className="min-h-[120px]"
              maxLength={500}
            />
          ) : (
            <p className="text-muted-foreground">
              {profile?.bio || "No bio yet. Click 'Edit Profile' to add one."}
            </p>
          )}
        </div>

        {/* Skills Section with Endorsements */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">Skills</h3>
            {!isEditing && endorsements && endorsements.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ThumbsUp className="w-4 h-4" />
                <span>{endorsements.reduce((sum, e) => sum + e.count, 0)} endorsements</span>
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {skillOptions.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                    formData.skills.includes(skill)
                      ? "bg-terracotta text-white border-terracotta"
                      : "bg-background border-border hover:border-terracotta/50"
                  }`}
                >
                  {skill}
                  {formData.skills.includes(skill) && (
                    <CheckCircle2 className="inline-block w-4 h-4 ml-1" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill) => {
                  const count = getEndorsementCount(skill);
                  return (
                    <Badge 
                      key={skill} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {skill}
                      {count > 0 && (
                        <span className="flex items-center gap-0.5 ml-1 text-terracotta">
                          <ThumbsUp className="w-3 h-3" />
                          {count}
                        </span>
                      )}
                    </Badge>
                  );
                })
              ) : (
                <p className="text-muted-foreground">No skills added yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Interests Section */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Interests</h3>
          {isEditing ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                    formData.interests.includes(interest)
                      ? "bg-forest text-white border-forest"
                      : "bg-background border-border hover:border-forest/50"
                  }`}
                >
                  {interest}
                  {formData.interests.includes(interest) && (
                    <CheckCircle2 className="inline-block w-4 h-4 ml-1" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.interests && profile.interests.length > 0 ? (
                profile.interests.map((interest) => (
                  <Badge key={interest} variant="outline">{interest}</Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No interests added yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Social Links Section */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Social Links</h3>
          {isEditing ? (
            <div className="space-y-4">
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="LinkedIn profile URL"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Twitter profile URL"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Personal website URL"
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {profile?.linkedin_url && (
                <a 
                  href={profile.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {profile?.twitter_url && (
                <a 
                  href={profile.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  <span>Twitter</span>
                </a>
              )}
              {profile?.website_url && (
                <a 
                  href={profile.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  <span>Website</span>
                </a>
              )}
              {!profile?.linkedin_url && !profile?.twitter_url && !profile?.website_url && (
                <p className="text-muted-foreground">No social links added yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
