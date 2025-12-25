import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Target,
  Plus,
  Calendar,
  Loader2,
  Trash2,
  Edit2,
  Check,
  Clock,
  Circle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { goalsApi, Goal } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "pending" as Goal["status"],
  });

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await goalsApi.getAll(user.id);
      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error loading goals:", error);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;

    try {
      setSaving(true);
      
      if (editingGoal) {
        const { error } = await goalsApi.update(editingGoal.id, {
          title: formData.title,
          description: formData.description || undefined,
          due_date: formData.due_date || undefined,
          status: formData.status,
        });
        if (error) throw error;
        toast({
          title: "Goal updated",
          description: "Your goal has been updated successfully.",
        });
      } else {
        const { error } = await goalsApi.create({
          user_id: user.id,
          title: formData.title,
          description: formData.description || undefined,
          due_date: formData.due_date || undefined,
          status: formData.status,
        });
        if (error) throw error;
        toast({
          title: "Goal created",
          description: "Your new goal has been added.",
        });
      }
      
      setDialogOpen(false);
      resetForm();
      await loadGoals();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error",
        description: "Failed to save goal",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      const { error } = await goalsApi.delete(goalId);
      if (error) throw error;
      toast({
        title: "Goal deleted",
        description: "The goal has been removed.",
      });
      await loadGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (goalId: string, newStatus: Goal["status"]) => {
    try {
      const { error } = await goalsApi.update(goalId, { status: newStatus });
      if (error) throw error;
      await loadGoals();
    } catch (error) {
      console.error("Error updating goal status:", error);
      toast({
        title: "Error",
        description: "Failed to update goal status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      due_date: "",
      status: "pending",
    });
    setEditingGoal(null);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      due_date: goal.due_date || "",
      status: goal.status,
    });
    setDialogOpen(true);
  };

  const getStatusIcon = (status: Goal["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-forest" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-ochre" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Goal["status"]) => {
    switch (status) {
      case "completed":
        return "bg-forest/10 text-forest border-forest/20";
      case "in-progress":
        return "bg-ochre/10 text-ochre border-ochre/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Group goals by status
  const pendingGoals = goals.filter((g) => g.status === "pending");
  const inProgressGoals = goals.filter((g) => g.status === "in-progress");
  const completedGoals = goals.filter((g) => g.status === "completed");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-cream/50">
        <Header />
        <main className="container py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-cream/50">
      <Header />
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Your Goals
              </h1>
              <p className="text-muted-foreground">
                Track your startup journey milestones
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingGoal ? "Edit Goal" : "Create New Goal"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingGoal
                      ? "Update your goal details below."
                      : "Set a new goal to track your progress."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Complete MVP"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Add more details about this goal..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date (optional)</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) =>
                          setFormData({ ...formData, due_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: Goal["status"]) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="hero" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingGoal ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Goals Columns */}
          {goals.length === 0 ? (
            <div className="text-center py-12 bg-background rounded-xl border border-border">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your startup journey by adding your first goal
              </p>
              <Button variant="hero" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pending */}
              <div>
                <h3 className="font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <Circle className="w-4 h-4" />
                  Pending ({pendingGoals.length})
                </h3>
                <div className="space-y-3">
                  {pendingGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={() => openEditDialog(goal)}
                      onDelete={() => handleDelete(goal.id)}
                      onStatusChange={handleStatusChange}
                      getStatusIcon={getStatusIcon}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>

              {/* In Progress */}
              <div>
                <h3 className="font-semibold text-ochre mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  In Progress ({inProgressGoals.length})
                </h3>
                <div className="space-y-3">
                  {inProgressGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={() => openEditDialog(goal)}
                      onDelete={() => handleDelete(goal.id)}
                      onStatusChange={handleStatusChange}
                      getStatusIcon={getStatusIcon}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>

              {/* Completed */}
              <div>
                <h3 className="font-semibold text-forest mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Completed ({completedGoals.length})
                </h3>
                <div className="space-y-3">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={() => openEditDialog(goal)}
                      onDelete={() => handleDelete(goal.id)}
                      onStatusChange={handleStatusChange}
                      getStatusIcon={getStatusIcon}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Goal Card Component
interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (goalId: string, status: Goal["status"]) => void;
  getStatusIcon: (status: Goal["status"]) => React.ReactNode;
  getStatusColor: (status: Goal["status"]) => string;
}

const GoalCard = ({
  goal,
  onEdit,
  onDelete,
  onStatusChange,
  getStatusIcon,
  getStatusColor,
}: GoalCardProps) => {
  return (
    <div className="p-4 bg-background rounded-xl border border-border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm">{goal.title}</h4>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1 hover:bg-muted rounded"
            title="Edit"
          >
            <Edit2 className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-destructive/10 rounded"
            title="Delete"
          >
            <Trash2 className="w-3 h-3 text-destructive" />
          </button>
        </div>
      </div>
      {goal.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {goal.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        {goal.due_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {format(new Date(goal.due_date), "MMM d, yyyy")}
          </div>
        )}
        <Select
          value={goal.status}
          onValueChange={(value: Goal["status"]) => onStatusChange(goal.id, value)}
        >
          <SelectTrigger className={`h-7 text-xs w-auto ${getStatusColor(goal.status)}`}>
            <div className="flex items-center gap-1">
              {getStatusIcon(goal.status)}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Goals;
