import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { TimeTable, InsertTimeTable } from "@shared/schema";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export function TimeTableWidget() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimeTable | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery<TimeTable[]>({
    queryKey: ["/api/time-tables"],
  });

  const createEvent = useMutation({
    mutationFn: async (data: InsertTimeTable) => {
      const response = await fetch("/api/time-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tables"] });
      setShowAddDialog(false);
      setEditingEvent(null);
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TimeTable> & { id: string }) => {
      const response = await fetch(`/api/time-tables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tables"] });
      setEditingEvent(null);
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/time-tables/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tables"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const eventData = {
      dayOfWeek: parseInt(formData.get("dayOfWeek") as string),
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string || "",
      color: formData.get("color") as string || "#3b82f6",
      userId: "default-user",
    };

    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, ...eventData });
    } else {
      createEvent.mutate(eventData);
    }
  };

  const dayEvents = events.filter(event => event.dayOfWeek === selectedDay);
  const currentDay = DAYS_OF_WEEK.find(day => day.value === selectedDay);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Time Table</h3>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Time Slot" : "Add Time Slot"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select name="dayOfWeek" defaultValue={editingEvent?.dayOfWeek.toString() || selectedDay.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select name="startTime" defaultValue={editingEvent?.startTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Select name="endTime" defaultValue={editingEvent?.endTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  name="title"
                  defaultValue={editingEvent?.title}
                  placeholder="Event title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  name="description"
                  defaultValue={editingEvent?.description}
                  placeholder="Event description"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  name="color"
                  type="color"
                  defaultValue={editingEvent?.color || "#3b82f6"}
                />
              </div>
              <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
                {editingEvent ? "Update" : "Add"} Event
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {/* Day selector */}
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {DAYS_OF_WEEK.map(day => (
            <Button
              key={day.value}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(day.value)}
              className={`flex-shrink-0 transition-all duration-300 ${
                selectedDay === day.value 
                  ? "bg-zen-sage text-white" 
                  : "bg-white bg-opacity-20 border border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
              }`}
            >
              {day.label.slice(0, 3)}
            </Button>
          ))}
        </div>

        {/* Events for selected day */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-white opacity-80">
            {currentDay?.label} Schedule
          </h4>
          {dayEvents.length === 0 ? (
            <p className="text-sm text-white opacity-60 italic">No events scheduled</p>
          ) : (
            <div className="space-y-2">
              {dayEvents
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(event => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-white border-opacity-20 bg-white bg-opacity-5"
                    style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {event.startTime} - {event.endTime}
                        </Badge>
                        <span className="font-medium text-sm text-white">{event.title}</span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-white opacity-70 mt-1">{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditingEvent(event);
                          setShowAddDialog(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        onClick={() => deleteEvent.mutate(event.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}