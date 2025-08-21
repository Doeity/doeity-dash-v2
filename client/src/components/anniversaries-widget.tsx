import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Plus, Calendar, Gift, Edit, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { Anniversary, InsertAnniversary } from "@shared/schema";

const EVENT_TYPES = [
  { value: "birthday", label: "Birthday", emoji: "🎂" },
  { value: "anniversary", label: "Anniversary", emoji: "💕" },
  { value: "wedding", label: "Wedding", emoji: "💒" },
  { value: "graduation", label: "Graduation", emoji: "🎓" },
  { value: "work_anniversary", label: "Work Anniversary", emoji: "💼" },
  { value: "memorial", label: "Memorial", emoji: "🕯️" },
  { value: "other", label: "Other", emoji: "🎉" },
];

const RELATIONSHIPS = [
  { value: "family", label: "Family" },
  { value: "friend", label: "Friend" },
  { value: "colleague", label: "Colleague" },
  { value: "partner", label: "Partner" },
  { value: "other", label: "Other" },
];

const REMINDER_OPTIONS = [
  { value: 1, label: "1 day before" },
  { value: 3, label: "3 days before" },
  { value: 7, label: "1 week before" },
  { value: 14, label: "2 weeks before" },
  { value: 30, label: "1 month before" },
];

export function AnniversariesWidget() {
  const [showAddAnniversary, setShowAddAnniversary] = useState(false);
  const [editingAnniversary, setEditingAnniversary] = useState<Anniversary | null>(null);
  const queryClient = useQueryClient();

  const { data: anniversaries = [] } = useQuery<Anniversary[]>({
    queryKey: ["/api/anniversaries"],
  });

  const createAnniversary = useMutation({
    mutationFn: async (data: InsertAnniversary) => {
      const response = await fetch("/api/anniversaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create anniversary");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anniversaries"] });
      setShowAddAnniversary(false);
      setEditingAnniversary(null);
    },
  });

  const updateAnniversary = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Anniversary> & { id: string }) => {
      const response = await fetch(`/api/anniversaries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update anniversary");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anniversaries"] });
      setEditingAnniversary(null);
    },
  });

  const deleteAnniversary = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/anniversaries/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete anniversary");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/anniversaries"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const anniversaryData = {
      name: formData.get("name") as string,
      relationship: formData.get("relationship") as string,
      eventType: formData.get("eventType") as string,
      date: formData.get("date") as string, // MM-DD format
      year: formData.get("year") ? parseInt(formData.get("year") as string) : null,
      notes: formData.get("notes") as string || "",
      reminderDays: parseInt(formData.get("reminderDays") as string) || 7,
      userId: "default-user",
    };

    if (editingAnniversary) {
      updateAnniversary.mutate({ id: editingAnniversary.id, ...anniversaryData });
    } else {
      createAnniversary.mutate(anniversaryData);
    }
  };

  const calculateDaysUntil = (dateStr: string, year?: number): number => {
    const [month, day] = dateStr.split('-').map(Number);
    const currentYear = new Date().getFullYear();
    const targetYear = year || currentYear;
    
    // Create target date for this year
    let targetDate = new Date(currentYear, month - 1, day);
    
    // If the date has passed this year, use next year
    if (targetDate < new Date()) {
      targetDate = new Date(currentYear + 1, month - 1, day);
    }
    
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateAge = (dateStr: string, year?: number): number | null => {
    if (!year) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - year;
  };

  const formatDate = (dateStr: string): string => {
    const [month, day] = dateStr.split('-').map(Number);
    const date = new Date(2000, month - 1, day); // Use dummy year for formatting
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const getUpcoming = () => {
    return anniversaries
      .filter(anniversary => anniversary.isActive)
      .map(anniversary => ({
        ...anniversary,
        daysUntil: calculateDaysUntil(anniversary.date, anniversary.year),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  };

  const upcomingAnniversaries = getUpcoming();
  const todaysEvents = upcomingAnniversaries.filter(a => a.daysUntil === 0);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Anniversaries</h3>
        </div>
        <Dialog open={showAddAnniversary} onOpenChange={setShowAddAnniversary}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAnniversary ? "Edit Anniversary" : "Add Anniversary"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  name="name"
                  defaultValue={editingAnniversary?.name}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select name="eventType" defaultValue={editingAnniversary?.eventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.emoji} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select name="relationship" defaultValue={editingAnniversary?.relationship}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIPS.map(rel => (
                        <SelectItem key={rel.value} value={rel.value}>
                          {rel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date (MM-DD)</Label>
                  <Input
                    name="date"
                    placeholder="03-15"
                    pattern="[0-9]{2}-[0-9]{2}"
                    defaultValue={editingAnniversary?.date}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year (optional)</Label>
                  <Input
                    name="year"
                    type="number"
                    min="1900"
                    max="2100"
                    placeholder="1990"
                    defaultValue={editingAnniversary?.year || ""}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reminderDays">Reminder</Label>
                <Select name="reminderDays" defaultValue={editingAnniversary?.reminderDays?.toString() || "7"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  name="notes"
                  defaultValue={editingAnniversary?.notes}
                  placeholder="Special notes or gift ideas"
                  rows={2}
                />
              </div>
              <Button type="submit" disabled={createAnniversary.isPending || updateAnniversary.isPending}>
                {editingAnniversary ? "Update" : "Add"} Anniversary
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {/* Today's events */}
        {todaysEvents.length > 0 && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-red-600" />
              <h4 className="font-medium text-sm text-red-800">Today's Events!</h4>
            </div>
            {todaysEvents.map(anniversary => {
              const eventType = EVENT_TYPES.find(t => t.value === anniversary.eventType);
              const age = calculateAge(anniversary.date, anniversary.year);
              
              return (
                <div key={anniversary.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-red-800">
                      {anniversary.name}'s {eventType?.label}
                    </p>
                    {age && (
                      <p className="text-xs text-red-600">Turning {age} today!</p>
                    )}
                  </div>
                  <span className="text-lg">{eventType?.emoji}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Upcoming anniversaries */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Upcoming Events
          </h4>
          {upcomingAnniversaries.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center py-4">
              No anniversaries tracked
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingAnniversaries.filter(a => a.daysUntil > 0).slice(0, 4).map(anniversary => {
                const eventType = EVENT_TYPES.find(t => t.value === anniversary.eventType);
                const age = calculateAge(anniversary.date, anniversary.year);
                const isUpcoming = anniversary.daysUntil <= anniversary.reminderDays;

                return (
                  <div key={anniversary.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{eventType?.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{anniversary.name}</p>
                          {isUpcoming && (
                            <Bell className="w-3 h-3 text-orange-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 capitalize">
                          {anniversary.relationship} • {eventType?.label}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(anniversary.date)}
                          {age && ` (${age + 1} years old)`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <Badge 
                          variant={isUpcoming ? "destructive" : "outline"} 
                          className="text-xs"
                        >
                          {anniversary.daysUntil === 1 ? "Tomorrow" : `${anniversary.daysUntil} days`}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setEditingAnniversary(anniversary);
                            setShowAddAnniversary(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          onClick={() => deleteAnniversary.mutate(anniversary.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {anniversaries.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            {anniversaries.filter(a => a.isActive).length} total anniversaries tracked
          </div>
        )}
      </div>
    </div>
  );
}