import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface PreferenceToggle {
  key: string;
  label: string;
  description: string;
}

const channels: PreferenceToggle[] = [
  {
    key: "email",
    label: "Email alerts",
    description: "Get important updates in your inbox for approvals, invites, and security events.",
  },
  {
    key: "push",
    label: "Push notifications",
    description: "Receive real-time alerts for messages and mentions on your device.",
  },
];

const categories: PreferenceToggle[] = [
  {
    key: "messages",
    label: "Messages",
    description: "Direct messages and replies to your conversations.",
  },
  {
    key: "mentions",
    label: "Mentions",
    description: "When someone tags you in comments, ideas, or group discussions.",
  },
  {
    key: "groups",
    label: "Group activity",
    description: "Join requests, approvals, idea votes, and comments in your groups.",
  },
  {
    key: "product",
    label: "Product updates",
    description: "New features and important platform changes.",
  },
];

const NotificationSettings = () => {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    email: true,
    push: true,
    messages: true,
    mentions: true,
    groups: true,
    product: false,
  });

  const toggle = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DashboardLayout
      title="Notifications"
      subtitle="Control how you receive updates, invites, and alerts."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Channels</CardTitle>
            <CardDescription>Select where you want to be notified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {channels.map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium">{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} aria-label={item.label} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What you receive</CardTitle>
            <CardDescription>Choose the activity that triggers notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-base font-medium">{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} aria-label={item.label} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>Digest & preferences</CardTitle>
          <CardDescription>Set a weekly summary and reduce noise while staying informed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-base font-medium">Weekly digest</Label>
              <p className="text-sm text-muted-foreground">A curated recap of messages, group activity, and votes.</p>
            </div>
            <Switch checked={prefs["digest"] ?? true} onCheckedChange={() => toggle("digest")} aria-label="Weekly digest" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-base font-medium">Smart priority</Label>
              <p className="text-sm text-muted-foreground">Highlight approvals, mentions, and direct replies first.</p>
            </div>
            <Switch checked={prefs["priority"] ?? true} onCheckedChange={() => toggle("priority")} aria-label="Smart priority" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-base font-medium">Quiet hours</Label>
              <p className="text-sm text-muted-foreground">Mute push alerts overnight while keeping email recaps on.</p>
            </div>
            <Switch checked={prefs["quiet"] ?? false} onCheckedChange={() => toggle("quiet")} aria-label="Quiet hours" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        Settings are saved locally for now. Wire these toggles to your backend when notification prefs are ready.
      </div>

      <div className="mt-4">
        <Button disabled variant="secondary">Save changes</Button>
      </div>
    </DashboardLayout>
  );
};

export default NotificationSettings;
