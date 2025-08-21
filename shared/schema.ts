import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  order: integer("order").default(0).notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  userName: text("user_name").default("Friend").notNull(),
  dailyFocus: text("daily_focus").default("").notNull(),
  quickNotes: text("quick_notes").default("").notNull(),
  backgroundImage: text("background_image").default("").notNull(),
  panelVisibility: text("panel_visibility").default("{}").notNull(),
  segmentVisibility: text("segment_visibility").default("{}").notNull(),
  showDummyData: boolean("show_dummy_data").default(true).notNull(),
});

export const scheduleEvents = pgTable("schedule_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  time: text("time").notNull(),
  completed: boolean("completed").default(false).notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  icon: text("icon").default("📝").notNull(),
  streak: integer("streak").default(0).notNull(),
  lastCompleted: text("last_completed").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quickLinks = pgTable("quick_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  icon: text("icon").default("🔗").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export const insertScheduleEventSchema = createInsertSchema(scheduleEvents).omit({
  id: true,
  createdAt: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});

export const insertQuickLinkSchema = createInsertSchema(quickLinks).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertScheduleEvent = z.infer<typeof insertScheduleEventSchema>;
export type ScheduleEvent = typeof scheduleEvents.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;
export type InsertQuickLink = z.infer<typeof insertQuickLinkSchema>;
export type QuickLink = typeof quickLinks.$inferSelect;

