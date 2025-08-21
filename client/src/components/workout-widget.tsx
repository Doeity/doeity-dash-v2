import { useState } from "react";
import { Dumbbell, Plus, Play, Check, Clock, Star, X } from "lucide-react";
// Card components removed - using glassmorphism divs instead
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WorkoutPlan {
  id: string;
  name: string;
  type: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number; // minutes
  exercises: string; // JSON string
  isActive: boolean;
}

interface WorkoutSession {
  id: string;
  planId: string | null;
  name: string;
  type: string;
  duration: number;
  date: string;
  completed: boolean;
  notes: string;
  rating: number; // 1-5
}

export function WorkoutWidget() {
  const [newPlan, setNewPlan] = useState({
    name: "",
    type: "strength",
    difficulty: "beginner" as const,
    duration: 30,
    exercises: "",
    userId: "default-user",
  });
  const [newSession, setNewSession] = useState({
    name: "",
    type: "strength",
    duration: 30,
    notes: "",
    rating: 3,
    userId: "default-user",
  });
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");
  const queryClient = useQueryClient();

  const { data: workoutPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/workout-plans"],
    queryFn: async () => {
      const response = await fetch("/api/workout-plans");
      if (!response.ok) throw new Error("Failed to fetch workout plans");
      return response.json();
    },
  });

  const { data: workoutSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/workout-sessions"],
    queryFn: async () => {
      const response = await fetch("/api/workout-sessions");
      if (!response.ok) throw new Error("Failed to fetch workout sessions");
      return response.json();
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (plan: typeof newPlan) => {
      const response = await fetch("/api/workout-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      if (!response.ok) throw new Error("Failed to create workout plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
      setShowPlanDialog(false);
      setNewPlan({
        name: "",
        type: "strength",
        difficulty: "beginner",
        duration: 30,
        exercises: "",
        userId: "default-user",
      });
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (session: typeof newSession & { date: string }) => {
      const response = await fetch("/api/workout-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...session,
          completed: true,
        }),
      });
      if (!response.ok) throw new Error("Failed to create workout session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
      setShowSessionDialog(false);
      setNewSession({
        name: "",
        type: "strength",
        duration: 30,
        notes: "",
        rating: 3,
        userId: "default-user",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workout-plans/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete workout plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workout-sessions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete workout session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-sessions"] });
    },
  });

  const workoutTypes = [
    { value: "strength", label: "💪 Strength", color: "bg-red-500/20 text-red-300" },
    { value: "cardio", label: "🏃 Cardio", color: "bg-blue-500/20 text-blue-300" },
    { value: "yoga", label: "🧘 Yoga", color: "bg-green-500/20 text-green-300" },
    { value: "hiit", label: "🔥 HIIT", color: "bg-orange-500/20 text-orange-300" },
    { value: "flexibility", label: "🤸 Flexibility", color: "bg-purple-500/20 text-purple-300" },
    { value: "other", label: "🏋️ Other", color: "bg-gray-500/20 text-gray-300" },
  ];

  const quickPlans = [
    {
      name: "Quick Morning Routine",
      type: "strength",
      duration: 15,
      exercises: JSON.stringify([
        { name: "Push-ups", sets: 2, reps: 10 },
        { name: "Squats", sets: 2, reps: 15 },
        { name: "Plank", sets: 2, duration: "30s" }
      ])
    },
    {
      name: "Cardio Blast",
      type: "cardio",
      duration: 20,
      exercises: JSON.stringify([
        { name: "Jumping Jacks", sets: 3, duration: "1min" },
        { name: "High Knees", sets: 3, duration: "30s" },
        { name: "Burpees", sets: 2, reps: 8 }
      ])
    },
    {
      name: "Yoga Flow",
      type: "yoga",
      duration: 25,
      exercises: JSON.stringify([
        { name: "Sun Salutation", sets: 3, reps: 1 },
        { name: "Warrior Pose", sets: 2, duration: "1min" },
        { name: "Child's Pose", sets: 1, duration: "2min" }
      ])
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-300";
      case "intermediate": return "bg-yellow-500/20 text-yellow-300";
      case "advanced": return "bg-red-500/20 text-red-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  const getTypeInfo = (type: string) => {
    return workoutTypes.find(t => t.value === type) || workoutTypes[workoutTypes.length - 1];
  };

  const parseExercises = (exercisesString: string) => {
    try {
      return JSON.parse(exercisesString);
    } catch {
      return [];
    }
  };

  const todaySessions = workoutSessions.filter((session: WorkoutSession) => 
    session.date === new Date().toISOString().split('T')[0]
  );

  const isLoading = plansLoading || sessionsLoading;

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="flex items-center space-x-2 animate-pulse">
          <Dumbbell className="h-5 w-5" />
          <div className="h-4 bg-white/20 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Dumbbell className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Workouts</h3>
        </div>
        <div className="flex gap-1">
          <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Add Plan">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-sm max-w-md">
              <DialogHeader>
                <DialogTitle>Create Workout Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2">
                  {quickPlans.map((plan, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewPlan({
                          ...newPlan,
                          name: plan.name,
                          type: plan.type,
                          duration: plan.duration,
                          exercises: plan.exercises,
                        });
                      }}
                      className="text-xs h-auto py-2 justify-start"
                    >
                      {plan.name} ({plan.duration}min)
                    </Button>
                  ))}
                </div>

                <Input
                  placeholder="Plan name"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={newPlan.type}
                    onValueChange={(value) => setNewPlan({ ...newPlan, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {workoutTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={newPlan.difficulty}
                    onValueChange={(value: any) => setNewPlan({ ...newPlan, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">🟢 Beginner</SelectItem>
                      <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
                      <SelectItem value="advanced">🔴 Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={newPlan.duration}
                  onChange={(e) => setNewPlan({ ...newPlan, duration: parseInt(e.target.value) || 30 })}
                />

                <Input
                  placeholder="Exercises (e.g., Push-ups 3x10, Squats 3x15)"
                  value={newPlan.exercises}
                  onChange={(e) => setNewPlan({ ...newPlan, exercises: e.target.value })}
                />

                <Button
                  onClick={() => createPlanMutation.mutate({
                    ...newPlan,
                    userId: "default-user",
                  })}
                  disabled={!newPlan.name || createPlanMutation.isPending}
                  className="w-full"
                >
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Log Session">
                <Check className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-sm max-w-md">
              <DialogHeader>
                <DialogTitle>Log Workout Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Workout name"
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={newSession.type}
                    onValueChange={(value) => setNewSession({ ...newSession, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {workoutTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Duration (min)"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) || 30 })}
                  />
                </div>

                <Input
                  placeholder="Notes (optional)"
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                />

                <div>
                  <label className="text-sm font-medium">Rating:</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={newSession.rating >= rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewSession({ ...newSession, rating })}
                        className="w-8 h-8 p-0"
                      >
                        <Star className={`h-3 w-3 ${newSession.rating >= rating ? 'fill-current' : ''}`} />
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => createSessionMutation.mutate({
                    ...newSession,
                    date: new Date().toISOString().split('T')[0],
                    userId: "default-user",
                  })}
                  disabled={!newSession.name || createSessionMutation.isPending}
                  className="w-full"
                >
                  Log Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="plans" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Plans</TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Sessions</TabsTrigger>
            <TabsTrigger value="today" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Today</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="space-y-2 mt-3">
            {workoutPlans.length === 0 ? (
              <p className="text-sm text-white/60 text-center py-4">
                No workout plans yet. Create one to get started!
              </p>
            ) : (
              workoutPlans.map((plan: WorkoutPlan) => {
                const typeInfo = getTypeInfo(plan.type);
                const exercises = parseExercises(plan.exercises);
                return (
                  <div
                    key={plan.id}
                    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white truncate">
                            {plan.name}
                          </h4>
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                          <Badge className={getDifficultyColor(plan.difficulty)}>
                            {plan.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/60 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {plan.duration}min
                          </span>
                          <span>{exercises.length} exercises</span>
                        </div>
                        {exercises.length > 0 && (
                          <div className="mt-2 text-xs text-white/60">
                            {exercises.slice(0, 2).map((exercise: any, index: number) => (
                              <div key={index}>
                                {exercise.name} - {exercise.sets && `${exercise.sets}x`}{exercise.reps && `${exercise.reps}`}{exercise.duration && exercise.duration}
                              </div>
                            ))}
                            {exercises.length > 2 && (
                              <div>+{exercises.length - 2} more...</div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePlanMutation.mutate(plan.id)}
                        className="h-6 w-6 p-0 text-white/60 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-2 mt-3">
            {workoutSessions.length === 0 ? (
              <p className="text-sm text-white/60 text-center py-4">
                No workout sessions logged yet.
              </p>
            ) : (
              workoutSessions.slice(0, 5).map((session: WorkoutSession) => {
                const typeInfo = getTypeInfo(session.type);
                return (
                  <div
                    key={session.id}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white truncate">
                            {session.name}
                          </h4>
                          <Badge className={`${typeInfo.color} text-xs`}>
                            {typeInfo.label.split(' ')[1]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/60">
                          <span>{session.duration}min</span>
                          <span>{new Date(session.date).toLocaleDateString()}</span>
                          <div className="flex">
                            {Array.from({ length: session.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSessionMutation.mutate(session.id)}
                        className="h-6 w-6 p-0 text-white/60 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="today" className="space-y-2 mt-3">
            {todaySessions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-white/60 mb-3">
                  No workouts today yet.
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowSessionDialog(true)}
                  className="text-xs"
                >
                  Log a Workout
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-white/80">
                  Today's Workouts ({todaySessions.length})
                </p>
                {todaySessions.map((session: WorkoutSession) => {
                  const typeInfo = getTypeInfo(session.type);
                  return (
                    <div
                      key={session.id}
                      className="p-2 rounded-lg bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white">
                          {session.name}
                        </h4>
                        <Badge className={`${typeInfo.color} text-xs`}>
                          {typeInfo.label.split(' ')[1]}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/60">
                        {session.duration}min • {session.rating}/5 stars
                      </p>
                      {session.notes && (
                        <p className="text-xs text-white/50 mt-1">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}