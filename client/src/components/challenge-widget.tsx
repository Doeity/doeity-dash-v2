import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Plus, Calendar, Target, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { Challenge, InsertChallenge } from "@shared/schema";

const CHALLENGE_CATEGORIES = [
  { value: "fitness", label: "Fitness", emoji: "💪" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "habits", label: "Habits", emoji: "✅" },
  { value: "productivity", label: "Productivity", emoji: "⚡" },
  { value: "creativity", label: "Creativity", emoji: "🎨" },
  { value: "mindfulness", label: "Mindfulness", emoji: "🧘" },
];

const CHALLENGE_DURATIONS = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 21, label: "21 days" },
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
];

export function ChallengeWidget() {
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const createChallenge = useMutation({
    mutationFn: async (data: InsertChallenge) => {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create challenge");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      setShowAddChallenge(false);
    },
  });

  const markDayComplete = useMutation({
    mutationFn: async ({ id, day }: { id: string; day: string }) => {
      const challenge = challenges.find(c => c.id === id);
      if (!challenge) return;

      let completedDays;
      try {
        completedDays = JSON.parse(challenge.completedDays);
      } catch {
        completedDays = [];
      }

      if (!completedDays.includes(day)) {
        completedDays.push(day);
      }

      const response = await fetch(`/api/challenges/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedDays: JSON.stringify(completedDays),
          currentDay: Math.min(challenge.currentDay + 1, challenge.duration),
        }),
      });
      if (!response.ok) throw new Error("Failed to mark day complete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
    },
  });

  const updateChallengeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/challenges/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update challenge status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const duration = parseInt(formData.get("duration") as string);
    const startDate = formData.get("startDate") as string;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    const rules = formData.get("rules") as string;
    let parsedRules: string[];
    try {
      parsedRules = rules.split('\n').map(rule => rule.trim()).filter(Boolean);
    } catch {
      parsedRules = [] as string[];
    }

    const challengeData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      duration,
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      rules: JSON.stringify(parsedRules),
      reward: formData.get("reward") as string || "",
      userId: "default-user",
    };

    createChallenge.mutate(challengeData);
  };

  const today = new Date().toISOString().split('T')[0];
  const activeChallenges = challenges.filter(c => c.status === 'active');

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Challenges</h3>
        </div>
        <Dialog open={showAddChallenge} onOpenChange={setShowAddChallenge}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Challenge Title</Label>
                <Input
                  name="title"
                  placeholder="e.g., 30-Day Push-up Challenge"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  name="description"
                  placeholder="What is this challenge about?"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHALLENGE_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.emoji} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select name="duration" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHALLENGE_DURATIONS.map(duration => (
                        <SelectItem key={duration.value} value={duration.value.toString()}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  name="startDate"
                  type="date"
                  defaultValue={today}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rules">Rules (one per line)</Label>
                <Textarea
                  name="rules"
                  placeholder="• Do 10 push-ups every morning&#10;• Take a photo as proof&#10;• No rest days"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="reward">Reward (optional)</Label>
                <Input
                  name="reward"
                  placeholder="e.g., Buy new workout gear"
                />
              </div>
              <Button type="submit" disabled={createChallenge.isPending}>
                Create Challenge
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {activeChallenges.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">
            No active challenges. Start your first challenge!
          </p>
        ) : (
          activeChallenges.map(challenge => {
            let completedDays;
            try {
              completedDays = JSON.parse(challenge.completedDays);
            } catch {
              completedDays = [];
            }

            const progressPercentage = (completedDays.length / challenge.duration) * 100;
            const category = CHALLENGE_CATEGORIES.find(c => c.value === challenge.category);
            const daysRemaining = challenge.duration - completedDays.length;
            const isToday = completedDays.includes(today);

            return (
              <div key={challenge.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category?.emoji}</span>
                    <div>
                      <h4 className="font-medium text-sm">{challenge.title}</h4>
                      <p className="text-xs text-gray-600 capitalize">
                        {challenge.category} • {challenge.duration} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {completedDays.length}/{challenge.duration}
                    </Badge>
                    {challenge.status === 'active' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => updateChallengeStatus.mutate({
                          id: challenge.id,
                          status: 'paused'
                        })}
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}% complete</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <p className="text-xs text-gray-600">{challenge.description}</p>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{daysRemaining} days remaining</span>
                    </div>
                  </div>
                  
                  {!isToday && challenge.status === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => markDayComplete.mutate({
                        id: challenge.id,
                        day: today
                      })}
                      disabled={markDayComplete.isPending}
                    >
                      Mark Today Complete
                    </Button>
                  )}
                  
                  {isToday && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      ✓ Completed today
                    </Badge>
                  )}
                </div>

                {challenge.reward && (
                  <div className="p-2 bg-yellow-50 rounded text-xs">
                    <span className="font-medium">Reward: </span>
                    <span>{challenge.reward}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}