// Daily Summary tracking
export const dailySummary = pgTable("daily_summary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  tasksCompleted: integer("tasks_completed").default(0).notNull(),
  totalTasks: integer("total_tasks").default(0).notNull(),
  focusTimeMinutes: integer("focus_time_minutes").default(0).notNull(),
  habitsCompleted: integer("habits_completed").default(0).notNull(),
  totalHabits: integer("total_habits").default(0).notNull(),
  productivityScore: integer("productivity_score").default(0).notNull(), // 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Book recommendations
export const dailyBook = pgTable("daily_book", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  title: text("title").notNull(),
  author: text("author").notNull(),
  summary: text("summary").notNull(),
  keyTakeaway: text("key_takeaway").notNull(),
  genre: text("genre").notNull(),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Website usage tracking (simulated Chrome history)
export const websiteUsage = pgTable("website_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(),
  domain: text("domain").notNull(),
  title: text("title").notNull(),
  timeSpentMinutes: integer("time_spent_minutes").default(0).notNull(),
  visitCount: integer("visit_count").default(1).notNull(),
  category: text("category").default("other").notNull(), // work, social, entertainment, education, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Coach insights
export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(),
  insight: text("insight").notNull(),
  category: text("category").notNull(), // productivity, focus, habits, time_management
  severity: text("severity").default("info").notNull(), // info, warning, critical
  actionable: boolean("actionable").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDailySummarySchema = createInsertSchema(dailySummary).omit({
  id: true,
  createdAt: true,
});

export const insertDailyBookSchema = createInsertSchema(dailyBook).omit({
  id: true,
  createdAt: true,
});

export const insertWebsiteUsageSchema = createInsertSchema(websiteUsage).omit({
  id: true,
  createdAt: true,
});

export const insertAIInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

export type InsertDailySummary = z.infer<typeof insertDailySummarySchema>;
export type DailySummary = typeof dailySummary.$inferSelect;
export type InsertDailyBook = z.infer<typeof insertDailyBookSchema>;
export type DailyBook = typeof dailyBook.$inferSelect;
export type InsertWebsiteUsage = z.infer<typeof insertWebsiteUsageSchema>;
export type WebsiteUsage = typeof websiteUsage.$inferSelect;
export type InsertAIInsight = z.infer<typeof insertAIInsightSchema>;
export type AIInsight = typeof aiInsights.$inferSelect;

// Reminders (Water Intake, Stretch Break, etc.)
export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // water_intake, stretch_break, custom
  title: text("title").notNull(),
  interval: integer("interval").notNull(), // minutes between reminders
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggered: timestamp("last_triggered"),
  nextDue: timestamp("next_due"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Goals (Daily, Weekly, Monthly, Yearly)
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  type: text("type").notNull(), // daily, weekly, monthly, yearly
  status: text("status").default("active").notNull(), // active, completed, paused
  progress: integer("progress").default(0).notNull(), // 0-100
  targetValue: integer("target_value").default(1).notNull(),
  currentValue: integer("current_value").default(0).notNull(),
  unit: text("unit").default("").notNull(), // e.g., "books", "hours", "workouts"
  deadline: text("deadline").notNull(), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Podcast & Article Queue
export const learningQueue = pgTable("learning_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // podcast, article, video, book
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description").default("").notNull(),
  category: text("category").default("general").notNull(),
  estimatedTime: integer("estimated_time").default(0).notNull(), // minutes
  status: text("status").default("pending").notNull(), // pending, in_progress, completed
  progress: integer("progress").default(0).notNull(), // 0-100
  priority: integer("priority").default(3).notNull(), // 1-5 (5 highest)
  addedAt: timestamp("added_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Expenses Tracker
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(), // stored in cents
  currency: text("currency").default("USD").notNull(),
  category: text("category").notNull(), // food, transport, entertainment, health, etc.
  description: text("description").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  paymentMethod: text("payment_method").default("cash").notNull(),
  tags: text("tags").default("").notNull(), // comma-separated
  isRecurring: boolean("is_recurring").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Time Completed Tracker
export const timeTracking = pgTable("time_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  activity: text("activity").notNull(),
  category: text("category").notNull(), // work, exercise, learning, leisure, etc.
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration").default(0).notNull(), // minutes
  date: text("date").notNull(), // YYYY-MM-DD format
  description: text("description").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workout Plan
export const workoutPlans = pgTable("workout_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // strength, cardio, yoga, stretching, etc.
  difficulty: text("difficulty").default("beginner").notNull(), // beginner, intermediate, advanced
  duration: integer("duration").notNull(), // minutes
  exercises: text("exercises").notNull(), // JSON string of exercise array
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planId: varchar("plan_id").references(() => workoutPlans.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  duration: integer("duration").notNull(), // actual minutes
  exercises: text("exercises").notNull(), // JSON string of completed exercises
  notes: text("notes").default("").notNull(),
  rating: integer("rating").default(3).notNull(), // 1-5 stars
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Meal Plan
export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  name: text("name").notNull(),
  ingredients: text("ingredients").notNull(), // JSON string
  calories: integer("calories").default(0).notNull(),
  protein: integer("protein").default(0).notNull(), // grams
  carbs: integer("carbs").default(0).notNull(), // grams
  fat: integer("fat").default(0).notNull(), // grams
  isCompleted: boolean("is_completed").default(false).notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Body Care Routine
export const bodyCareRoutines = pgTable("body_care_routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // skincare, hair_care, oral_care, etc.
  timeOfDay: text("time_of_day").notNull(), // morning, evening, weekly, etc.
  steps: text("steps").notNull(), // JSON string of routine steps
  isActive: boolean("is_active").default(true).notNull(),
  lastCompleted: text("last_completed").default("").notNull(), // YYYY-MM-DD format
  streak: integer("streak").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Skill Tracker
export const skillProgress = pgTable("skill_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  skillName: text("skill_name").notNull(),
  category: text("category").notNull(), // language, coding, music, art, etc.
  currentLevel: text("current_level").default("beginner").notNull(),
  targetLevel: text("target_level").default("intermediate").notNull(),
  progressPercentage: integer("progress_percentage").default(0).notNull(),
  timeSpentMinutes: integer("time_spent_minutes").default(0).notNull(),
  milestones: text("milestones").default("[]").notNull(), // JSON string
  resources: text("resources").default("[]").notNull(), // JSON string of learning resources
  lastPracticed: text("last_practiced").default("").notNull(), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Focus Mode & Website Blocking
export const focusSessions = pgTable("focus_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration").default(0).notNull(), // planned duration in minutes
  actualDuration: integer("actual_duration").default(0).notNull(), // actual duration in minutes
  blockedSites: text("blocked_sites").default("[]").notNull(), // JSON string
  sessionType: text("session_type").default("deep_work").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  completionRate: integer("completion_rate").default(0).notNull(), // 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leaderboard comparisons
export const leaderboardStats = pgTable("leaderboard_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  week: text("week").notNull(), // YYYY-WW format
  month: text("month").notNull(), // YYYY-MM format
  tasksCompleted: integer("tasks_completed").default(0).notNull(),
  focusTimeMinutes: integer("focus_time_minutes").default(0).notNull(),
  workoutSessions: integer("workout_sessions").default(0).notNull(),
  learningTimeMinutes: integer("learning_time_minutes").default(0).notNull(),
  habitsCompleted: integer("habits_completed").default(0).notNull(),
  productivityScore: integer("productivity_score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Widget Configuration for customizable dashboard
export const widgetConfig = pgTable("widget_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  widgetType: text("widget_type").notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  position: integer("position").default(0).notNull(),
  size: text("size").default("medium").notNull(), // small, medium, large
  settings: text("settings").default("{}").notNull(), // JSON string for widget-specific settings
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Time Table - Weekly schedule with time slots
export const timeTables = pgTable("time_tables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  color: text("color").default("#3b82f6").notNull(),
  isRecurring: boolean("is_recurring").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project Tracker
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  status: text("status").default("active").notNull(), // active, completed, paused, cancelled
  priority: text("priority").default("medium").notNull(), // low, medium, high, urgent
  startDate: text("start_date").notNull(), // YYYY-MM-DD format
  deadline: text("deadline").notNull(), // YYYY-MM-DD format
  progress: integer("progress").default(0).notNull(), // 0-100
  tags: text("tags").default("").notNull(), // comma-separated
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectMilestones = pgTable("project_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  dueDate: text("due_date").notNull(), // YYYY-MM-DD format
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscriptions Tracker
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  cost: integer("cost").notNull(), // stored in cents
  currency: text("currency").default("USD").notNull(),
  billingCycle: text("billing_cycle").notNull(), // monthly, yearly, weekly
  nextBillingDate: text("next_billing_date").notNull(), // YYYY-MM-DD format
  category: text("category").default("other").notNull(), // entertainment, productivity, health, etc.
  isActive: boolean("is_active").default(true).notNull(),
  url: text("url").default("").notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Challenge Widget
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // fitness, learning, habits, productivity
  duration: integer("duration").default(30).notNull(), // days
  startDate: text("start_date").notNull(), // YYYY-MM-DD format
  endDate: text("end_date").notNull(), // YYYY-MM-DD format
  status: text("status").default("active").notNull(), // active, completed, paused, failed
  currentDay: integer("current_day").default(1).notNull(),
  completedDays: text("completed_days").default("[]").notNull(), // JSON array of completed dates
  rules: text("rules").default("[]").notNull(), // JSON array of challenge rules
  reward: text("reward").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// World Clock & Timezone
export const worldClocks = pgTable("world_clocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  cityName: text("city_name").notNull(),
  timezone: text("timezone").notNull(), // e.g., "America/New_York"
  displayName: text("display_name").notNull(), // Custom display name
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Web Activity Tracker
export const webActivity = pgTable("web_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  domain: text("domain").notNull(),
  visitCount: integer("visit_count").default(1).notNull(),
  lastVisited: timestamp("last_visited").defaultNow().notNull(),
  totalTimeSpent: integer("total_time_spent").default(0).notNull(), // seconds
  favicon: text("favicon").default("").notNull(),
  category: text("category").default("other").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Anniversaries & Important Dates
export const anniversaries = pgTable("anniversaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(), // Person's name or event name
  relationship: text("relationship").default("").notNull(), // friend, family, colleague
  eventType: text("event_type").notNull(), // birthday, anniversary, graduation, etc.
  date: text("date").notNull(), // MM-DD format (year-independent)
  year: integer("year"), // Optional year for calculating age/years
  notes: text("notes").default("").notNull(),
  reminderDays: integer("reminder_days").default(7).notNull(), // Days before to remind
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notification Center
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // email, slack, calendar, reminder, system
  source: text("source").default("system").notNull(), // which service sent the notification
  priority: text("priority").default("normal").notNull(), // low, normal, high, urgent
  isRead: boolean("is_read").default(false).notNull(),
  actionUrl: text("action_url").default("").notNull(),
  metadata: text("metadata").default("{}").notNull(), // JSON for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Social Media Posts (cached)
export const socialMediaPosts = pgTable("social_media_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(), // linkedin, twitter, instagram
  postId: text("post_id").notNull(), // unique ID from the platform
  author: text("author").notNull(),
  authorHandle: text("author_handle").default("").notNull(),
  content: text("content").notNull(),
  link: text("link").default("").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  likes: integer("likes").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  publishedAt: timestamp("published_at").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
});

// News Feed
export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  url: text("url").notNull(),
  source: text("source").notNull(), // news source name
  category: text("category").default("general").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
});

// AI Brainstorm Sessions
export const brainstormSessions = pgTable("brainstorm_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  sessionType: text("session_type").notNull(), // idea_generation, summary, analysis, question
  tags: text("tags").default("").notNull(), // comma-separated
  isFavorited: boolean("is_favorited").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Internet Search History
export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  query: text("query").notNull(),
  searchEngine: text("search_engine").default("google").notNull(),
  resultCount: integer("result_count").default(0).notNull(),
  clickedResults: text("clicked_results").default("[]").notNull(), // JSON array of clicked URLs
  searchedAt: timestamp("searched_at").defaultNow().notNull(),
});

// Insert schemas for new tables
export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
});

export const insertLearningQueueSchema = createInsertSchema(learningQueue).omit({
  id: true,
  addedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export const insertTimeTrackingSchema = createInsertSchema(timeTracking).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
  createdAt: true,
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
});

export const insertBodyCareRoutineSchema = createInsertSchema(bodyCareRoutines).omit({
  id: true,
  createdAt: true,
});

export const insertSkillProgressSchema = createInsertSchema(skillProgress).omit({
  id: true,
  createdAt: true,
});

export const insertTimeTableSchema = createInsertSchema(timeTables).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertWorldClockSchema = createInsertSchema(worldClocks).omit({
  id: true,
  createdAt: true,
});

export const insertWebActivitySchema = createInsertSchema(webActivity).omit({
  id: true,
  createdAt: true,
});

export const insertAnniversarySchema = createInsertSchema(anniversaries).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSocialMediaPostSchema = createInsertSchema(socialMediaPosts).omit({
  id: true,
  fetchedAt: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  fetchedAt: true,
});

export const insertBrainstormSessionSchema = createInsertSchema(brainstormSessions).omit({
  id: true,
  createdAt: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  searchedAt: true,
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({
  id: true,
  createdAt: true,
});

export const insertLeaderboardStatsSchema = createInsertSchema(leaderboardStats).omit({
  id: true,
  createdAt: true,
});

export const insertWidgetConfigSchema = createInsertSchema(widgetConfig).omit({
  id: true,
  updatedAt: true,
});

// Export all the new types
export type InsertTimeTable = z.infer<typeof insertTimeTableSchema>;
export type TimeTable = typeof timeTables.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;
export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertWorldClock = z.infer<typeof insertWorldClockSchema>;
export type WorldClock = typeof worldClocks.$inferSelect;
export type InsertWebActivity = z.infer<typeof insertWebActivitySchema>;
export type WebActivity = typeof webActivity.$inferSelect;
export type InsertAnniversary = z.infer<typeof insertAnniversarySchema>;
export type Anniversary = typeof anniversaries.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertSocialMediaPost = z.infer<typeof insertSocialMediaPostSchema>;
export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertBrainstormSession = z.infer<typeof insertBrainstormSessionSchema>;
export type BrainstormSession = typeof brainstormSessions.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;
export type InsertLeaderboardStats = z.infer<typeof insertLeaderboardStatsSchema>;
export type LeaderboardStats = typeof leaderboardStats.$inferSelect;
export type InsertWidgetConfig = z.infer<typeof insertWidgetConfigSchema>;
export type WidgetConfig = typeof widgetConfig.$inferSelect;

// Type exports for existing schemas  
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertLearningQueue = z.infer<typeof insertLearningQueueSchema>;
export type LearningQueue = typeof learningQueue.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertTimeTracking = z.infer<typeof insertTimeTrackingSchema>;
export type TimeTracking = typeof timeTracking.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertBodyCareRoutine = z.infer<typeof insertBodyCareRoutineSchema>;
export type BodyCareRoutine = typeof bodyCareRoutines.$inferSelect;
export type InsertSkillProgress = z.infer<typeof insertSkillProgressSchema>;
export type SkillProgress = typeof skillProgress.$inferSelect;
