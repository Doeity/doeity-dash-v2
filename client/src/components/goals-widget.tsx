import { useState } from "react";
import { Target, Plus, TrendingUp, Calendar, CheckCircle2, Clock, X } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Goal {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "yearly";
  status: "active" | "completed" | "paused";
  progress: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
}

export function GoalsWidget() {
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    type: "daily" as const,
    targetValue: 1,
    unit: "",
    deadline: new Date().toISOString().split('T')[0],
    currentValue: 0,
    progress: 0,
    status: "active" as const,
    userId: "default-user",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const queryClient = useQueryClient();
  const { showDummyData } = useSettings();

  const { data: allGoals = [], isLoading } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json();
    },
  });

  // Filter out dummy data if setting is disabled
  const goals = showDummyData ? allGoals : allGoals.filter((goal: Goal) => 
    !goal.title.includes("Daily") && 
    !goal.id.includes("goal-daily") && 
    !goal.description.includes("sample")
  );

  const createGoalMutation = useMutation({
    mutationFn: async (goal: typeof newGoal) => {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      if (!response.ok) throw new Error("Failed to create goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setShowAddDialog(false);
      setNewGoal({
        title: "",
        description: "",
        type: "daily",
        targetValue: 1,
        unit: "",
        deadline: new Date().toISOString().split('T')[0],
        currentValue: 0,
        progress: 0,
        status: "active",
        userId: "default-user",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
      const response = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const incrementProgress = (goal: Goal) => {
    const newValue = Math.min(goal.currentValue + 1, goal.targetValue);
    const newProgress = Math.round((newValue / goal.targetValue) * 100);
    const newStatus = newValue >= goal.targetValue ? "completed" : goal.status;
    
    updateGoalMutation.mutate({
      id: goal.id,
      updates: { currentValue: newValue, progress: newProgress, status: newStatus },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-300";
      case "paused": return "bg-yellow-500/20 text-yellow-300";
      default: return "bg-blue-500/20 text-blue-300";
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredGoals = goals.filter((goal: Goal) => goal.type === activeTab);

  const goalTypeTemplates = {
    daily: [
      { title: "Complete 5 tasks", unit: "tasks", target: 5 },
      { title: "Drink 8 glasses of water", unit: "glasses", target: 8 },
      { title: "Exercise for 30 minutes", unit: "minutes", target: 30 },
    ],
    weekly: [
      { title: "Read 2 books", unit: "books", target: 2 },
      { title: "Exercise 4 times", unit: "workouts", target: 4 },
      { title: "Learn 10 new words", unit: "words", target: 10 },
    ],
    monthly: [
      { title: "Save $500", unit: "dollars", target: 500 },
      { title: "Complete 2 courses", unit: "courses", target: 2 },
      { title: "Network with 10 people", unit: "connections", target: 10 },
    ],
    yearly: [
      { title: "Learn a new language", unit: "proficiency %", target: 80 },
      { title: "Run a marathon", unit: "miles", target: 26 },
      { title: "Read 52 books", unit: "books", target: 52 },
    ],
  };

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-4 bg-white bg-opacity-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Goals</h3>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-sm max-w-md">
            <DialogHeader>
              <DialogTitle>Add Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={newGoal.type}
                onValueChange={(value: any) => setNewGoal({ ...newGoal, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>

              <div className="grid grid-cols-1 gap-2">
                {goalTypeTemplates[newGoal.type].map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewGoal({
                        ...newGoal,
                        title: template.title,
                        unit: template.unit,
                        targetValue: template.target,
                      });
                    }}
                    className="text-xs h-auto py-2 justify-start"
                  >
                    {template.title}
                  </Button>
                ))}
              </div>

              <Input
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              
              <Input
                placeholder="Description (optional)"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Target"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 1 })}
                />
                <Input
                  placeholder="Unit"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                />
              </div>

              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />

              <Button
                onClick={() => createGoalMutation.mutate({
                  ...newGoal,
                  currentValue: 0,
                  progress: 0,
                  status: "active",
                  userId: "default-user",
                })}
                disabled={!newGoal.title || createGoalMutation.isPending}
                className="w-full"
              >
                Add Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="daily" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Yearly</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-2 mt-3">
            {filteredGoals.length === 0 ? (
              <p className="text-sm text-white/60 text-center py-4">
                No {activeTab} goals yet. Add one to get started!
              </p>
            ) : (
              filteredGoals.map((goal: Goal) => (
                <div
                  key={goal.id}
                  className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white truncate">
                          {goal.title}
                        </h4>
                        <Badge className={`text-xs ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-xs text-white/60 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoalMutation.mutate(goal.id)}
                      className="h-6 w-6 p-0 text-white/60 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/80">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <span className="text-white/60">
                        {getDaysUntilDeadline(goal.deadline)} days left
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    
                    {goal.status !== "completed" && (
                      <Button
                        size="sm"
                        onClick={() => incrementProgress(goal)}
                        className="w-full h-7 text-xs"
                        disabled={updateGoalMutation.isPending}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Progress +1
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}