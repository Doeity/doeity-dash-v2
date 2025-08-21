import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Clock, Calendar, Sun, Moon, Sunrise, Sunset, Snowflake, Flower, Leaf, Zap } from "lucide-react";
import WidgetClearControls from "@/components/widget-clear-controls";
import { useToast } from "@/hooks/use-toast";

interface ThemeSchedule {
  id: string;
  name: string;
  type: 'time' | 'season' | 'weather' | 'manual';
  isActive: boolean;
  schedule: {
    morning?: string; // Theme ID
    afternoon?: string;
    evening?: string;
    night?: string;
    spring?: string;
    summer?: string;
    autumn?: string;
    winter?: string;
    sunny?: string;
    cloudy?: string;
    rainy?: string;
    snowy?: string;
  };
  currentTheme?: string;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  backgroundType: 'gradient' | 'image' | 'solid';
  backgroundValue: string;
  textColor: string;
  accentColor: string;
  icon: string;
  isDefault?: boolean;
}

const DEFAULT_THEMES: Theme[] = [
  {
    id: 'zen-morning',
    name: 'Zen Morning',
    description: 'Soft blues and whites for peaceful mornings',
    primaryColor: '#E3F2FD',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#FFFFFF',
    accentColor: '#4FC3F7',
    icon: '🌅',
    isDefault: true,
  },
  {
    id: 'focus-day',
    name: 'Focus Day',
    description: 'Clean whites and grays for productivity',
    primaryColor: '#F5F5F5',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#FFFFFF',
    accentColor: '#2196F3',
    icon: '☀️',
    isDefault: true,
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Warm oranges and purples for evening',
    primaryColor: '#FFE0B2',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FF9800',
    icon: '🌅',
    isDefault: true,
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Dark',
    description: 'Deep blues and blacks for night time',
    primaryColor: '#1A1A1A',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    textColor: '#FFFFFF',
    accentColor: '#3F51B5',
    icon: '🌙',
    isDefault: true,
  },
  {
    id: 'spring-fresh',
    name: 'Spring Fresh',
    description: 'Light greens and pastels',
    primaryColor: '#E8F5E8',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    textColor: '#FFFFFF',
    accentColor: '#4CAF50',
    icon: '🌸',
    isDefault: true,
  },
  {
    id: 'summer-bright',
    name: 'Summer Bright',
    description: 'Vibrant yellows and blues',
    primaryColor: '#FFF9C4',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FFEB3B',
    icon: '☀️',
    isDefault: true,
  },
  {
    id: 'autumn-warm',
    name: 'Autumn Warm',
    description: 'Rich oranges and browns',
    primaryColor: '#FFCC80',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FF5722',
    icon: '🍂',
    isDefault: true,
  },
  {
    id: 'winter-cool',
    name: 'Winter Cool',
    description: 'Cool blues and whites',
    primaryColor: '#E1F5FE',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    textColor: '#FFFFFF',
    accentColor: '#00BCD4',
    icon: '❄️',
    isDefault: true,
  },
];

