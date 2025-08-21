import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertUserSettingsSchema,
  insertScheduleEventSchema,
  insertHabitSchema,
  insertQuickLinkSchema,
  insertDailySummarySchema,
  insertDailyBookSchema,
  insertWebsiteUsageSchema,
  insertAIInsightSchema,
  insertReminderSchema,
  insertGoalSchema,
  insertLearningQueueSchema,
  insertExpenseSchema,
  insertTimeTrackingSchema,
  insertWorkoutPlanSchema,
  insertWorkoutSessionSchema,
  insertMealPlanSchema,
  insertBodyCareRoutineSchema,
  insertSkillProgressSchema,
  insertFocusSessionSchema,
  insertLeaderboardStatsSchema,
  insertWidgetConfigSchema,
  insertTimeTableSchema,
  insertProjectSchema,
  insertProjectMilestoneSchema,
  insertSubscriptionSchema,
  insertChallengeSchema,
  insertWorldClockSchema,
  insertWebActivitySchema,
  insertAnniversarySchema,
  insertNotificationSchema,
  insertSocialMediaPostSchema,
  insertNewsArticleSchema,
  insertBrainstormSessionSchema,
  insertSearchHistorySchema
} from "@shared/schema";
import { z } from "zod";

const updateTaskSchema = z.object({
  text: z.string().optional(),
  completed: z.boolean().optional(),
  order: z.number().optional(),
});

