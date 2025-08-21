import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SearchWidgetProps {
  onSearchChange: (searchTerm: string, filteredWidgets: string[]) => void;
}

const WIDGET_SEARCH_DATA = [
  { id: "todo", name: "To-Do List", keywords: ["tasks", "checklist", "productivity", "goals", "organize"] },
  { id: "schedule", name: "Today's Schedule", keywords: ["calendar", "events", "appointments", "meetings", "time"] },
  { id: "todaySummary", name: "Today's Summary", keywords: ["analytics", "progress", "metrics", "overview", "stats"] },
  { id: "reminders", name: "Reminders", keywords: ["alerts", "notifications", "memory", "remember", "notice"] },
  { id: "goals", name: "Goals Tracker", keywords: ["targets", "objectives", "achievements", "progress", "motivation"] },
  { id: "timeTracking", name: "Time Tracking", keywords: ["productivity", "work", "hours", "monitor", "efficiency"] },
  { id: "habits", name: "Habits Tracker", keywords: ["routine", "daily", "streak", "consistency", "discipline"] },
  { id: "pomodoro", name: "Pomodoro Timer", keywords: ["focus", "work", "breaks", "concentration", "productivity"] },
  { id: "quickAccess", name: "Quick Access", keywords: ["links", "bookmarks", "shortcuts", "websites", "navigation"] },
  { id: "leaderboard", name: "Leaderboard", keywords: ["competition", "ranking", "scores", "achievements", "gamification"] },
  { id: "learningQueue", name: "Learning Queue", keywords: ["education", "courses", "books", "knowledge", "study"] },
  { id: "dailyBook", name: "Daily Book", keywords: ["reading", "literature", "recommendations", "knowledge", "learning"] },
  { id: "workout", name: "Workout Planner", keywords: ["fitness", "exercise", "health", "training", "gym"] },
  { id: "expenses", name: "Expense Tracker", keywords: ["money", "budget", "finance", "spending", "costs"] },
  { id: "aiCoach", name: "AI Coach", keywords: ["insights", "recommendations", "advice", "guidance", "artificial intelligence"] },
  { id: "websiteUsage", name: "Website Usage", keywords: ["analytics", "browsing", "time", "internet", "tracking"] },
  { id: "weather", name: "Weather", keywords: ["forecast", "temperature", "climate", "conditions", "outdoors"] },
  { id: "notes", name: "Quick Notes", keywords: ["writing", "thoughts", "memo", "ideas", "journal"] }
];

export default function SearchWidget({ onSearchChange }: SearchWidgetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredWidgets = useMemo(() => {
    if (!searchTerm.trim()) {
      return WIDGET_SEARCH_DATA.map(w => w.id);
    }

    const term = searchTerm.toLowerCase();
    return WIDGET_SEARCH_DATA
      .filter(widget => 
        widget.name.toLowerCase().includes(term) ||
        widget.keywords.some(keyword => keyword.toLowerCase().includes(term))
      )
      .map(w => w.id);
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value, filteredWidgets);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearchChange("", WIDGET_SEARCH_DATA.map(w => w.id));
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            type="text"
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {searchTerm && (
          <div className="mt-2 text-xs text-white/70">
            {filteredWidgets.length === 0 ? (
              "No widgets found"
            ) : filteredWidgets.length === WIDGET_SEARCH_DATA.length ? (
              "Showing all widgets"
            ) : (
              `Showing ${filteredWidgets.length} of ${WIDGET_SEARCH_DATA.length} widgets`
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}