import { useState } from "react";
import { Trophy, TrendingUp, Medal, Crown, Star, Calendar } from "lucide-react";
// Card components removed - using glassmorphism divs instead
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

interface LeaderboardStats {
  id: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  metric: string;
  value: number;
  target: number;
  rank: number;
  totalParticipants: number;
  lastUpdated: Date;
}

export function LeaderboardWidget() {
  const [activePeriod, setActivePeriod] = useState("weekly");

  const { data: leaderboardStats = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard-stats", activePeriod],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard-stats?period=${activePeriod}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard stats");
      return response.json();
    },
  });

  const metrics = [
    {
      key: "focus_time",
      label: "Focus Time",
      icon: "🎯",
      unit: "hours",
      color: "bg-blue-500/20 text-blue-300",
    },
    {
      key: "tasks_completed",
      label: "Tasks Done",
      icon: "✅",
      unit: "tasks",
      color: "bg-green-500/20 text-green-300",
    },
    {
      key: "workouts",
      label: "Workouts",
      icon: "💪",
      unit: "sessions",
      color: "bg-red-500/20 text-red-300",
    },
    {
      key: "learning_hours",
      label: "Learning",
      icon: "📚",
      unit: "hours",
      color: "bg-purple-500/20 text-purple-300",
    },
    {
      key: "habits_streak",
      label: "Habits Streak",
      icon: "🔥",
      unit: "days",
      color: "bg-orange-500/20 text-orange-300",
    },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-300" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-bold text-white/60">#{rank}</span>;
  };

  const getRankColor = (rank: number, total: number) => {
    const percentage = (rank / total) * 100;
    if (percentage <= 10) return "bg-yellow-500/20 text-yellow-300";
    if (percentage <= 25) return "bg-green-500/20 text-green-300";
    if (percentage <= 50) return "bg-blue-500/20 text-blue-300";
    return "bg-gray-500/20 text-gray-300";
  };

  const getMetricInfo = (metricKey: string) => {
    return metrics.find(m => m.key === metricKey) || metrics[0];
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === "hours") {
      return value >= 1 ? `${value.toFixed(1)}h` : `${Math.round(value * 60)}m`;
    }
    return `${value} ${unit}`;
  };

  const getCurrentScores = () => {
    // Mock current period scores for demonstration
    return [
      { metric: "focus_time", value: 28, target: 35, rank: 3, total: 15 },
      { metric: "tasks_completed", value: 42, target: 50, rank: 1, total: 15 },
      { metric: "workouts", value: 4, target: 5, rank: 2, total: 15 },
      { metric: "learning_hours", value: 12, target: 15, rank: 5, total: 15 },
      { metric: "habits_streak", value: 18, target: 21, rank: 4, total: 15 },
    ];
  };

  const getAchievements = () => {
    return [
      { name: "Consistency King", icon: "👑", description: "7-day streak", earned: true },
      { name: "Focus Master", icon: "🎯", description: "25+ hours focused", earned: true },
      { name: "Task Crusher", icon: "⚡", description: "50+ tasks completed", earned: false },
      { name: "Learning Beast", icon: "🧠", description: "20+ hours learning", earned: false },
    ];
  };

  const currentScores = getCurrentScores();
  const achievements = getAchievements();
  const overallRank = Math.round(currentScores.reduce((sum, score) => sum + score.rank, 0) / currentScores.length);

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
        <div className="flex items-center space-x-2 animate-pulse">
          <Trophy className="h-5 w-5" />
          <div className="h-4 bg-white/20 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Leaderboard</h3>
        </div>
        <Badge className={getRankColor(overallRank, 15)}>
          #{overallRank} Overall
        </Badge>
      </div>

      <div className="space-y-3">
        <Tabs value={activePeriod} onValueChange={setActivePeriod} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="weekly" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Week</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Month</TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Year</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activePeriod} className="space-y-3 mt-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-white/10 rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  {getRankIcon(overallRank)}
                  <span className="text-sm font-bold text-white">#{overallRank}</span>
                </div>
                <p className="text-xs text-white/60">Overall Rank</p>
              </div>
              <div className="text-center p-2 bg-white/10 rounded-lg">
                <p className="text-sm font-bold text-white">
                  {achievements.filter(a => a.earned).length}/{achievements.length}
                </p>
                <p className="text-xs text-white/60">Achievements</p>
              </div>
            </div>

            {/* Metric Rankings */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-white/80">This {activePeriod}:</p>
              {currentScores.slice(0, 3).map((score) => {
                const metricInfo = getMetricInfo(score.metric);
                const progress = Math.round((score.value / score.target) * 100);
                
                return (
                  <div
                    key={score.metric}
                    className="p-2 rounded-lg bg-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{metricInfo.icon}</span>
                        <span className="text-sm text-white font-medium">
                          {metricInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRankIcon(score.rank)}
                        <Badge className={getRankColor(score.rank, score.total)}>
                          #{score.rank}/{score.total}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">
                          {formatValue(score.value, metricInfo.unit)}
                        </span>
                        <span className="text-white/60">
                          {formatValue(score.target, metricInfo.unit)} target
                        </span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Achievements */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-white/80">Achievements:</p>
              <div className="grid grid-cols-2 gap-1">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className={`p-2 rounded text-center text-xs ${
                      achievement.earned 
                        ? "bg-yellow-500/20 text-yellow-300" 
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    <div className="text-sm mb-1">{achievement.icon}</div>
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-xs opacity-75">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivation */}
            <div className="text-center p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
              <p className="text-xs text-white/80">
                {overallRank <= 3 ? "🔥 You're on fire! Keep it up!" :
                 overallRank <= 5 ? "💪 Great progress! Push a bit more!" :
                 "📈 Every step counts! You've got this!"}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}