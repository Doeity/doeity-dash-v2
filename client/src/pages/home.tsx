import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import TimeDisplay from "@/components/time-display";
import PersonalGreeting from "@/components/personal-greeting";
import DailyQuote from "@/components/daily-quote";
import MainFocus from "@/components/main-focus";
import TodoWidget from "@/components/todo-widget";
import WeatherWidget from "@/components/weather-widget";
import NotesWidget from "@/components/notes-widget";
import ScheduleWidget from "@/components/schedule-widget";
import PomodoroWidget from "@/components/pomodoro-widget";
import HabitsWidget from "@/components/habits-widget";
import QuickAccessWidget from "@/components/quick-access-widget";
import TodaySummaryWidget from "@/components/today-summary-widget";
import DailyBookWidget from "@/components/daily-book-widget";
import WebsiteUsageWidget from "@/components/website-usage-widget";
import AICoachWidget from "@/components/ai-coach-widget";
import FocusMusicControl from "@/components/focus-music-control";
import ZenModeControl from "@/components/zen-mode-control";
import CalendarControl from "@/components/calendar-control";
import SettingsPanel from "@/components/settings-panel";
import { RemindersWidget } from "@/components/reminders-widget";
import { GoalsWidget } from "@/components/goals-widget";
import { LearningQueueWidget } from "@/components/learning-queue-widget";
import { ExpensesWidget } from "@/components/expenses-widget";
import { WorkoutWidget } from "@/components/workout-widget";
import { TimeTrackingWidget } from "@/components/time-tracking-widget";
import { LeaderboardWidget } from "@/components/leaderboard-widget";
import { TimeTableWidget } from "@/components/time-table-widget";
import { BodyCareWidget } from "@/components/body-care-widget";
import { MealPlannerWidget } from "@/components/meal-planner-widget";
import { FocusModeWidget } from "@/components/focus-mode-widget";
import { ProjectTrackerWidget } from "@/components/project-tracker-widget";
import { SubscriptionsWidget } from "@/components/subscriptions-widget";
import { ChallengeWidget } from "@/components/challenge-widget";
import { AIBrainstormWidget } from "@/components/ai-brainstorm-widget";
import { InternetSearchWidget } from "@/components/internet-search-widget";
import { WorldClockWidget } from "@/components/world-clock-widget";
import { WebActivityWidget } from "@/components/web-activity-widget";
import { AnniversariesWidget } from "@/components/anniversaries-widget";
import { NotificationCenterWidget } from "@/components/notification-center-widget";
import { SocialMediaHubWidget } from "@/components/social-media-hub-widget";
import { NewsFeedWidget } from "@/components/news-feed-widget";
import SearchWidget from "@/components/search-widget";
import BackgroundNavigation from "@/components/background-navigation";
import ThemeSchedulerWidget from "@/components/theme-scheduler-widget";
import WidgetLayoutsWidget from "@/components/widget-layouts-widget";
import DailyPhotoWidget from "@/components/daily-photo-widget";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [panelVisibility, setPanelVisibility] = useState<Record<string, boolean>>({});
  const [segmentVisibility, setSegmentVisibility] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredWidgets, setFilteredWidgets] = useState<string[]>([]);
  const [backgroundImage, setBackgroundImage] = useState(
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  );

  // Load settings for panel visibility
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    // Load background from localStorage
    const savedBackground = localStorage.getItem("backgroundImage");
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);

  useEffect(() => {
    // Load panel visibility from settings
    if (settings?.panelVisibility) {
      try {
        const visibility = JSON.parse(settings.panelVisibility);
        setPanelVisibility(visibility);
      } catch (e) {
        console.error("Failed to parse panel visibility settings");
        // Set all panels visible by default
        setPanelVisibility({
          todo: true,
          schedule: true,
          todaySummary: true,
          reminders: true,
          goals: true,
          timeTracking: true,
          habits: true,
          pomodoro: true,
          quickAccess: true,
          leaderboard: true,
          learningQueue: true,
          dailyBook: true,
          workout: true,
          expenses: true,
          aiCoach: true,
          websiteUsage: true,
          weather: true,
          notes: true,
          timeTable: true,
          bodyCare: true,
          mealPlanner: true,
          focusMode: true,
          projectTracker: true,
          subscriptions: true,
          challenge: true,
          aiBrainstorm: true,
          internetSearch: true,
          worldClock: true,
          webActivity: true,
          anniversaries: true,
          notificationCenter: true,
          socialMediaHub: true,
          newsFeed: true,
          themeScheduler: true,
          widgetLayouts: true,
          dailyPhoto: true,
        });
      }
    }
    
    // Load segment visibility from settings
    if (settings?.segmentVisibility) {
      try {
        const segmentVis = JSON.parse(settings.segmentVisibility);
        setSegmentVisibility(segmentVis);
      } catch (e) {
        console.error("Failed to parse segment visibility settings");
        // Default all segments to visible
        setSegmentVisibility({
          timeDisplay: true,
          dateDisplay: true,
          personalGreeting: true,
          searchWidget: true,
          dailyQuote: true,
          mainFocus: true,
        });
      }
    } else {
      // Default all segments to visible
      setSegmentVisibility({
        timeDisplay: true,
        dateDisplay: true,
        personalGreeting: true,
        searchWidget: true,
        dailyQuote: true,
        mainFocus: true,
      });
    }
  }, [settings]);

  const handleBackgroundChange = (newBackground: string) => {
    setBackgroundImage(newBackground);
    localStorage.setItem("backgroundImage", newBackground);
  };

  const handleSearchChange = (searchTerm: string, filteredWidgets: string[]) => {
    setSearchTerm(searchTerm);
    setFilteredWidgets(filteredWidgets);
  };

  const shouldShowWidget = (widgetId: string) => {
    const isVisible = panelVisibility[widgetId] !== false;
    const matchesSearch = !searchTerm || filteredWidgets.includes(widgetId);
    return isVisible && matchesSearch;
  };

  const shouldShowSegment = (segmentId: string) => {
    return segmentVisibility[segmentId] !== false;
  };

  return (
    <div className="font-inter min-h-screen overflow-hidden">
      {/* Background Container */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        
        {/* Upper Controls */}
        <div className="fixed top-6 right-6 flex items-center space-x-2">
          <FocusMusicControl />
          <ZenModeControl onZenModeToggle={setIsZenMode} />
          <CalendarControl />
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-zen-sage transition-colors duration-300 opacity-70 hover:opacity-100 hover:bg-white/10"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Time Display */}
        {shouldShowSegment('timeDisplay') && (
          <div className={`transition-all duration-500 ${isZenMode ? 'scale-110' : 'scale-100'}`}>
            <TimeDisplay />
          </div>
        )}

        {/* Personal Greeting */}
        {shouldShowSegment('personalGreeting') && (
          <div className={`transition-all duration-500 ${isZenMode ? 'opacity-80' : 'opacity-100'}`}>
            <PersonalGreeting />
          </div>
        )}

        {/* Search Widget */}
        {shouldShowSegment('searchWidget') && !isZenMode && (
          <div className="mb-8 max-w-md mx-auto">
            <SearchWidget onSearchChange={handleSearchChange} />
          </div>
        )}

        {/* Daily Quote */}
        {shouldShowSegment('dailyQuote') && (
          <div className={`transition-all duration-500 ${isZenMode ? 'opacity-60' : 'opacity-100'}`}>
            <DailyQuote />
          </div>
        )}

        {/* Main Focus Section */}
        {shouldShowSegment('mainFocus') && (
          <div className={`transition-all duration-500 ${isZenMode ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`}>
            <MainFocus />
          </div>
        )}

        {/* Comprehensive Life Management Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 w-full max-w-[2200px] mb-8 transition-all duration-500 ${
          isZenMode ? 'opacity-30 scale-95 blur-sm' : 'opacity-100 scale-100'
        }`}>
          {/* Core Productivity Widgets */}
          {shouldShowWidget('todo') && <TodoWidget />}
          {shouldShowWidget('schedule') && <ScheduleWidget />}
          {shouldShowWidget('timeTable') && <TimeTableWidget />}
          {shouldShowWidget('projectTracker') && <ProjectTrackerWidget />}
          {shouldShowWidget('todaySummary') && <TodaySummaryWidget />}
          {shouldShowWidget('reminders') && <RemindersWidget />}
          
          {/* Time & Focus Management */}
          {shouldShowWidget('goals') && <GoalsWidget />}
          {shouldShowWidget('timeTracking') && <TimeTrackingWidget />}
          {shouldShowWidget('habits') && <HabitsWidget />}
          {shouldShowWidget('pomodoro') && <PomodoroWidget />}
          {shouldShowWidget('focusMode') && <FocusModeWidget />}
          {shouldShowWidget('challenge') && <ChallengeWidget />}
          
          {/* Learning & Growth */}
          {shouldShowWidget('learningQueue') && <LearningQueueWidget />}
          {shouldShowWidget('dailyBook') && <DailyBookWidget />}
          {shouldShowWidget('aiBrainstorm') && <AIBrainstormWidget />}
          {shouldShowWidget('aiCoach') && <AICoachWidget />}
          {shouldShowWidget('leaderboard') && <LeaderboardWidget />}
          {shouldShowWidget('quickAccess') && <QuickAccessWidget />}
          
          {/* Health & Wellness */}
          {shouldShowWidget('bodyCare') && <BodyCareWidget />}
          {shouldShowWidget('mealPlanner') && <MealPlannerWidget />}
          {shouldShowWidget('workout') && <WorkoutWidget />}
          {shouldShowWidget('expenses') && <ExpensesWidget />}
          {shouldShowWidget('subscriptions') && <SubscriptionsWidget />}
          {shouldShowWidget('anniversaries') && <AnniversariesWidget />}
          
          {/* Information & Communication */}
          {shouldShowWidget('internetSearch') && <InternetSearchWidget />}
          {shouldShowWidget('worldClock') && <WorldClockWidget />}
          {shouldShowWidget('webActivity') && <WebActivityWidget />}
          {shouldShowWidget('websiteUsage') && <WebsiteUsageWidget />}
          {shouldShowWidget('notificationCenter') && <NotificationCenterWidget />}
          {shouldShowWidget('socialMediaHub') && <SocialMediaHubWidget />}
          
          {/* Essential Tools */}
          {shouldShowWidget('newsFeed') && <NewsFeedWidget />}
          {shouldShowWidget('weather') && <WeatherWidget />}
          {shouldShowWidget('notes') && <NotesWidget />}
          
          {/* Dashboard Management */}
          {shouldShowWidget('themeScheduler') && <ThemeSchedulerWidget />}
          {shouldShowWidget('widgetLayouts') && <WidgetLayoutsWidget />}
          {shouldShowWidget('dailyPhoto') && <DailyPhotoWidget />}
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="text-center text-white/70 text-sm mb-4">
            {filteredWidgets.length === 0 ? (
              "No widgets match your search"
            ) : (
              `Showing ${filteredWidgets.filter(id => shouldShowWidget(id)).length} widgets matching "${searchTerm}"`
            )}
          </div>
        )}

        {/* Background Navigation */}
        {!isZenMode && (
          <BackgroundNavigation 
            onBackgroundChange={handleBackgroundChange}
            currentBackground={backgroundImage}
          />
        )}

        {/* Bottom Actions */}
        <div className={`mt-8 flex items-center justify-center transition-all duration-500 ${
          isZenMode ? 'opacity-30' : 'opacity-100'
        }`}>
          <Button
            variant="ghost"
            className="text-white opacity-60 hover:opacity-100 hover:text-zen-blue transition-all duration-300 text-sm hover:bg-white/10"
          >
            <span className="mr-2">🌬️</span>
            Breathing Exercise
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        open={showSettings} 
        onOpenChange={setShowSettings}
        onBackgroundChange={handleBackgroundChange}
        currentBackground={backgroundImage}
        onPanelVisibilityChange={setPanelVisibility}
        onSegmentVisibilityChange={setSegmentVisibility}
        onQuoteRefresh={() => window.location.reload()}
      />
    </div>
  );
}
