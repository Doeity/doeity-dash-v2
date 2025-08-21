import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Monitor, 
  Palette, 
  Bell, 
  Shield, 
  Database, 
  Download, 
  Upload, 
  RotateCcw,
  Smartphone,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Globe,
  RefreshCw
} from "lucide-react";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackgroundChange: (background: string) => void;
  currentBackground: string;
  onPanelVisibilityChange?: (panelVisibility: Record<string, boolean>) => void;
  onSegmentVisibilityChange?: (segmentVisibility: Record<string, boolean>) => void;
  onQuoteRefresh?: () => void;
}

const BACKGROUND_OPTIONS = [
  {
    name: "Mountain Lake",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Forest Path",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Ocean Waves",
    url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Desert Sunset",
    url: "https://images.unsplash.com/photo-1516947786822-67505e0d4b3d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Lavender Field",
    url: "https://images.unsplash.com/photo-1498307833015-e7b400441eb8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Northern Lights",
    url: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  }
];

const WIDGET_OPTIONS = [
  { id: "todo", name: "To-Do List", icon: "✅", category: "Productivity" },
  { id: "schedule", name: "Today's Schedule", icon: "📅", category: "Productivity" },
  { id: "todaySummary", name: "Today's Summary", icon: "📊", category: "Analytics" },
  { id: "reminders", name: "Reminders", icon: "⏰", category: "Productivity" },
  { id: "goals", name: "Goals Tracker", icon: "🎯", category: "Personal Development" },
  { id: "timeTracking", name: "Time Tracking", icon: "⏱️", category: "Productivity" },
  { id: "habits", name: "Habits Tracker", icon: "🔄", category: "Personal Development" },
  { id: "pomodoro", name: "Pomodoro Timer", icon: "🍅", category: "Productivity" },
  { id: "quickAccess", name: "Quick Access", icon: "🔗", category: "Tools" },
  { id: "leaderboard", name: "Leaderboard", icon: "🏆", category: "Analytics" },
  { id: "learningQueue", name: "Learning Queue", icon: "📚", category: "Personal Development" },
  { id: "dailyBook", name: "Daily Book", icon: "📖", category: "Personal Development" },
  { id: "workout", name: "Workout Planner", icon: "💪", category: "Health" },
  { id: "expenses", name: "Expense Tracker", icon: "💰", category: "Finance" },
  { id: "aiCoach", name: "AI Coach", icon: "🤖", category: "Analytics" },
  { id: "websiteUsage", name: "Website Usage", icon: "📱", category: "Analytics" },
  { id: "weather", name: "Weather", icon: "🌤️", category: "Tools" },
  { id: "notes", name: "Smart Notes", icon: "📝", category: "Tools" },
  { id: "themeScheduler", name: "Theme Scheduler", icon: "🎨", category: "Appearance" },
  { id: "widgetLayouts", name: "Widget Layouts", icon: "📐", category: "Layout" },
  { id: "dailyPhoto", name: "Daily Photo", icon: "📸", category: "Tools" },
  { id: "timeTable", name: "Time Table", icon: "📋", category: "Productivity" },
  { id: "bodyCare", name: "Body Care", icon: "🧴", category: "Health" },
  { id: "mealPlanner", name: "Meal Planner", icon: "🍽️", category: "Health" },
  { id: "focusMode", name: "Focus Mode", icon: "🎯", category: "Productivity" },
  { id: "projectTracker", name: "Project Tracker", icon: "📂", category: "Productivity" },
  { id: "subscriptions", name: "Subscriptions", icon: "💳", category: "Finance" },
  { id: "challenge", name: "Challenges", icon: "🏅", category: "Personal Development" },
  { id: "aiBrainstorm", name: "AI Brainstorm", icon: "💡", category: "Analytics" },
  { id: "internetSearch", name: "Internet Search", icon: "🔍", category: "Tools" },
  { id: "worldClock", name: "World Clock", icon: "🌍", category: "Tools" },
  { id: "webActivity", name: "Web Activity", icon: "🌐", category: "Analytics" },
  { id: "anniversaries", name: "Anniversaries", icon: "🎉", category: "Personal" },
  { id: "notificationCenter", name: "Notifications", icon: "🔔", category: "Tools" },
  { id: "socialMediaHub", name: "Social Media", icon: "📱", category: "Social" },
  { id: "newsFeed", name: "News Feed", icon: "📰", category: "Information" },
];