const updateSettingsSchema = insertUserSettingsSchema.partial().omit({ userId: true });
const updateScheduleEventSchema = z.object({
  title: z.string().optional(),
  time: z.string().optional(),
  completed: z.boolean().optional(),
  date: z.string().optional(),
});
const updateHabitSchema = z.object({
  name: z.string().optional(),
  icon: z.string().optional(),
  streak: z.number().optional(),
  lastCompleted: z.string().optional(),
});
const updateQuickLinkSchema = z.object({
  name: z.string().optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = "default-user";

  // Get daily quote from external API
  app.get("/api/quote", async (req, res) => {
    try {
      const response = await fetch("https://api.quotable.io/random?minLength=50&maxLength=150&tags=wisdom,motivational,inspirational");
      if (!response.ok) {
        throw new Error("Failed to fetch quote");
      }
      const data = await response.json();
      res.json({
        text: data.content,
        author: data.author,
      });
    } catch (error) {
      console.error("Quote API error:", error);
      res.json({
        text: "The present moment is the only time over which we have dominion.",
        author: "Thich Nhat Hanh",
      });
    }
  });

  // Get weather data
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;
      
      if (!apiKey) {
        throw new Error("Weather API key not configured");
      }
      
      if (!lat || !lon) {
        throw new Error("Location coordinates required");
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      
      const data = await response.json();
      
      res.json({
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        location: data.name,
        high: Math.round(data.main.temp_max),
        low: Math.round(data.main.temp_min),
        icon: data.weather[0].icon,
      });
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ 
        error: "Weather data unavailable",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks(DEFAULT_USER_ID);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Create new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid task data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create task" });
      }
    }
  });

  // Update task
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = updateTaskSchema.parse(req.body);
      
      const task = await storage.updateTask(id, updates);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid update data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update task" });
      }
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Get user settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getUserSettings(DEFAULT_USER_ID);
      if (!settings) {
        res.status(404).json({ error: "Settings not found" });
        return;
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update user settings
  app.patch("/api/settings", async (req, res) => {
    try {
      const updates = updateSettingsSchema.parse(req.body);
      
      const settings = await storage.updateUserSettings(DEFAULT_USER_ID, updates);
      if (!settings) {
        res.status(404).json({ error: "Settings not found" });
        return;
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid settings data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update settings" });
      }
    }
  });

  // Schedule Events API
  app.get("/api/schedule", async (req, res) => {
    try {
      const { date } = req.query;
      const scheduleDate = date ? String(date) : new Date().toISOString().split('T')[0];
      const events = await storage.getScheduleEvents(DEFAULT_USER_ID, scheduleDate);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedule events" });
    }
  });

  app.post("/api/schedule", async (req, res) => {
    try {
      const eventData = insertScheduleEventSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const event = await storage.createScheduleEvent(eventData);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid event data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create event" });
      }
    }
  });

  app.patch("/api/schedule/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = updateScheduleEventSchema.parse(req.body);
      const event = await storage.updateScheduleEvent(id, updates);
      if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid update data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update event" });
      }
    }
  });

  app.delete("/api/schedule/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteScheduleEvent(id);
      if (!deleted) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Habits API
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits(DEFAULT_USER_ID);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const habit = await storage.createHabit(habitData);
      res.json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid habit data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create habit" });
      }
    }
  });

  app.patch("/api/habits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = updateHabitSchema.parse(req.body);
      const habit = await storage.updateHabit(id, updates);
      if (!habit) {
        res.status(404).json({ error: "Habit not found" });
        return;
      }
      res.json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid update data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update habit" });
      }
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteHabit(id);
      if (!deleted) {
        res.status(404).json({ error: "Habit not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete habit" });
    }
  });

  // Quick Links API
  app.get("/api/quick-links", async (req, res) => {
    try {
      const links = await storage.getQuickLinks(DEFAULT_USER_ID);
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quick links" });
    }
  });

  app.post("/api/quick-links", async (req, res) => {
    try {
      const linkData = insertQuickLinkSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      const link = await storage.createQuickLink(linkData);
      res.json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid link data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create link" });
      }
    }
  });

  app.patch("/api/quick-links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = updateQuickLinkSchema.parse(req.body);
      const link = await storage.updateQuickLink(id, updates);
      if (!link) {
        res.status(404).json({ error: "Link not found" });
        return;
      }
      res.json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid update data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update link" });
      }
    }
  });

  app.delete("/api/quick-links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQuickLink(id);
      if (!deleted) {
        res.status(404).json({ error: "Link not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete link" });
    }
  });

  // Daily Summary API
  app.get("/api/daily-summary", async (req, res) => {
    try {
      const { date } = req.query;
      const summaryDate = date ? String(date) : new Date().toISOString().split('T')[0];
      const summary = await storage.getDailySummary(DEFAULT_USER_ID, summaryDate);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily summary" });
    }
  });

  // Daily Book API
  app.get("/api/daily-book", async (req, res) => {
    try {
      const { date } = req.query;
      const bookDate = date ? String(date) : new Date().toISOString().split('T')[0];
      const book = await storage.getDailyBook(DEFAULT_USER_ID, bookDate);
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily book" });
    }
  });

  // Website Usage API
  app.get("/api/website-usage", async (req, res) => {
    try {
      const { date } = req.query;
      const usageDate = date ? String(date) : new Date().toISOString().split('T')[0];
      const usage = await storage.getWebsiteUsage(DEFAULT_USER_ID, usageDate);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch website usage" });
    }
  });

  // AI Insights API
  app.get("/api/ai-insights", async (req, res) => {
    try {
      const { date } = req.query;
      const insightDate = date ? String(date) : new Date().toISOString().split('T')[0];
      const insights = await storage.getAIInsights(DEFAULT_USER_ID, insightDate);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI insights" });
    }
  });

  // Reminders API
  app.get("/api/reminders", async (req, res) => {
    try {
      const reminders = await storage.getReminders(DEFAULT_USER_ID);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const insertData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid reminder data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create reminder" });
      }
    }
  });

  app.put("/api/reminders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const reminder = await storage.updateReminder(id, updates);
      if (!reminder) {
        res.status(404).json({ error: "Reminder not found" });
        return;
      }
      res.json(reminder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reminder" });
    }
  });

  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteReminder(id);
      if (!deleted) {
        res.status(404).json({ error: "Reminder not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete reminder" });
    }
  });

  // Goals API
  app.get("/api/goals", async (req, res) => {
    try {
      const { type } = req.query;
      const goals = await storage.getGoals(DEFAULT_USER_ID, type ? String(type) : undefined);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const insertData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid goal data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create goal" });
      }
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const goal = await storage.updateGoal(id, updates);
      if (!goal) {
        res.status(404).json({ error: "Goal not found" });
        return;
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        res.status(404).json({ error: "Goal not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Learning Queue API
  app.get("/api/learning-queue", async (req, res) => {
    try {
      const items = await storage.getLearningQueue(DEFAULT_USER_ID);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch learning queue" });
    }
  });

  app.post("/api/learning-queue", async (req, res) => {
    try {
      const insertData = insertLearningQueueSchema.parse(req.body);
      const item = await storage.createLearningItem({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid learning item data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create learning item" });
      }
    }
  });

  app.put("/api/learning-queue/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const item = await storage.updateLearningItem(id, updates);
      if (!item) {
        res.status(404).json({ error: "Learning item not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update learning item" });
    }
  });

  app.delete("/api/learning-queue/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteLearningItem(id);
      if (!deleted) {
        res.status(404).json({ error: "Learning item not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete learning item" });
    }
  });

  // Expenses API
  app.get("/api/expenses", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const expenses = await storage.getExpenses(
        DEFAULT_USER_ID,
        startDate ? String(startDate) : undefined,
        endDate ? String(endDate) : undefined
      );
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const insertData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid expense data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create expense" });
      }
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const expense = await storage.updateExpense(id, updates);
      if (!expense) {
        res.status(404).json({ error: "Expense not found" });
        return;
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        res.status(404).json({ error: "Expense not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Time Tracking API
  app.get("/api/time-tracking", async (req, res) => {
    try {
      const { date } = req.query;
      const entries = await storage.getTimeTracking(DEFAULT_USER_ID, date ? String(date) : undefined);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time tracking" });
    }
  });

  app.post("/api/time-tracking", async (req, res) => {
    try {
      const insertData = insertTimeTrackingSchema.parse(req.body);
      const entry = await storage.createTimeEntry({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid time entry data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create time entry" });
      }
    }
  });

  app.put("/api/time-tracking/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const entry = await storage.updateTimeEntry(id, updates);
      if (!entry) {
        res.status(404).json({ error: "Time entry not found" });
        return;
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update time entry" });
    }
  });

  app.delete("/api/time-tracking/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTimeEntry(id);
      if (!deleted) {
        res.status(404).json({ error: "Time entry not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete time entry" });
    }
  });

  // Workout Plans API
  app.get("/api/workout-plans", async (req, res) => {
    try {
      const plans = await storage.getWorkoutPlans(DEFAULT_USER_ID);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workout plans" });
    }
  });

  app.post("/api/workout-plans", async (req, res) => {
    try {
      const insertData = insertWorkoutPlanSchema.parse(req.body);
      const plan = await storage.createWorkoutPlan({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid workout plan data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create workout plan" });
      }
    }
  });

  app.put("/api/workout-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const plan = await storage.updateWorkoutPlan(id, updates);
      if (!plan) {
        res.status(404).json({ error: "Workout plan not found" });
        return;
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workout plan" });
    }
  });

  app.delete("/api/workout-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWorkoutPlan(id);
      if (!deleted) {
        res.status(404).json({ error: "Workout plan not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workout plan" });
    }
  });

  // Workout Sessions API
  app.get("/api/workout-sessions", async (req, res) => {
    try {
      const { date } = req.query;
      const sessions = await storage.getWorkoutSessions(DEFAULT_USER_ID, date ? String(date) : undefined);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workout sessions" });
    }
  });

  app.post("/api/workout-sessions", async (req, res) => {
    try {
      const insertData = insertWorkoutSessionSchema.parse(req.body);
      const session = await storage.createWorkoutSession({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid workout session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create workout session" });
      }
    }
  });

  app.put("/api/workout-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const session = await storage.updateWorkoutSession(id, updates);
      if (!session) {
        res.status(404).json({ error: "Workout session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workout session" });
    }
  });

  app.delete("/api/workout-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWorkoutSession(id);
      if (!deleted) {
        res.status(404).json({ error: "Workout session not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete workout session" });
    }
  });

  // Meal Plans API
  app.get("/api/meal-plans", async (req, res) => {
    try {
      const { date } = req.query;
      const meals = await storage.getMealPlans(DEFAULT_USER_ID, date ? String(date) : undefined);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meal plans" });
    }
  });

  app.post("/api/meal-plans", async (req, res) => {
    try {
      const insertData = insertMealPlanSchema.parse(req.body);
      const meal = await storage.createMealPlan({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid meal plan data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create meal plan" });
      }
    }
  });

  app.put("/api/meal-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const meal = await storage.updateMealPlan(id, updates);
      if (!meal) {
        res.status(404).json({ error: "Meal plan not found" });
        return;
      }
      res.json(meal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update meal plan" });
    }
  });

  app.delete("/api/meal-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMealPlan(id);
      if (!deleted) {
        res.status(404).json({ error: "Meal plan not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meal plan" });
    }
  });

  // Body Care Routines API
  app.get("/api/body-care-routines", async (req, res) => {
    try {
      const routines = await storage.getBodyCareRoutines(DEFAULT_USER_ID);
      res.json(routines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch body care routines" });
    }
  });

  app.post("/api/body-care-routines", async (req, res) => {
    try {
      const insertData = insertBodyCareRoutineSchema.parse(req.body);
      const routine = await storage.createBodyCareRoutine({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(routine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid body care routine data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create body care routine" });
      }
    }
  });

  app.put("/api/body-care-routines/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const routine = await storage.updateBodyCareRoutine(id, updates);
      if (!routine) {
        res.status(404).json({ error: "Body care routine not found" });
        return;
      }
      res.json(routine);
    } catch (error) {
      res.status(500).json({ error: "Failed to update body care routine" });
    }
  });

  app.delete("/api/body-care-routines/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBodyCareRoutine(id);
      if (!deleted) {
        res.status(404).json({ error: "Body care routine not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete body care routine" });
    }
  });

  // Skill Progress API
  app.get("/api/skill-progress", async (req, res) => {
    try {
      const skills = await storage.getSkillProgress(DEFAULT_USER_ID);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch skill progress" });
    }
  });

  app.post("/api/skill-progress", async (req, res) => {
    try {
      const insertData = insertSkillProgressSchema.parse(req.body);
      const skill = await storage.createSkillProgress({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid skill progress data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create skill progress" });
      }
    }
  });

  app.put("/api/skill-progress/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const skill = await storage.updateSkillProgress(id, updates);
      if (!skill) {
        res.status(404).json({ error: "Skill progress not found" });
        return;
      }
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: "Failed to update skill progress" });
    }
  });

  app.delete("/api/skill-progress/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSkillProgress(id);
      if (!deleted) {
        res.status(404).json({ error: "Skill progress not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete skill progress" });
    }
  });

  // Focus Sessions API
  app.get("/api/focus-sessions", async (req, res) => {
    try {
      const { date } = req.query;
      const sessions = await storage.getFocusSessions(DEFAULT_USER_ID, date ? String(date) : undefined);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch focus sessions" });
    }
  });

  app.post("/api/focus-sessions", async (req, res) => {
    try {
      const insertData = insertFocusSessionSchema.parse(req.body);
      const session = await storage.createFocusSession({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid focus session data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create focus session" });
      }
    }
  });

  app.put("/api/focus-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const session = await storage.updateFocusSession(id, updates);
      if (!session) {
        res.status(404).json({ error: "Focus session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update focus session" });
    }
  });

  app.delete("/api/focus-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFocusSession(id);
      if (!deleted) {
        res.status(404).json({ error: "Focus session not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete focus session" });
    }
  });

  // Leaderboard Stats API
  app.get("/api/leaderboard-stats", async (req, res) => {
    try {
      const { period } = req.query;
      const stats = await storage.getLeaderboardStats(DEFAULT_USER_ID, period ? String(period) : undefined);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard stats" });
    }
  });

  app.post("/api/leaderboard-stats", async (req, res) => {
    try {
      const insertData = insertLeaderboardStatsSchema.parse(req.body);
      const stats = await storage.createLeaderboardStats({
        ...insertData,
        userId: DEFAULT_USER_ID,
      });
      res.status(201).json(stats);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid leaderboard stats data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create leaderboard stats" });
      }
    }
  });

  // Widget Config API
  app.get("/api/widget-config", async (req, res) => {
    try {
      const configs = await storage.getWidgetConfig(DEFAULT_USER_ID);
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch widget configuration" });
    }
  });

  app.put("/api/widget-config/:widgetType", async (req, res) => {
    try {
      const { widgetType } = req.params;
      const config = await storage.updateWidgetConfig(DEFAULT_USER_ID, widgetType, req.body);
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to update widget configuration" });
    }
  });

  // Theme Scheduler API
  app.get("/api/theme-schedules", async (req, res) => {
    try {
      const schedules = await storage.getThemeSchedules(DEFAULT_USER_ID);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch theme schedules" });
    }
  });

  app.post("/api/theme-schedules", async (req, res) => {
    try {
      const schedule = await storage.createThemeSchedule({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create theme schedule" });
    }
  });

  app.patch("/api/theme-schedules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const schedule = await storage.updateThemeSchedule(id, req.body);
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update theme schedule" });
    }
  });

  app.delete("/api/theme-schedules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteThemeSchedule(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete theme schedule" });
    }
  });

  // Widget Layouts API
  app.get("/api/widget-layouts", async (req, res) => {
    try {
      const layouts = await storage.getWidgetLayouts(DEFAULT_USER_ID);
      res.json(layouts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch widget layouts" });
    }
  });

  app.post("/api/widget-layouts", async (req, res) => {
    try {
      const layout = await storage.createWidgetLayout({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      res.json(layout);
    } catch (error) {
      res.status(500).json({ error: "Failed to create widget layout" });
    }
  });

  app.patch("/api/widget-layouts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const layout = await storage.updateWidgetLayout(id, req.body);
      res.json(layout);
    } catch (error) {
      res.status(500).json({ error: "Failed to update widget layout" });
    }
  });

  app.delete("/api/widget-layouts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWidgetLayout(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete widget layout" });
    }
  });

  app.get("/api/current-layout", async (req, res) => {
    try {
      const currentLayout = await storage.getCurrentLayout(DEFAULT_USER_ID);
      res.json(currentLayout || 'comprehensive-all');
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current layout" });
    }
  });

  app.post("/api/apply-layout", async (req, res) => {
    try {
      const { layoutId } = req.body;
      await storage.setCurrentLayout(DEFAULT_USER_ID, layoutId);
      res.json({ success: true, layoutId });
    } catch (error) {
      res.status(500).json({ error: "Failed to apply layout" });
    }
  });

  // Daily Photo API  
  app.get("/api/daily-photo", async (req, res) => {
    try {
      const { date } = req.query;
      const photoDate = date ? String(date) : new Date().toISOString().split('T')[0];
      const photo = await storage.getDailyPhoto(DEFAULT_USER_ID, photoDate);
      res.json(photo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily photo" });
    }
  });

  app.post("/api/daily-photo", async (req, res) => {
    try {
      const photo = await storage.createDailyPhoto({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      res.json(photo);
    } catch (error) {
      res.status(500).json({ error: "Failed to create daily photo entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
