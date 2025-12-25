import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, XCircle, ExternalLink, Clock4 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationRow {
  id: string;
  user_id: string;
  document_url: string;
  status: "pending" | "approved" | "rejected";
  reviewer_email: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    university: string;
  } | null;
}

const AdminVerifications = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*, profiles(full_name,email,university)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    setRows(data as VerificationRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      load();
    }
  }, [isAdmin]);

  const updateStatus = async (id: string, userId: string, status: "approved" | "rejected") => {
    setActionId(id);
    const session = (await supabase.auth.getSession()).data.session;
    const reviewerEmail = session?.user?.email ?? null;

    const { error } = await supabase
      .from("verification_requests")
      .update({
        status,
        reviewer_email: reviewerEmail,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      setActionId(null);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        verification_status: status,
        reviewed_by_email: reviewerEmail,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      toast({ title: "Profile update failed", description: profileError.message, variant: "destructive" });
    } else {
      toast({ title: `Request ${status}`, description: `User has been ${status}.` });
    }

    setActionId(null);
    load();
  };

  return (
    <DashboardLayout title="Verification Requests" subtitle="Review and approve pending student accounts">
      <Card>
        <CardHeader>
          <CardTitle>Pending verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground">No pending requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-semibold">{row.profiles?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{row.profiles?.email}</div>
                    </TableCell>
                    <TableCell>{row.profiles?.university}</TableCell>
                    <TableCell>
                      <a className="inline-flex items-center gap-1 text-terracotta" href={row.document_url} target="_blank" rel="noreferrer">
                        View document <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(row.created_at).toLocaleString()}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={actionId === row.id} onClick={() => updateStatus(row.id, row.user_id, "approved")}> 
                        {actionId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve
                      </Button>
                      <Button size="sm" variant="destructive" disabled={actionId === row.id} onClick={() => updateStatus(row.id, row.user_id, "rejected")}>
                        {actionId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
        <Clock4 className="h-4 w-4" /> Verified via school email addresses are auto-approved; only document submissions appear here.
      </div>
    </DashboardLayout>
  );
};

export default AdminVerifications;
