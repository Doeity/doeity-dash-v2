import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Bell, Clock, Calendar, Repeat, Trash2, Edit, AlertCircle } from "lucide-react";
import WidgetClearControls from "@/components/widget-clear-controls";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addWeeks, addMonths, addYears, isAfter, isBefore } from "date-fns";

interface ReminderItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'annual';
  frequency: number; // 1 = every day/week/month/year, 2 = every 2 days/weeks/months/years
  timeOfDay?: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  monthAndDay?: string; // "MM-DD" for annual
  isActive: boolean;
  lastTriggered?: string;
  nextDue?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
}

export function RemindersWidget() {
  const [activeTab, setActiveTab] = useState("daily");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);
  const [deletedReminders, setDeletedReminders] = useState<ReminderItem[]>([]);
  const [newReminder, setNewReminder] = useState<Partial<ReminderItem>>({
    title: "",
    description: "",
    type: "daily",
    frequency: 1,
    timeOfDay: "09:00",
    priority: "medium",
    category: "General",
    isActive: true,
  });
  const { toast } = useToast();

  const { data: reminders = [], isLoading } = useQuery<ReminderItem[]>({
    queryKey: ["/api/reminders"],
  });

  const createReminderMutation = useMutation({
    mutationFn: (data: Omit<ReminderItem, 'id' | 'userId' | 'createdAt'>) => 
      apiRequest("POST", "/api/reminders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setShowAddDialog(false);
      setNewReminder({
        title: "",
        description: "",
        type: "daily",
        frequency: 1,
        timeOfDay: "09:00",
        priority: "medium",
        category: "General",
        isActive: true,
      });
      toast({ title: "Reminder created!", description: "Your reminder has been set up successfully." });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ReminderItem> }) => 
      apiRequest("PATCH", `/api/reminders/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setEditingReminder(null);
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/reminders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
  });

  const handleAddReminder = () => {
    if (!newReminder.title?.trim()) {
      toast({ title: "Title required", description: "Please enter a title for your reminder.", variant: "destructive" });
      return;
    }

    createReminderMutation.mutate({
      title: newReminder.title.trim(),
      description: newReminder.description || "",
      type: newReminder.type || "daily",
      frequency: newReminder.frequency || 1,
      timeOfDay: newReminder.timeOfDay,
      dayOfWeek: newReminder.dayOfWeek,
      dayOfMonth: newReminder.dayOfMonth,
      monthAndDay: newReminder.monthAndDay,
      isActive: newReminder.isActive !== false,
      priority: newReminder.priority || "medium",
      category: newReminder.category || "General",
    });
  };

  const toggleReminder = (reminder: ReminderItem) => {
    updateReminderMutation.mutate({
      id: reminder.id,
      updates: { isActive: !reminder.isActive },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getFrequencyText = (reminder: ReminderItem) => {
    const { type, frequency } = reminder;
    if (frequency === 1) {
      return type === 'daily' ? 'Daily' : type === 'weekly' ? 'Weekly' : type === 'monthly' ? 'Monthly' : 'Annually';
    }
    return `Every ${frequency} ${type === 'daily' ? 'days' : type === 'weekly' ? 'weeks' : type === 'monthly' ? 'months' : 'years'}`;
  };

  const handleClearData = () => {
    setDeletedReminders([...reminders]);
    reminders.forEach(reminder => {
      deleteReminderMutation.mutate(reminder.id);
    });
  };

  const handleRestoreData = () => {
    deletedReminders.forEach(reminder => {
      createReminderMutation.mutate({
        title: reminder.title,
        description: reminder.description,
        type: reminder.type,
        frequency: reminder.frequency,
        timeOfDay: reminder.timeOfDay,
        dayOfWeek: reminder.dayOfWeek,
        dayOfMonth: reminder.dayOfMonth,
        monthAndDay: reminder.monthAndDay,
        isActive: reminder.isActive,
        priority: reminder.priority,
        category: reminder.category,
      });
    });
    setDeletedReminders([]);
  };

  const handleLoadDummyData = () => {
    const dummyReminders = [
      {
        title: "Take vitamins",
        description: "Morning vitamin supplements",
        type: "daily" as const,
        frequency: 1,
        timeOfDay: "08:00",
        priority: "medium" as const,
        category: "Health",
        isActive: true,
      },
      {
        title: "Weekly team meeting",
        description: "Standup with the development team",
        type: "weekly" as const,
        frequency: 1,
        dayOfWeek: 1,
        timeOfDay: "10:00",
        priority: "high" as const,
        category: "Work",
        isActive: true,
      },
      {
        title: "Pay rent",
        description: "Monthly rent payment due",
        type: "monthly" as const,
        frequency: 1,
        dayOfMonth: 1,
        timeOfDay: "09:00",
        priority: "high" as const,
        category: "Financial",
        isActive: true,
      },
      {
        title: "Birthday celebration",
        description: "Remember to celebrate!",
        type: "annual" as const,
        frequency: 1,
        monthAndDay: "06-15",
        timeOfDay: "12:00",
        priority: "low" as const,
        category: "Personal",
        isActive: true,
      }
    ];

    dummyReminders.forEach(reminder => {
      createReminderMutation.mutate(reminder);
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white bg-opacity-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const remindersByType = {
    daily: reminders.filter(r => r.type === 'daily'),
    weekly: reminders.filter(r => r.type === 'weekly'),
    monthly: reminders.filter(r => r.type === 'monthly'),
    annual: reminders.filter(r => r.type === 'annual'),
  };

  const activeRemindersCount = reminders.filter(r => r.isActive).length;

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Reminders</h3>
          <Badge variant="outline" className="text-white opacity-60 border-white border-opacity-30">
            {activeRemindersCount} active
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Reminder title"
                  value={newReminder.title || ""}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newReminder.description || ""}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm opacity-80 mb-2 block">Type</label>
                    <select
                      value={newReminder.type}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white text-sm opacity-80 mb-2 block">Priority</label>
                    <select
                      value={newReminder.priority}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="time"
                    value={newReminder.timeOfDay || ""}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, timeOfDay: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    placeholder="Category"
                    value={newReminder.category || ""}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <Button onClick={handleAddReminder} className="w-full bg-zen-sage hover:bg-zen-sage/80 text-white">
                  Create Reminder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <WidgetClearControls
            onClearData={handleClearData}
            onRestoreData={handleRestoreData}
            onLoadDummyData={handleLoadDummyData}
            hasData={reminders.length > 0}
            hasDeletedData={deletedReminders.length > 0}
            widgetName="Reminders"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10">
          <TabsTrigger value="daily" className="data-[state=active]:bg-white/20 text-xs">
            Daily ({remindersByType.daily.length})
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-white/20 text-xs">
            Weekly ({remindersByType.weekly.length})
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-white/20 text-xs">
            Monthly ({remindersByType.monthly.length})
          </TabsTrigger>
          <TabsTrigger value="annual" className="data-[state=active]:bg-white/20 text-xs">
            Annual ({remindersByType.annual.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(remindersByType).map(([type, typeReminders]) => (
          <TabsContent key={type} value={type} className="mt-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {typeReminders.map((reminder) => (
                <Card key={reminder.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Switch
                          checked={reminder.isActive}
                          onCheckedChange={() => toggleReminder(reminder)}
                          className="data-[state=checked]:bg-zen-sage"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium text-sm">{reminder.title}</h4>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(reminder.priority)}`} />
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-white/60">
                            <span className="flex items-center space-x-1">
                              <Repeat className="h-3 w-3" />
                              <span>{getFrequencyText(reminder)}</span>
                            </span>
                            {reminder.timeOfDay && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{reminder.timeOfDay}</span>
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                              {reminder.category}
                            </Badge>
                          </div>
                          {reminder.description && (
                            <p className="text-xs text-white/50 mt-1">{reminder.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReminder(reminder)}
                          className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReminderMutation.mutate(reminder.id)}
                          className="text-white/60 hover:text-red-400 hover:bg-white/10 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {typeReminders.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-white opacity-40 mx-auto mb-2" />
                  <p className="text-white opacity-60 text-sm">
                    No {type} reminders yet.
                  </p>
                  <p className="text-white opacity-40 text-xs mt-1">
                    Click the + button to add one.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}