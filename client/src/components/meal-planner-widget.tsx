import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Utensils, Plus, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { MealPlan, InsertMealPlan } from "@shared/schema";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🍎" },
];

const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export function MealPlannerWidget() {
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState("weekly");
  const queryClient = useQueryClient();

  const { data: mealPlans = [] } = useQuery<MealPlan[]>({
    queryKey: ["/api/meal-plans"],
  });

  const createMeal = useMutation({
    mutationFn: async (data: InsertMealPlan) => {
      const response = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create meal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      setShowAddMeal(false);
    },
  });

  const toggleMealComplete = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const response = await fetch(`/api/meal-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      if (!response.ok) throw new Error("Failed to update meal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const ingredients = formData.get("ingredients") as string;
    let parsedIngredients: string[];
    try {
      parsedIngredients = ingredients.split(',').map(ing => ing.trim()).filter(Boolean);
    } catch {
      parsedIngredients = [];
    }

    const mealData = {
      date: formData.get("date") as string,
      mealType: formData.get("mealType") as string,
      name: formData.get("name") as string,
      ingredients: JSON.stringify(parsedIngredients),
      calories: parseInt(formData.get("calories") as string) || 0,
      protein: parseInt(formData.get("protein") as string) || 0,
      carbs: parseInt(formData.get("carbs") as string) || 0,
      fat: parseInt(formData.get("fat") as string) || 0,
      notes: formData.get("notes") as string || "",
      userId: "default-user",
    };

    createMeal.mutate(mealData);
  };

  // Get current week's dates
  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekDates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    
    return weekDates;
  };

  const weekDates = getWeekDates();
  const todaysMeals = mealPlans.filter(meal => meal.date === selectedDate);
  
  // Calculate daily nutrition
  const dailyNutrition = todaysMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const weeklyMeals = weekDates.map(date => ({
    date,
    dayName: DAYS_OF_WEEK[new Date(date).getDay()],
    meals: mealPlans.filter(meal => meal.date === date),
  }));

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex flex-row items-center justify-between space-y-0 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Utensils className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Meal Planner</h3>
        </div>
        <Dialog open={showAddMeal} onOpenChange={setShowAddMeal}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Meal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    name="date"
                    type="date"
                    defaultValue={selectedDate}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mealType">Meal Type</Label>
                  <Select name="mealType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.emoji} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="name">Meal Name</Label>
                <Input
                  name="name"
                  placeholder="e.g., Grilled Chicken Salad"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
                <Textarea
                  name="ingredients"
                  placeholder="e.g., chicken breast, lettuce, tomatoes, olive oil"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    name="calories"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    name="protein"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    name="carbs"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    name="fat"
                    type="number"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  name="notes"
                  placeholder="Cooking instructions, preferences, etc."
                  rows={2}
                />
              </div>
              <Button type="submit" disabled={createMeal.isPending}>
                Add Meal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="weekly" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Weekly Plan</TabsTrigger>
            <TabsTrigger value="daily" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Daily Log</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4">
            <div className="space-y-3">
              {weeklyMeals.map(({ date, dayName, meals }) => (
                <div key={date} className="border border-white border-opacity-30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm flex items-center gap-2 text-white">
                      <Calendar className="w-4 h-4 text-white opacity-80" />
                      {dayName} - {new Date(date).toLocaleDateString()}
                    </h4>
                    <Badge variant="outline" className="text-xs text-white opacity-60">
                      {meals.length} meals
                    </Badge>
                  </div>
                  
                  {meals.length === 0 ? (
                    <p className="text-xs text-white opacity-60 italic">No meals planned</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {MEAL_TYPES.map(type => {
                        const meal = meals.find(m => m.mealType === type.value);
                        return (
                          <div
                            key={type.value}
                            className={`p-2 rounded border text-xs ${
                              meal ? 'bg-white bg-opacity-20 border-white border-opacity-40 text-white' : 'bg-white bg-opacity-10 border-white border-opacity-20 text-white opacity-60'
                            }`}
                          >
                            <div className="font-medium text-white">
                              {type.emoji} {type.label}
                            </div>
                            {meal ? (
                              <div className="text-white opacity-80">
                                {meal.name}
                                <div className="text-xs">{meal.calories} cal</div>
                              </div>
                            ) : (
                              <div className="text-white opacity-50">Not planned</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>

            {/* Daily nutrition summary */}
            <div className="p-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg">
              <h4 className="font-medium text-sm flex items-center gap-2 mb-2 text-white">
                <TrendingUp className="w-4 h-4 text-white opacity-80" />
                Daily Nutrition
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-white">
                <div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Calories:</span>
                    <span className="font-medium">{dailyNutrition.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Protein:</span>
                    <span className="font-medium">{dailyNutrition.protein}g</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Carbs:</span>
                    <span className="font-medium">{dailyNutrition.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Fat:</span>
                    <span className="font-medium">{dailyNutrition.fat}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meals for selected day */}
            <div className="space-y-3">
              {MEAL_TYPES.map(type => {
                const meals = todaysMeals.filter(meal => meal.mealType === type.value);
                return (
                  <div key={type.value} className="border border-white border-opacity-30 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2 text-white">
                      {type.emoji} {type.label}
                    </h4>
                    
                    {meals.length === 0 ? (
                      <p className="text-xs text-white opacity-60 italic">No {type.label.toLowerCase()} logged</p>
                    ) : (
                      <div className="space-y-2">
                        {meals.map(meal => (
                          <div key={meal.id} className="flex items-center gap-3 p-2 bg-white bg-opacity-10 rounded">
                            <Checkbox
                              checked={meal.isCompleted}
                              onCheckedChange={(checked) => 
                                toggleMealComplete.mutate({
                                  id: meal.id,
                                  isCompleted: checked as boolean
                                })
                              }
                              className="w-4 h-4 border-white border-opacity-50 data-[state=checked]:bg-zen-sage data-[state=checked]:border-zen-sage"
                            />
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${meal.isCompleted ? 'line-through text-white opacity-60' : 'text-white opacity-90'}`}>
                                {meal.name}
                              </p>
                              <div className="text-xs text-white opacity-70">
                                {meal.calories} cal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}