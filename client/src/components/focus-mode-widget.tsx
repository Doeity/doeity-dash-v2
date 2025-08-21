import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Play, Square, Settings, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

interface FocusSession {
  id: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  actualDuration: number;
  blockedSites: string;
  sessionType: string;
  isActive: boolean;
  completionRate: number;
  createdAt: string;
}

interface InsertFocusSession {
  userId: string;
  duration: number;
  blockedSites: string;
  sessionType: string;
  isActive: boolean;
}

const SESSION_TYPES = [
  { value: "deep_work", label: "Deep Work", duration: 90 },
  { value: "pomodoro", label: "Pomodoro", duration: 25 },
  { value: "short_focus", label: "Short Focus", duration: 15 },
  { value: "long_focus", label: "Long Focus", duration: 120 },
  { value: "custom", label: "Custom", duration: 60 },
];

const COMMON_DISTRACTING_SITES = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "youtube.com",
  "reddit.com",
  "tiktok.com",
  "linkedin.com",
  "netflix.com",
  "amazon.com",
  "news.google.com",
];

export function FocusModeWidget() {
  const [showSettings, setShowSettings] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [customSite, setCustomSite] = useState("");
  const queryClient = useQueryClient();

  const { data: activeSessions = [] } = useQuery<FocusSession[]>({
    queryKey: ["/api/focus-sessions"],
    refetchInterval: isActive ? 30000 : false, // Only refresh when active, every 30 seconds
  });

  const startSession = useMutation({
    mutationFn: async (data: InsertFocusSession) => {
      const response = await fetch("/api/focus-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startTime: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to start focus session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      setShowSettings(false);
    },
  });

  const endSession = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/focus-sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
          isActive: false,
        }),
      });
      if (!response.ok) throw new Error("Failed to end focus session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
      setIsActive(false);
      setTimeRemaining(0);
    },
  });

  const activeSession = activeSessions.find(session => session.isActive);

  // Timer effect
  useEffect(() => {
    if (activeSession && activeSession.isActive) {
      setIsActive(true);
      const startTime = new Date(activeSession.startTime).getTime();
      const duration = activeSession.duration * 60 * 1000; // Convert to milliseconds
      
      const timer = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = Math.max(0, duration - elapsed);
        
        setTimeRemaining(Math.ceil(remaining / 1000));
        
        if (remaining <= 0) {
          endSession.mutate(activeSession.id);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setIsActive(false);
      setTimeRemaining(0);
    }
  }, [activeSession, endSession]);

  const handleStartSession = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const sessionType = formData.get("sessionType") as string;
    const selectedType = SESSION_TYPES.find(type => type.value === sessionType);
    const duration = sessionType === "custom" 
      ? parseInt(formData.get("customDuration") as string) 
      : selectedType?.duration || 25;

    const sessionData = {
      duration,
      blockedSites: JSON.stringify(selectedSites),
      sessionType,
      isActive: true,
      userId: "default-user",
    };

    startSession.mutate(sessionData);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const addCustomSite = () => {
    if (customSite && !selectedSites.includes(customSite)) {
      setSelectedSites([...selectedSites, customSite]);
      setCustomSite("");
    }
  };

  const removeSite = (site: string) => {
    setSelectedSites(selectedSites.filter(s => s !== site));
  };

  const progress = activeSession && timeRemaining > 0 
    ? ((activeSession.duration * 60 - timeRemaining) / (activeSession.duration * 60)) * 100 
    : 0;

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Focus Mode</h3>
        </div>
        {!isActive && (
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Start Focus Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleStartSession} className="space-y-4">
                <div>
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Select name="sessionType" defaultValue="pomodoro">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} ({type.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="customDuration">Custom Duration (minutes)</Label>
                  <Input
                    name="customDuration"
                    type="number"
                    min="1"
                    max="300"
                    defaultValue="25"
                    placeholder="25"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Blocked Websites</Label>
                  
                  {/* Common sites */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Common distracting sites:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {COMMON_DISTRACTING_SITES.map(site => (
                        <div key={site} className="flex items-center space-x-2">
                          <Switch
                            id={site}
                            checked={selectedSites.includes(site)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSites([...selectedSites, site]);
                              } else {
                                removeSite(site);
                              }
                            }}
                          />
                          <Label htmlFor={site} className="text-xs">
                            {site.replace('.com', '')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom site input */}
                  <div className="flex gap-2">
                    <Input
                      value={customSite}
                      onChange={(e) => setCustomSite(e.target.value)}
                      placeholder="example.com"
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addCustomSite}
                      disabled={!customSite}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Selected sites */}
                  {selectedSites.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Will be blocked:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedSites.map(site => (
                          <Badge
                            key={site}
                            variant="secondary"
                            className="text-xs cursor-pointer"
                            onClick={() => removeSite(site)}
                          >
                            {site} ✕
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={startSession.isPending} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Start Focus Session
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="space-y-4">
        {isActive && activeSession ? (
          <div className="space-y-4">
            {/* Active session display */}
            <div className="text-center space-y-2">
              <div className="text-2xl font-mono font-bold text-indigo-600">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600 capitalize">
                {activeSession.sessionType.replace('_', ' ')} session
              </p>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Blocked sites indicator */}
            {JSON.parse(activeSession.blockedSites).length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Sites Blocked</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(activeSession.blockedSites).slice(0, 4).map((site: string) => (
                    <Badge key={site} variant="destructive" className="text-xs">
                      {site}
                    </Badge>
                  ))}
                  {JSON.parse(activeSession.blockedSites).length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{JSON.parse(activeSession.blockedSites).length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* End session button */}
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => activeSession && endSession.mutate(activeSession.id)}
            >
              <Square className="w-4 h-4 mr-2" />
              End Session Early
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="space-y-2">
              <Clock className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">
                Ready to focus? Block distracting websites and stay productive.
              </p>
            </div>
            
            <Button
              onClick={() => setShowSettings(true)}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Focus Session
            </Button>

            {/* Recent sessions */}
            {activeSessions.filter(s => !s.isActive).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600">Recent sessions:</p>
                <div className="space-y-1">
                  {activeSessions
                    .filter(s => !s.isActive)
                    .slice(0, 2)
                    .map(session => (
                      <div key={session.id} className="flex justify-between text-xs text-gray-600">
                        <span className="capitalize">{session.sessionType.replace('_', ' ')}</span>
                        <span>{session.actualDuration}min • {session.completionRate}%</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}