const DASHBOARD_SEGMENTS = [
  { id: "timeDisplay", name: "Time Display", icon: "🕐", category: "Core" },
  { id: "dateDisplay", name: "Date Display", icon: "📅", category: "Core" },
  { id: "personalGreeting", name: "Personal Greeting", icon: "👋", category: "Core" },
  { id: "searchWidget", name: "Search Bar", icon: "🔍", category: "Core" },
  { id: "dailyQuote", name: "Daily Quote", icon: "💬", category: "Core" },
  { id: "mainFocus", name: "Main Focus", icon: "🎯", category: "Core" },
];

const NOTIFICATION_SETTINGS = [
  { id: "tasks", name: "Task Reminders", description: "Get notified about upcoming tasks" },
  { id: "habits", name: "Habit Reminders", description: "Daily habit completion reminders" },
  { id: "pomodoro", name: "Pomodoro Alerts", description: "Break and focus session notifications" },
  { id: "weather", name: "Weather Updates", description: "Daily weather forecasts" },
  { id: "goals", name: "Goal Progress", description: "Weekly goal progress updates" },
];

const AUTOMATION_SETTINGS = [
  { id: "autoTheme", name: "Auto Theme Switching", description: "Change themes based on time of day" },
  { id: "autoBackup", name: "Auto Backup", description: "Automatically backup your data daily" },
  { id: "autoUpdate", name: "Auto Widget Updates", description: "Keep widgets refreshed automatically" },
  { id: "smartNotifications", name: "Smart Notifications", description: "AI-powered notification timing" },
];

