import { useState } from "react";
import { Timer, Plus, Play, Pause, Square, Clock, BarChart3, X } from "lucide-react";
// Card components removed - using glassmorphism divs instead
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TimeEntry {
  id: string;
  project: string;
  task: string;
  category: string;
  startTime: string;
  endTime: string | null;
  duration: number; // minutes
  description: string;
  isActive: boolean;
  date: string;
}

export function TimeTrackingWidget() {
  const [newEntry, setNewEntry] = useState({
    project: "",
    task: "",
    category: "work",
    description: "",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentTimer, setCurrentTimer] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];
  
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ["/api/time-tracking", today],
    queryFn: async () => {
      const response = await fetch(`/api/time-tracking?date=${today}`);
      if (!response.ok) throw new Error("Failed to fetch time entries");
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for active timers
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entry: typeof newEntry & { startTime: string; isActive: boolean }) => {
      const response = await fetch("/api/time-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!response.ok) throw new Error("Failed to create time entry");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tracking"] });
      if (data.isActive) {
        setCurrentTimer(data.id);
      }
      setShowAddDialog(false);
      setNewEntry({
        project: "",
        task: "",
        category: "work",
        description: "",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TimeEntry> }) => {
      const response = await fetch(`/api/time-tracking/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update time entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tracking"] });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/time-tracking/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete time entry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tracking"] });
    },
  });

  const categories = [
    { value: "work", label: "💼 Work", color: "bg-blue-500/20 text-blue-300" },
    { value: "personal", label: "🏠 Personal", color: "bg-green-500/20 text-green-300" },
    { value: "learning", label: "📚 Learning", color: "bg-purple-500/20 text-purple-300" },
    { value: "health", label: "🏥 Health", color: "bg-red-500/20 text-red-300" },
    { value: "creative", label: "🎨 Creative", color: "bg-pink-500/20 text-pink-300" },
    { value: "social", label: "👥 Social", color: "bg-yellow-500/20 text-yellow-300" },
  ];

  const quickTasks = [
    { project: "Work", task: "Email", category: "work" },
    { project: "Work", task: "Meeting", category: "work" },
    { project: "Personal", task: "Exercise", category: "health" },
    { project: "Learning", task: "Reading", category: "learning" },
  ];

  const startTimer = (task: string, project: string, category: string) => {
    createEntryMutation.mutate({
      project,
      task,
      category,
      description: "",
      startTime: new Date().toISOString(),
      isActive: true,
    });
  };

  const stopTimer = (entry: TimeEntry) => {
    const now = new Date();
    const start = new Date(entry.startTime);
    const duration = Math.round((now.getTime() - start.getTime()) / (1000 * 60));
    
    updateEntryMutation.mutate({
      id: entry.id,
      updates: {
        endTime: now.toISOString(),
        duration,
        isActive: false,
      },
    });
    setCurrentTimer(null);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getActiveTimer = () => {
    return timeEntries.find((entry: TimeEntry) => entry.isActive);
  };

  const getTotalTimeToday = () => {
    return timeEntries
      .filter((entry: TimeEntry) => !entry.isActive)
      .reduce((total: number, entry: TimeEntry) => total + entry.duration, 0);
  };

  const getTimeByCategory = () => {
    const categoryTimes: Record<string, number> = {};
    timeEntries
      .filter((entry: TimeEntry) => !entry.isActive)
      .forEach((entry: TimeEntry) => {
        categoryTimes[entry.category] = (categoryTimes[entry.category] || 0) + entry.duration;
      });
    return categoryTimes;
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  const activeTimer = getActiveTimer();
  const totalTime = getTotalTimeToday();
  const categoryTimes = getTimeByCategory();

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
        <div className="flex items-center space-x-2 animate-pulse">
          <Timer className="h-5 w-5" />
          <div className="h-4 bg-white/20 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Time Tracking</h3>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-sm max-w-md">
            <DialogHeader>
              <DialogTitle>Start Time Tracking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {quickTasks.map((quick, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewEntry({
                        project: quick.project,
                        task: quick.task,
                        category: quick.category,
                        description: "",
                      });
                    }}
                    className="text-xs h-auto py-2 justify-start"
                  >
                    {quick.task}
                  </Button>
                ))}
              </div>

              <Input
                placeholder="Project name"
                value={newEntry.project}
                onChange={(e) => setNewEntry({ ...newEntry, project: e.target.value })}
              />

              <Input
                placeholder="Task name"
                value={newEntry.task}
                onChange={(e) => setNewEntry({ ...newEntry, task: e.target.value })}
              />

              <Select
                value={newEntry.category}
                onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Description (optional)"
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              />

              <Button
                onClick={() => {
                  createEntryMutation.mutate({
                    ...newEntry,
                    startTime: new Date().toISOString(),
                    isActive: true,
                  });
                }}
                disabled={!newEntry.project || !newEntry.task || createEntryMutation.isPending}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {/* Active Timer */}
        {activeTimer && (
          <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white">
                  {activeTimer.task}
                </h4>
                <p className="text-xs text-white/60">
                  {activeTimer.project} • Started {new Date(activeTimer.startTime).toLocaleTimeString()}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => stopTimer(activeTimer)}
                className="h-8 bg-red-500 hover:bg-red-600"
              >
                <Square className="h-3 w-3 mr-1" />
                Stop
              </Button>
            </div>
          </div>
        )}

        {/* Quick Start */}
        {!activeTimer && (
          <div className="grid grid-cols-2 gap-2">
            {quickTasks.slice(0, 4).map((quick, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => startTimer(quick.task, quick.project, quick.category)}
                className="text-xs h-8 justify-start"
              >
                <Play className="h-3 w-3 mr-1" />
                {quick.task}
              </Button>
            ))}
          </div>
        )}

        {/* Today's Summary */}
        <div className="space-y-2">
          <div className="text-center p-2 bg-white/10 rounded-lg">
            <p className="text-lg font-bold text-white">
              {formatDuration(totalTime)}
            </p>
            <p className="text-xs text-white/60">
              Total time today
            </p>
          </div>

          {Object.keys(categoryTimes).length > 0 && (
            <div className="space-y-1">
              {Object.entries(categoryTimes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([category, time]) => {
                  const categoryInfo = getCategoryInfo(category);
                  const percentage = totalTime > 0 ? Math.round((time / totalTime) * 100) : 0;
                  return (
                    <div key={category} className="flex items-center justify-between text-xs">
                      <Badge className={categoryInfo.color}>
                        {categoryInfo.label}
                      </Badge>
                      <span className="text-white/80">
                        {formatDuration(time)} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="space-y-1 max-h-32 overflow-y-auto">
          <p className="text-xs font-medium text-white/80">Recent entries:</p>
          {timeEntries
            .filter((entry: TimeEntry) => !entry.isActive)
            .slice(0, 3)
            .map((entry: TimeEntry) => {
              const categoryInfo = getCategoryInfo(entry.category);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white truncate">
                        {entry.task}
                      </span>
                      <Badge className={`${categoryInfo.color} text-xs`}>
                        {categoryInfo.label.split(' ')[1]}
                      </Badge>
                    </div>
                    <p className="text-xs text-white/60">
                      {entry.project} • {formatDuration(entry.duration)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEntryMutation.mutate(entry.id)}
                    className="h-6 w-6 p-0 text-white/60 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}