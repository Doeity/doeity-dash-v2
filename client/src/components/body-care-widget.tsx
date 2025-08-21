import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Plus, CheckCircle, Circle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface BodyCareRoutine {
  id: string;
  userId: string;
  name: string;
  type: string;
  timeOfDay: string;
  steps: string;
  isActive: boolean;
  lastCompleted: string;
  streak: number;
  createdAt: string;
}

interface InsertBodyCareRoutine {
  userId: string;
  name: string;
  type: string;
  timeOfDay: string;
  steps: string;
}

const CARE_TYPES = [
  { value: "skincare", label: "Skincare", emoji: "🧴" },
  { value: "hair_care", label: "Hair Care", emoji: "💇" },
  { value: "oral_care", label: "Oral Care", emoji: "🦷" },
  { value: "nail_care", label: "Nail Care", emoji: "💅" },
  { value: "body_care", label: "Body Care", emoji: "🛁" },
  { value: "wellness", label: "Wellness", emoji: "💆" },
];

const TIME_OF_DAY = [
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

export function BodyCareWidget() {
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<BodyCareRoutine | null>(null);
  const queryClient = useQueryClient();

  const { data: routines = [] } = useQuery<BodyCareRoutine[]>({
    queryKey: ["/api/body-care-routines"],
  });

  const createRoutine = useMutation({
    mutationFn: async (data: InsertBodyCareRoutine) => {
      const response = await fetch("/api/body-care-routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create routine");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/body-care-routines"] });
      setShowAddRoutine(false);
      setEditingRoutine(null);
    },
  });

  const markCompleted = useMutation({
    mutationFn: async (id: string) => {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/body-care-routines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          lastCompleted: today,
          streak: routines.find(r => r.id === id)?.streak || 0 + 1
        }),
      });
      if (!response.ok) throw new Error("Failed to mark routine complete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/body-care-routines"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const steps = formData.get("steps") as string;
    let parsedSteps: string[];
    try {
      parsedSteps = steps.split('\n').map(step => step.trim()).filter(Boolean);
    } catch {
      parsedSteps = [] as string[];
    }

    const routineData = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      timeOfDay: formData.get("timeOfDay") as string,
      steps: JSON.stringify(parsedSteps),
      userId: "default-user",
    };

    createRoutine.mutate(routineData);
  };

  const today = new Date().toISOString().split('T')[0];
  const activeRoutines = routines.filter(r => r.isActive);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Body Care</h3>
        </div>
        <Dialog open={showAddRoutine} onOpenChange={setShowAddRoutine}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Care Routine</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Routine Name</Label>
                <Input
                  name="name"
                  placeholder="e.g., Morning Skincare"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Care Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.emoji} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeOfDay">When</Label>
                  <Select name="timeOfDay" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OF_DAY.map(time => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="steps">Steps (one per line)</Label>
                <Textarea
                  name="steps"
                  placeholder="1. Cleanse face&#10;2. Apply toner&#10;3. Moisturize&#10;4. Apply sunscreen"
                  rows={6}
                  required
                />
              </div>
              <Button type="submit" disabled={createRoutine.isPending}>
                Add Routine
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {activeRoutines.length === 0 ? (
          <p className="text-sm text-white opacity-60 italic text-center py-4">
            No care routines added
          </p>
        ) : (
          activeRoutines.map(routine => {
            let steps;
            try {
              steps = JSON.parse(routine.steps);
            } catch {
              steps = [];
            }

            const isCompletedToday = routine.lastCompleted === today;
            const careType = CARE_TYPES.find(t => t.value === routine.type);

            return (
              <div key={routine.id} className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{careType?.emoji}</span>
                    <div>
                      <h4 className="font-medium text-sm text-white">{routine.name}</h4>
                      <p className="text-xs text-white opacity-70 capitalize">
                        {routine.timeOfDay} • {careType?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {routine.streak} day streak
                    </Badge>
                    <Button
                      size="sm"
                      variant={isCompletedToday ? "default" : "outline"}
                      className="h-7 w-7 p-0"
                      onClick={() => !isCompletedToday && markCompleted.mutate(routine.id)}
                      disabled={isCompletedToday}
                    >
                      {isCompletedToday ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-white opacity-80">Steps:</p>
                  <div className="space-y-1">
                    {steps.map((step: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <span className="text-white opacity-60">{index + 1}.</span>
                        <span className={isCompletedToday ? 'line-through text-white opacity-50' : 'text-white opacity-80'}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {isCompletedToday && (
                  <div className="flex items-center gap-1 text-xs text-green-300 bg-green-500 bg-opacity-20 p-2 rounded">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completed today!</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}