import { useQuery } from "@tanstack/react-query";
import { BarChart3, Target, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DailySummary } from "@shared/schema";

export default function TodaySummaryWidget() {
  const today = new Date().toISOString().split('T')[0];

  const { data: summary, isLoading } = useQuery<DailySummary>({
    queryKey: [`/api/daily-summary?date=${today}`],
  });

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-white bg-opacity-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Today's Summary</h3>
        </div>
        <p className="text-white opacity-60 text-sm">Start your day to see your progress!</p>
      </div>
    );
  }

  const tasksProgress = summary.totalTasks > 0 ? (summary.tasksCompleted / summary.totalTasks) * 100 : 0;
  const habitsProgress = summary.totalHabits > 0 ? (summary.habitsCompleted / summary.totalHabits) * 100 : 0;
  const focusHours = Math.floor(summary.focusTimeMinutes / 60);
  const focusMinutes = summary.focusTimeMinutes % 60;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-300";
    if (score >= 60) return "text-yellow-300";
    return "text-orange-300";
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Today's Summary</h3>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(summary.productivityScore)}`}>
          {summary.productivityScore}%
        </div>
      </div>

      <div className="space-y-4">
        {/* Productivity Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white opacity-80 text-sm flex items-center space-x-2">
              <TrendingUp className="h-3 w-3" />
              <span>Productivity Score</span>
            </span>
            <span className="text-white opacity-60 text-sm">{summary.productivityScore}%</span>
          </div>
          <Progress value={summary.productivityScore} className="h-2 bg-white bg-opacity-20" />
        </div>

        {/* Tasks Completed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white opacity-80 text-sm flex items-center space-x-2">
              <CheckCircle2 className="h-3 w-3" />
              <span>Tasks Completed</span>
            </span>
            <span className="text-white opacity-60 text-sm">
              {summary.tasksCompleted}/{summary.totalTasks}
            </span>
          </div>
          <Progress value={tasksProgress} className="h-2 bg-white bg-opacity-20" />
        </div>

        {/* Habits */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white opacity-80 text-sm flex items-center space-x-2">
              <Target className="h-3 w-3" />
              <span>Habits</span>
            </span>
            <span className="text-white opacity-60 text-sm">
              {summary.habitsCompleted}/{summary.totalHabits}
            </span>
          </div>
          <Progress value={habitsProgress} className="h-2 bg-white bg-opacity-20" />
        </div>

        {/* Focus Time */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-white opacity-80 text-sm flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>Focus Time</span>
            </span>
            <span className="text-white opacity-60 text-sm">
              {focusHours > 0 ? `${focusHours}h ` : ''}{focusMinutes}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}