export default function SettingsPanel({ 
  open, 
  onOpenChange, 
  onBackgroundChange, 
  currentBackground,
  onPanelVisibilityChange,
  onSegmentVisibilityChange,
  onQuoteRefresh
}: SettingsPanelProps) {
  const [userName, setUserName] = useState("");
  const [customBackground, setCustomBackground] = useState("");
  const [panelVisibility, setPanelVisibility] = useState<Record<string, boolean>>({});
  const [segmentVisibility, setSegmentVisibility] = useState<Record<string, boolean>>({});
  const [showDummyData, setShowDummyData] = useState(true);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const [automation, setAutomation] = useState<Record<string, boolean>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [fontSize, setFontSize] = useState([16]);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [dataRetention, setDataRetention] = useState("30");

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Load settings when fetched
  useEffect(() => {
    if (settings) {
      if (settings.panelVisibility) {
        try {
          const visibility = JSON.parse(settings.panelVisibility);
          setPanelVisibility(visibility);
        } catch (e) {
          console.error("Failed to parse panel visibility settings");
        }
      }
      if (settings.segmentVisibility) {
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
      setShowDummyData(settings.showDummyData ?? true);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { userName?: string; backgroundImage?: string; panelVisibility?: string; segmentVisibility?: string; showDummyData?: boolean }) => 
      apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const handleUserNameChange = () => {
    if (userName.trim()) {
      updateSettingsMutation.mutate({ userName: userName.trim() });
    }
  };

  const handleCustomBackground = () => {
    if (customBackground.trim()) {
      onBackgroundChange(customBackground.trim());
      updateSettingsMutation.mutate({ backgroundImage: customBackground.trim() });
    }
  };

  const handlePanelToggle = (panelId: string, enabled: boolean) => {
    const updatedVisibility = { ...panelVisibility, [panelId]: enabled };
    setPanelVisibility(updatedVisibility);
    
    updateSettingsMutation.mutate({ 
      panelVisibility: JSON.stringify(updatedVisibility) 
    });
    
    if (onPanelVisibilityChange) {
      onPanelVisibilityChange(updatedVisibility);
    }
  };

  const handleSegmentToggle = (segmentId: string, enabled: boolean) => {
    const updatedVisibility = { ...segmentVisibility, [segmentId]: enabled };
    setSegmentVisibility(updatedVisibility);
    
    updateSettingsMutation.mutate({ 
      segmentVisibility: JSON.stringify(updatedVisibility) 
    });
    
    if (onSegmentVisibilityChange) {
      onSegmentVisibilityChange(updatedVisibility);
    }
  };

  const toggleAllPanels = (enabled: boolean) => {
    const allPanelsVisibility: Record<string, boolean> = {};
    WIDGET_OPTIONS.forEach(widget => {
      allPanelsVisibility[widget.id] = enabled;
    });
    
    setPanelVisibility(allPanelsVisibility);
    updateSettingsMutation.mutate({ 
      panelVisibility: JSON.stringify(allPanelsVisibility) 
    });
    
    if (onPanelVisibilityChange) {
      onPanelVisibilityChange(allPanelsVisibility);
    }
  };

  const toggleAllSegments = (enabled: boolean) => {
    const allSegmentsVisibility: Record<string, boolean> = {};
    DASHBOARD_SEGMENTS.forEach(segment => {
      allSegmentsVisibility[segment.id] = enabled;
    });
    
    setSegmentVisibility(allSegmentsVisibility);
    updateSettingsMutation.mutate({ 
      segmentVisibility: JSON.stringify(allSegmentsVisibility) 
    });
    
    if (onSegmentVisibilityChange) {
      onSegmentVisibilityChange(allSegmentsVisibility);
    }
  };

  const handleDummyDataToggle = (enabled: boolean) => {
    setShowDummyData(enabled);
    updateSettingsMutation.mutate({ showDummyData: enabled });
  };

  const getEnabledCount = () => {
    return Object.values(panelVisibility).filter(Boolean).length;
  };

  const getEnabledSegmentCount = () => {
    return Object.values(segmentVisibility).filter(Boolean).length;
  };

  const groupedWidgets = WIDGET_OPTIONS.reduce((acc, widget) => {
    if (!acc[widget.category]) acc[widget.category] = [];
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, typeof WIDGET_OPTIONS>);

  const groupedSegments = DASHBOARD_SEGMENTS.reduce((acc, segment) => {
    if (!acc[segment.category]) acc[segment.category] = [];
    acc[segment.category].push(segment);
    return acc;
  }, {} as Record<string, typeof DASHBOARD_SEGMENTS>);

  const handleQuoteRefresh = () => {
    if (onQuoteRefresh) {
      onQuoteRefresh();
    }
  };

  const handleExportData = () => {
    const data = {
      settings: settings,
      panels: panelVisibility,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] bg-white/95 backdrop-blur-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dashboard Settings
          </SheetTitle>
          <SheetDescription>
            Customize your personal dashboard experience and preferences
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="appearance" className="mt-6">
          <TabsList className="grid w-full grid-cols-5 text-xs">
            <TabsTrigger value="appearance">Style</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="automation">Auto</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              
              {/* Background Settings */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Monitor className="h-4 w-4" />
                    Background & Theme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Background Presets</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {BACKGROUND_OPTIONS.map((bg) => (
                        <Button
                          key={bg.url}
                          variant={currentBackground === bg.url ? "default" : "outline"}
                          size="sm"
                          className="h-20 relative overflow-hidden"
                          onClick={() => onBackgroundChange(bg.url)}
                        >
                          <div 
                            className="absolute inset-0 bg-cover bg-center opacity-60"
                            style={{ backgroundImage: `url(${bg.url})` }}
                          />
                          <span className="relative text-white font-medium shadow-lg">
                            {bg.name}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom-bg" className="text-sm font-medium">Custom Background URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="custom-bg"
                        placeholder="https://images.unsplash.com/..."
                        value={customBackground}
                        onChange={(e) => setCustomBackground(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleCustomBackground}
                        size="sm"
                        disabled={!customBackground.trim()}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Accessibility</Label>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Font Size: {fontSize[0]}px</Label>
                      <Slider
                        value={fontSize}
                        onValueChange={setFontSize}
                        max={24}
                        min={12}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Enable Animations</Label>
                        <p className="text-xs text-gray-600">Smooth transitions and effects</p>
                      </div>
                      <Switch 
                        checked={animationsEnabled}
                        onCheckedChange={setAnimationsEnabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quote Settings */}
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <RefreshCw className="h-4 w-4" />
                    Daily Quote
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Auto-refresh Quote</Label>
                      <p className="text-xs text-gray-600">Get a new inspirational quote daily</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Button 
                    onClick={handleQuoteRefresh}
                    className="w-full"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Quote Now
                  </Button>

                  <div>
                    <Label className="text-sm font-medium">Quote Categories</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {["Motivational", "Wisdom", "Success", "Mindfulness", "Leadership"].map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sound Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    Sound & Audio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Enable Sounds</Label>
                      <p className="text-xs text-gray-600">Notification sounds and focus music</p>
                    </div>
                    <Switch 
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>

                  {soundEnabled && (
                    <div className="space-y-2">
                      <Label className="text-sm">Volume: {volume[0]}%</Label>
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

            </ScrollArea>
          </TabsContent>

          {/* Widget Configuration Tab */}
          <TabsContent value="widgets" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              {/* Dashboard Segments Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Dashboard Segments</h3>
                    <p className="text-sm text-gray-600">
                      {getEnabledSegmentCount()} of {DASHBOARD_SEGMENTS.length} core segments enabled
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleAllSegments(false)}
                    >
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleAllSegments(true)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Show All
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(groupedSegments).map(([category, segments]) => (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-700">
                          {category} Elements
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {segments.map((segment) => (
                          <div
                            key={segment.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{segment.icon}</span>
                              <div>
                                <div className="font-medium text-sm">{segment.name}</div>
                                <div className="text-xs text-gray-500">{segment.category}</div>
                              </div>
                            </div>
                            <Switch
                              checked={segmentVisibility[segment.id] ?? true}
                              onCheckedChange={(checked) => handleSegmentToggle(segment.id, checked)}
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Widgets Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Widgets</h3>
                    <p className="text-sm text-gray-600">
                      {getEnabledCount()} of {WIDGET_OPTIONS.length} widgets enabled
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleAllPanels(false)}
                    >
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleAllPanels(true)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Show All
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(groupedWidgets).map(([category, widgets]) => (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-700">
                          {category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {widgets.map((widget) => (
                          <div
                            key={widget.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{widget.icon}</span>
                              <div>
                                <div className="font-medium text-sm">{widget.name}</div>
                                <div className="text-xs text-gray-500">{widget.category}</div>
                              </div>
                            </div>
                            <Switch
                              checked={panelVisibility[widget.id] ?? true}
                              onCheckedChange={(checked) => handlePanelToggle(widget.id, checked)}
                            />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {NOTIFICATION_SETTINGS.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">{setting.name}</Label>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      <Switch
                        checked={notifications[setting.id] ?? false}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, [setting.id]: checked }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Automation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {AUTOMATION_SETTINGS.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">{setting.name}</Label>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      <Switch
                        checked={automation[setting.id] ?? false}
                        onCheckedChange={(checked) => 
                          setAutomation(prev => ({ ...prev, [setting.id]: checked }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              
              {/* User Profile */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    User Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="username">Display Name</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="username"
                        placeholder={(settings as any)?.userName || "Enter your name"}
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleUserNameChange()}
                      />
                      <Button onClick={handleUserNameChange} disabled={!userName.trim()}>
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Settings */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Show Sample Data</Label>
                      <p className="text-sm text-gray-600">Display example content in widgets</p>
                    </div>
                    <Switch
                      checked={showDummyData}
                      onCheckedChange={handleDummyDataToggle}
                    />
                  </div>

                  <div>
                    <Label>Data Retention Period</Label>
                    <Select value={dataRetention} onValueChange={setDataRetention}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="never">Never delete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Import/Export</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExportData} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Export Settings
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Settings
                      </Button>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <Button variant="destructive" className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}