import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Plus, Edit, Trash2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
// Card components removed - using glassmorphism divs instead
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { WorldClock, InsertWorldClock } from "@shared/schema";

const POPULAR_TIMEZONES = [
  { value: "America/New_York", label: "New York (EST)", city: "New York" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)", city: "Los Angeles" },
  { value: "Europe/London", label: "London (GMT)", city: "London" },
  { value: "Europe/Paris", label: "Paris (CET)", city: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", city: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", city: "Shanghai" },
  { value: "Asia/Dubai", label: "Dubai (GST)", city: "Dubai" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)", city: "Sydney" },
  { value: "America/Chicago", label: "Chicago (CST)", city: "Chicago" },
  { value: "Europe/Berlin", label: "Berlin (CET)", city: "Berlin" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", city: "Singapore" },
  { value: "America/Toronto", label: "Toronto (EST)", city: "Toronto" },
];

export function WorldClockWidget() {
  const [showAddClock, setShowAddClock] = useState(false);
  const [editingClock, setEditingClock] = useState<WorldClock | null>(null);
  const [currentTimes, setCurrentTimes] = useState<Record<string, Date>>({});
  const queryClient = useQueryClient();

  const { data: worldClocks = [] } = useQuery<WorldClock[]>({
    queryKey: ["/api/world-clocks"],
  });

  const createClock = useMutation({
    mutationFn: async (data: InsertWorldClock) => {
      const response = await fetch("/api/world-clocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create world clock");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/world-clocks"] });
      setShowAddClock(false);
      setEditingClock(null);
    },
  });

  const updateClock = useMutation({
    mutationFn: async ({ id, ...data }: Partial<WorldClock> & { id: string }) => {
      const response = await fetch(`/api/world-clocks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update world clock");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/world-clocks"] });
      setEditingClock(null);
    },
  });

  const deleteClock = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/world-clocks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete world clock");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/world-clocks"] });
    },
  });

  // Update times every second
  useEffect(() => {
    if (!worldClocks || worldClocks.length === 0) return;
    
    const updateTimes = () => {
      const times: Record<string, Date> = {};
      worldClocks.forEach(clock => {
        try {
          times[clock.id] = new Date().toLocaleString("en-US", {
            timeZone: clock.timezone,
          }) as any;
        } catch (error) {
          console.error(`Invalid timezone: ${clock.timezone}`);
        }
      });
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [worldClocks?.length]); // Only depend on the length to avoid infinite re-renders

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const selectedTimezone = formData.get("timezone") as string;
    const selectedCity = POPULAR_TIMEZONES.find(tz => tz.value === selectedTimezone);
    
    const clockData = {
      cityName: formData.get("cityName") as string || selectedCity?.city || "",
      timezone: selectedTimezone,
      displayName: formData.get("displayName") as string,
      order: parseInt(formData.get("order") as string) || 0,
      userId: "default-user",
    };

    if (editingClock) {
      updateClock.mutate({ id: editingClock.id, ...clockData });
    } else {
      createClock.mutate(clockData);
    }
  };

  const formatTime = (timezone: string): { time: string; date: string; period: string } => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });
      
      const dateString = now.toLocaleDateString("en-US", {
        timeZone: timezone,
        month: "short",
        day: "numeric",
      });

      const hour24 = parseInt(now.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour12: false,
        hour: "2-digit",
      }));

      const period = hour24 >= 6 && hour24 < 18 ? "day" : "night";

      return {
        time: timeString,
        date: dateString,
        period,
      };
    } catch (error) {
      return {
        time: "Invalid",
        date: "Invalid",
        period: "day",
      };
    }
  };

  const getSunriseSunset = (timezone: string) => {
    // This is a simplified calculation. In a real app, you'd use a proper sunrise/sunset API
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, 30, 0, 0); // Approximate sunrise
    const sunset = new Date(now);
    sunset.setHours(18, 30, 0, 0); // Approximate sunset

    return {
      sunrise: sunrise.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      sunset: sunset.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const sortedClocks = [...worldClocks].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">World Clock</h3>
        </div>
        <Dialog open={showAddClock} onOpenChange={setShowAddClock}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClock ? "Edit World Clock" : "Add World Clock"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select name="timezone" defaultValue={editingClock?.timezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_TIMEZONES.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  name="displayName"
                  defaultValue={editingClock?.displayName}
                  placeholder="e.g., Office NYC"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cityName">City Name (optional)</Label>
                <Input
                  name="cityName"
                  defaultValue={editingClock?.cityName}
                  placeholder="Will auto-fill from timezone"
                />
              </div>
              <div>
                <Label htmlFor="order">Order</Label>
                <Input
                  name="order"
                  type="number"
                  min="0"
                  defaultValue={editingClock?.order || 0}
                  placeholder="0"
                />
              </div>
              <Button type="submit" disabled={createClock.isPending || updateClock.isPending}>
                {editingClock ? "Update" : "Add"} Clock
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {sortedClocks.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">
            No world clocks added
          </p>
        ) : (
          sortedClocks.slice(0, 4).map(clock => {
            const { time, date, period } = formatTime(clock.timezone);
            const { sunrise, sunset } = getSunriseSunset(clock.timezone);
            
            return (
              <div key={clock.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    {period === "day" ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{clock.displayName}</h4>
                    <p className="text-xs text-gray-600">{clock.cityName}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono font-bold text-lg">{time}</div>
                  <div className="text-xs text-gray-600">{date}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                      <Sun className="w-3 h-3" />
                      <span>{sunrise}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Moon className="w-3 h-3" />
                      <span>{sunset}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setEditingClock(clock);
                      setShowAddClock(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                    onClick={() => deleteClock.mutate(clock.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })
        )}

        {sortedClocks.length > 4 && (
          <p className="text-xs text-gray-500 text-center">
            +{sortedClocks.length - 4} more clocks (scroll to see all)
          </p>
        )}
      </div>
    </div>
  );
}