export default function ThemeSchedulerWidget() {
  const [currentSchedule, setCurrentSchedule] = useState<ThemeSchedule | null>(null);
  const [deletedSchedules, setDeletedSchedules] = useState<ThemeSchedule[]>([]);
  const { toast } = useToast();

  const { data: themes = DEFAULT_THEMES } = useQuery<Theme[]>({
    queryKey: ["/api/themes"],
    initialData: DEFAULT_THEMES,
  });

  const { data: schedules = [] } = useQuery<ThemeSchedule[]>({
    queryKey: ["/api/theme-schedules"],
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data: Omit<ThemeSchedule, 'id'>) => 
      apiRequest("POST", "/api/theme-schedules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme-schedules"] });
      toast({ title: "Schedule created!", description: "Your theme schedule is now active." });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ThemeSchedule> }) => 
      apiRequest("PATCH", `/api/theme-schedules/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme-schedules"] });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/theme-schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme-schedules"] });
    },
  });

  const applyThemeMutation = useMutation({
    mutationFn: (themeId: string) => 
      apiRequest("POST", "/api/apply-theme", { themeId }),
    onSuccess: (data, themeId) => {
      const theme = themes.find(t => t.id === themeId);
      toast({ 
        title: "Theme applied!", 
        description: `Switched to ${theme?.name || 'selected theme'}` 
      });
      // In a real app, this would update the global theme state
    },
  });

  const getCurrentTimeBasedTheme = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const createTimeBasedSchedule = () => {
    createScheduleMutation.mutate({
      name: 'Time-based Schedule',
      type: 'time',
      isActive: true,
      schedule: {
        morning: 'zen-morning',
        afternoon: 'focus-day',
        evening: 'sunset-glow',
        night: 'midnight-dark',
      },
    });
  };

  const createSeasonalSchedule = () => {
    createScheduleMutation.mutate({
      name: 'Seasonal Schedule',
      type: 'season',
      isActive: true,
      schedule: {
        spring: 'spring-fresh',
        summer: 'summer-bright',
        autumn: 'autumn-warm',
        winter: 'winter-cool',
      },
    });
  };

  const toggleSchedule = (schedule: ThemeSchedule) => {
    updateScheduleMutation.mutate({
      id: schedule.id,
      updates: { isActive: !schedule.isActive },
    });
  };

  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'morning': return <Sunrise className="h-4 w-4" />;
      case 'afternoon': return <Sun className="h-4 w-4" />;
      case 'evening': return <Sunset className="h-4 w-4" />;
      case 'night': return <Moon className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'spring': return <Flower className="h-4 w-4" />;
      case 'summer': return <Sun className="h-4 w-4" />;
      case 'autumn': return <Leaf className="h-4 w-4" />;
      case 'winter': return <Snowflake className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const handleClearData = () => {
    setDeletedSchedules([...schedules]);
    schedules.forEach(schedule => {
      deleteScheduleMutation.mutate(schedule.id);
    });
  };

  const handleRestoreData = () => {
    deletedSchedules.forEach(schedule => {
      createScheduleMutation.mutate({
        name: schedule.name,
        type: schedule.type,
        isActive: schedule.isActive,
        schedule: schedule.schedule,
      });
    });
    setDeletedSchedules([]);
  };

  const handleLoadDummyData = () => {
    createTimeBasedSchedule();
    setTimeout(() => createSeasonalSchedule(), 100);
  };

  const activeSchedules = schedules.filter(s => s.isActive);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Theme Scheduler</h3>
          <Badge variant="outline" className="text-white opacity-60 border-white border-opacity-30">
            {activeSchedules.length} active
          </Badge>
        </div>
        <WidgetClearControls
          onClearData={handleClearData}
          onRestoreData={handleRestoreData}
          onLoadDummyData={handleLoadDummyData}
          hasData={schedules.length > 0}
          hasDeletedData={deletedSchedules.length > 0}
          widgetName="Theme Scheduler"
        />
      </div>

      <Tabs defaultValue="schedules" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="schedules" className="data-[state=active]:bg-white/20">Schedules</TabsTrigger>
          <TabsTrigger value="themes" className="data-[state=active]:bg-white/20">Themes</TabsTrigger>
          <TabsTrigger value="quick" className="data-[state=active]:bg-white/20">Quick Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-3">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {schedules.map(schedule => {
              const currentTime = getCurrentTimeBasedTheme();
              const currentSeason = getCurrentSeason();
              const currentThemeId = schedule.type === 'time' 
                ? schedule.schedule[currentTime as keyof typeof schedule.schedule]
                : schedule.type === 'season'
                ? schedule.schedule[currentSeason as keyof typeof schedule.schedule]
                : schedule.currentTheme;
              
              const currentTheme = themes.find(t => t.id === currentThemeId);

              return (
                <Card key={schedule.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={schedule.isActive}
                          onCheckedChange={() => toggleSchedule(schedule)}
                          className="data-[state=checked]:bg-zen-sage"
                        />
                        <div>
                          <h4 className="text-white font-medium text-sm">{schedule.name}</h4>
                          <div className="flex items-center space-x-2 text-xs text-white/60">
                            <span className="capitalize">{schedule.type} based</span>
                            {currentTheme && (
                              <>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <span>{currentTheme.icon}</span>
                                  <span>{currentTheme.name}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {schedule.isActive && (
                          <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                            Active
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                          className="text-white/60 hover:text-red-400 hover:bg-white/10 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {schedules.length === 0 && (
              <div className="text-center py-8">
                <Palette className="h-12 w-12 text-white opacity-40 mx-auto mb-3" />
                <p className="text-white opacity-60 text-sm">
                  No theme schedules created yet.
                </p>
                <p className="text-white opacity-40 text-xs mt-1">
                  Use Quick Setup to get started.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="themes" className="space-y-3">
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {themes.map(theme => (
              <Card 
                key={theme.id} 
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => applyThemeMutation.mutate(theme.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{theme.icon}</span>
                    <h4 className="text-white font-medium text-sm">{theme.name}</h4>
                  </div>
                  <p className="text-xs text-white/60 mb-2">{theme.description}</p>
                  <div className="flex items-center space-x-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quick" className="space-y-4">
          <div className="space-y-3">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-white/70" />
                    <div>
                      <h4 className="text-white font-medium text-sm">Time-based Themes</h4>
                      <p className="text-xs text-white/60">Changes based on time of day</p>
                    </div>
                  </div>
                  <Button
                    onClick={createTimeBasedSchedule}
                    size="sm"
                    className="bg-zen-sage hover:bg-zen-sage/80 text-white"
                  >
                    Setup
                  </Button>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {['morning', 'afternoon', 'evening', 'night'].map(time => (
                    <div key={time} className="text-center">
                      <div className="text-white/60 text-xs mb-1 flex items-center justify-center">
                        {getTimeIcon(time)}
                      </div>
                      <div className="text-xs text-white/50 capitalize">{time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-white/70" />
                    <div>
                      <h4 className="text-white font-medium text-sm">Seasonal Themes</h4>
                      <p className="text-xs text-white/60">Changes with the seasons</p>
                    </div>
                  </div>
                  <Button
                    onClick={createSeasonalSchedule}
                    size="sm"
                    className="bg-zen-sage hover:bg-zen-sage/80 text-white"
                  >
                    Setup
                  </Button>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {['spring', 'summer', 'autumn', 'winter'].map(season => (
                    <div key={season} className="text-center">
                      <div className="text-white/60 text-xs mb-1 flex items-center justify-center">
                        {getSeasonIcon(season)}
                      </div>
                      <div className="text-xs text-white/50 capitalize">{season}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-xs text-white/50">
                Current time: {getCurrentTimeBasedTheme()} • Current season: {getCurrentSeason()}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}