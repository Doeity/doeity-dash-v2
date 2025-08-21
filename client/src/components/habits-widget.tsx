import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Check, X, Target, TrendingUp, Calendar, Edit, Trash2 } from "lucide-react";
import WidgetClearControls from "@/components/widget-clear-controls";
import { useToast } from "@/hooks/use-toast";
import type { Habit } from "@shared/schema";

interface HabitGoal {
  id: string;
  habitId: string;
  type: 'streak' | 'frequency' | 'count';
  target: number;
  period: 'daily' | 'weekly' | 'monthly';
  description: string;
}

interface EnhancedHabit extends Habit {
  goals?: HabitGoal[];
  weeklyTarget?: number;
  monthlyTarget?: number;
  currentWeekCount?: number;
  currentMonthCount?: number;
}

export default function HabitsWidget() {
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("💪");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalType, setNewGoalType] = useState<'streak' | 'frequency' | 'count'>('streak');
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [deletedHabits, setDeletedHabits] = useState<EnhancedHabit[]>([]);
  const { toast } = useToast();

  const { data: habits = [], isLoading } = useQuery<EnhancedHabit[]>({
    queryKey: ["/api/habits"],
  });

  const createHabitMutation = useMutation({
    mutationFn: (data: { name: string; icon: string; weeklyTarget?: number; monthlyTarget?: number }) => 
      apiRequest("POST", "/api/habits", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      setNewHabitName("");
      setNewHabitIcon("💪");
      setNewGoalTarget("");
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<EnhancedHabit> }) => 
      apiRequest("PATCH", `/api/habits/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      setEditingHabit(null);
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/habits/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => 
      apiRequest("POST", `/api/habits/${id}/toggle`, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      const weeklyTarget = newGoalType === 'frequency' && newGoalTarget ? parseInt(newGoalTarget) : undefined;
      const monthlyTarget = newGoalType === 'count' && newGoalTarget ? parseInt(newGoalTarget) : undefined;
      
      createHabitMutation.mutate({
        name: newHabitName.trim(),
        icon: newHabitIcon,
        weeklyTarget,
        monthlyTarget,
      });
    }
  };

  const toggleHabit = (habit: EnhancedHabit) => {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates?.includes(today);
    
    toggleHabitMutation.mutate({
      id: habit.id,
      completed: !isCompletedToday,
    });

    if (!isCompletedToday) {
      toast({
        title: "Great job! 🎉",
        description: `You completed "${habit.name}" today!`,
      });
    }
  };

  const getStreakCount = (habit: EnhancedHabit) => {
    if (!habit.completedDates?.length) return 0;
    
    const sortedDates = habit.completedDates
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const date of sortedDates) {
      const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWeeklyProgress = (habit: EnhancedHabit) => {
    if (!habit.weeklyTarget) return null;
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const completedThisWeek = habit.completedDates?.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= startOfWeek;
    }).length || 0;
    
    return {
      completed: completedThisWeek,
      target: habit.weeklyTarget,
      percentage: Math.min((completedThisWeek / habit.weeklyTarget) * 100, 100)
    };
  };

  const getMonthlyProgress = (habit: EnhancedHabit) => {
    if (!habit.monthlyTarget) return null;
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const completedThisMonth = habit.completedDates?.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= startOfMonth;
    }).length || 0;
    
    return {
      completed: completedThisMonth,
      target: habit.monthlyTarget,
      percentage: Math.min((completedThisMonth / habit.monthlyTarget) * 100, 100)
    };
  };

  const handleClearData = () => {
    setDeletedHabits([...habits]);
    habits.forEach(habit => {
      deleteHabitMutation.mutate(habit.id);
    });
  };

  const handleRestoreData = () => {
    deletedHabits.forEach(habit => {
      createHabitMutation.mutate({
        name: habit.name,
        icon: habit.icon,
        weeklyTarget: habit.weeklyTarget,
        monthlyTarget: habit.monthlyTarget,
      });
    });
    setDeletedHabits([]);
  };

  const handleLoadDummyData = () => {
    const dummyHabits = [
      { name: "Morning Exercise", icon: "🏃", weeklyTarget: 5 },
      { name: "Read 30 minutes", icon: "📚", weeklyTarget: 7 },
      { name: "Meditate", icon: "🧘", weeklyTarget: 7 },
      { name: "Drink 8 glasses of water", icon: "💧", weeklyTarget: 7 },
      { name: "Write in journal", icon: "📝", weeklyTarget: 5 }
    ];

    dummyHabits.forEach(habit => {
      createHabitMutation.mutate(habit);
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white bg-opacity-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(habit => habit.completedDates?.includes(today)).length;

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Habits</h3>
          <Badge variant="outline" className="text-white opacity-60 border-white border-opacity-30">
            {completedToday}/{habits.length} today
          </Badge>
        </div>
        <WidgetClearControls
          onClearData={handleClearData}
          onRestoreData={handleRestoreData}
          onLoadDummyData={handleLoadDummyData}
          hasData={habits.length > 0}
          hasDeletedData={deletedHabits.length > 0}
          widgetName="Habits"
        />
      </div>

      <Tabs defaultValue="habits" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="habits" className="data-[state=active]:bg-white/20">Habits</TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-white/20">Analytics</TabsTrigger>
          <TabsTrigger value="add" className="data-[state=active]:bg-white/20">Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="habits" className="space-y-3">
          <div className="max-h-60 overflow-y-auto space-y-2">
            {habits.map((habit) => {
              const isCompletedToday = habit.completedDates?.includes(today);
              const streak = getStreakCount(habit);
              const weeklyProgress = getWeeklyProgress(habit);
              const monthlyProgress = getMonthlyProgress(habit);

              return (
                <Card key={habit.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Button
                          variant={isCompletedToday ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleHabit(habit)}
                          className={isCompletedToday 
                            ? "bg-green-600 hover:bg-green-700 text-white" 
                            : "text-white/70 border-white/20 hover:bg-white/10"
                          }
                        >
                          {isCompletedToday ? <Check className="h-4 w-4" /> : <div className="h-4 w-4" />}
                        </Button>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{habit.icon}</span>
                          <div>
                            <h4 className="text-white font-medium text-sm">{habit.name}</h4>
                            <div className="flex items-center space-x-2 text-xs text-white/60">
                              <span>🔥 {streak} day streak</span>
                              {weeklyProgress && (
                                <span>📅 {weeklyProgress.completed}/{weeklyProgress.target} this week</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingHabit(habit.id)}
                          className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHabitMutation.mutate(habit.id)}
                          className="text-white/60 hover:text-red-400 hover:bg-white/10 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress bars for goals */}
                    {weeklyProgress && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-white/70 mb-1">
                          <span>Weekly Goal</span>
                          <span>{weeklyProgress.completed}/{weeklyProgress.target}</span>
                        </div>
                        <Progress value={weeklyProgress.percentage} className="h-2 bg-white/10" />
                      </div>
                    )}

                    {monthlyProgress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-white/70 mb-1">
                          <span>Monthly Goal</span>
                          <span>{monthlyProgress.completed}/{monthlyProgress.target}</span>
                        </div>
                        <Progress value={monthlyProgress.percentage} className="h-2 bg-white/10" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {habits.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-white opacity-40 mx-auto mb-3" />
                <p className="text-white opacity-60 text-sm">
                  No habits yet. Add your first habit to get started!
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl text-white mb-1">{completedToday}</div>
                <div className="text-xs text-white/70">Completed Today</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl text-white mb-1">
                  {habits.reduce((sum, habit) => sum + getStreakCount(habit), 0)}
                </div>
                <div className="text-xs text-white/70">Total Streaks</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-medium text-sm">Weekly Progress</h4>
            {habits.filter(h => h.weeklyTarget).map(habit => {
              const progress = getWeeklyProgress(habit);
              return progress ? (
                <div key={habit.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/80 flex items-center space-x-2">
                      <span>{habit.icon}</span>
                      <span>{habit.name}</span>
                    </span>
                    <span className="text-white/60">{progress.completed}/{progress.target}</span>
                  </div>
                  <Progress value={progress.percentage} className="h-2 bg-white/10" />
                </div>
              ) : null;
            })}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <div className="space-y-3">
            <Input
              placeholder="Habit name (e.g., Morning walk)"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            
            <div className="flex space-x-2">
              {["💪", "📚", "🧘", "💧", "🏃", "🥗", "😴", "📝"].map(icon => (
                <Button
                  key={icon}
                  variant={newHabitIcon === icon ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewHabitIcon(icon)}
                  className={newHabitIcon === icon 
                    ? "bg-white/20" 
                    : "text-white/70 border-white/20 hover:bg-white/10"
                  }
                >
                  {icon}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm opacity-80">Set a goal (optional)</label>
              <div className="flex space-x-2">
                <select
                  value={newGoalType}
                  onChange={(e) => setNewGoalType(e.target.value as 'streak' | 'frequency' | 'count')}
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="streak">Daily Streak</option>
                  <option value="frequency">Weekly Target</option>
                  <option value="count">Monthly Target</option>
                </select>
                
                {newGoalType !== 'streak' && (
                  <Input
                    placeholder="Target number"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    type="number"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 w-32"
                  />
                )}
              </div>
            </div>

            <Button
              onClick={handleAddHabit}
              disabled={!newHabitName.trim() || createHabitMutation.isPending}
              className="w-full bg-zen-sage hover:bg-zen-sage/80 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}