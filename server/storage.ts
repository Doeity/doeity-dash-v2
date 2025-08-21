import { 
  type User, type InsertUser, 
  type Task, type InsertTask, 
  type UserSettings, type InsertUserSettings,
  type ScheduleEvent, type InsertScheduleEvent,
  type Habit, type InsertHabit,
  type QuickLink, type InsertQuickLink,
  type DailySummary, type InsertDailySummary,
  type DailyBook, type InsertDailyBook,
  type WebsiteUsage, type InsertWebsiteUsage,
  type AIInsight, type InsertAIInsight,
  type Reminder, type InsertReminder,
  type Goal, type InsertGoal,
  type LearningQueue, type InsertLearningQueue,
  type Expense, type InsertExpense,
  type TimeTracking, type InsertTimeTracking,
  type WorkoutPlan, type InsertWorkoutPlan,
  type WorkoutSession, type InsertWorkoutSession,
  type MealPlan, type InsertMealPlan,
  type BodyCareRoutine, type InsertBodyCareRoutine,
  type SkillProgress, type InsertSkillProgress,
  type FocusSession, type InsertFocusSession,
  type LeaderboardStats, type InsertLeaderboardStats,
  type WidgetConfig, type InsertWidgetConfig,
  type TimeTable, type InsertTimeTable,
  type Project, type InsertProject,
  type ProjectMilestone, type InsertProjectMilestone,
  type Subscription, type InsertSubscription,
  type Challenge, type InsertChallenge,
  type WorldClock, type InsertWorldClock,
  type WebActivity, type InsertWebActivity,
  type Anniversary, type InsertAnniversary,
  type Notification, type InsertNotification,
  type SocialMediaPost, type InsertSocialMediaPost,
  type NewsArticle, type InsertNewsArticle,
  type BrainstormSession, type InsertBrainstormSession,
  type SearchHistory, type InsertSearchHistory
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  // Settings methods
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined>;
  
  // Schedule methods
  getScheduleEvents(userId: string, date: string): Promise<ScheduleEvent[]>;
  createScheduleEvent(event: InsertScheduleEvent): Promise<ScheduleEvent>;
  updateScheduleEvent(id: string, updates: Partial<ScheduleEvent>): Promise<ScheduleEvent | undefined>;
  deleteScheduleEvent(id: string): Promise<boolean>;
  
  // Habit methods
  getHabits(userId: string): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<boolean>;
  
  // Quick Link methods
  getQuickLinks(userId: string): Promise<QuickLink[]>;
  createQuickLink(link: InsertQuickLink): Promise<QuickLink>;
  updateQuickLink(id: string, updates: Partial<QuickLink>): Promise<QuickLink | undefined>;
  deleteQuickLink(id: string): Promise<boolean>;
  
  // Daily Summary methods
  getDailySummary(userId: string, date: string): Promise<DailySummary | undefined>;
  createDailySummary(summary: InsertDailySummary): Promise<DailySummary>;
  updateDailySummary(userId: string, date: string, updates: Partial<DailySummary>): Promise<DailySummary | undefined>;
  
  // Daily Book methods
  getDailyBook(userId: string, date: string): Promise<DailyBook | undefined>;
  createDailyBook(book: InsertDailyBook): Promise<DailyBook>;
  
  // Website Usage methods
  getWebsiteUsage(userId: string, date: string): Promise<WebsiteUsage[]>;
  createWebsiteUsage(usage: InsertWebsiteUsage): Promise<WebsiteUsage>;
  updateWebsiteUsage(id: string, updates: Partial<WebsiteUsage>): Promise<WebsiteUsage | undefined>;
  
  // AI Insights methods
  getAIInsights(userId: string, date: string): Promise<AIInsight[]>;
  createAIInsight(insight: InsertAIInsight): Promise<AIInsight>;
  
  // Reminder methods
  getReminders(userId: string): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string): Promise<boolean>;
  
  // Goal methods
  getGoals(userId: string, type?: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  
  // Learning Queue methods
  getLearningQueue(userId: string): Promise<LearningQueue[]>;
  createLearningItem(item: InsertLearningQueue): Promise<LearningQueue>;
  updateLearningItem(id: string, updates: Partial<LearningQueue>): Promise<LearningQueue | undefined>;
  deleteLearningItem(id: string): Promise<boolean>;
  
  // Expense methods
  getExpenses(userId: string, startDate?: string, endDate?: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
  
  // Time Tracking methods
  getTimeTracking(userId: string, date?: string): Promise<TimeTracking[]>;
  createTimeEntry(entry: InsertTimeTracking): Promise<TimeTracking>;
  updateTimeEntry(id: string, updates: Partial<TimeTracking>): Promise<TimeTracking | undefined>;
  deleteTimeEntry(id: string): Promise<boolean>;
  
  // Workout Plan methods
  getWorkoutPlans(userId: string): Promise<WorkoutPlan[]>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan | undefined>;
  deleteWorkoutPlan(id: string): Promise<boolean>;
  
  // Workout Session methods
  getWorkoutSessions(userId: string, date?: string): Promise<WorkoutSession[]>;
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  updateWorkoutSession(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession | undefined>;
  deleteWorkoutSession(id: string): Promise<boolean>;
  
  // Meal Plan methods
  getMealPlans(userId: string, date?: string): Promise<MealPlan[]>;
  createMealPlan(meal: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<MealPlan | undefined>;
  deleteMealPlan(id: string): Promise<boolean>;
  
  // Body Care Routine methods
  getBodyCareRoutines(userId: string): Promise<BodyCareRoutine[]>;
  createBodyCareRoutine(routine: InsertBodyCareRoutine): Promise<BodyCareRoutine>;
  updateBodyCareRoutine(id: string, updates: Partial<BodyCareRoutine>): Promise<BodyCareRoutine | undefined>;
  deleteBodyCareRoutine(id: string): Promise<boolean>;
  
  // Skill Progress methods
  getSkillProgress(userId: string): Promise<SkillProgress[]>;
  createSkillProgress(skill: InsertSkillProgress): Promise<SkillProgress>;
  updateSkillProgress(id: string, updates: Partial<SkillProgress>): Promise<SkillProgress | undefined>;
  deleteSkillProgress(id: string): Promise<boolean>;
  
  // Focus Session methods
  getFocusSessions(userId: string, date?: string): Promise<FocusSession[]>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: string, updates: Partial<FocusSession>): Promise<FocusSession | undefined>;
  deleteFocusSession(id: string): Promise<boolean>;
  
  // Leaderboard Stats methods
  getLeaderboardStats(userId: string, period?: string): Promise<LeaderboardStats[]>;
  createLeaderboardStats(stats: InsertLeaderboardStats): Promise<LeaderboardStats>;
  updateLeaderboardStats(id: string, updates: Partial<LeaderboardStats>): Promise<LeaderboardStats | undefined>;
  
  // Widget Config methods
  getWidgetConfig(userId: string): Promise<WidgetConfig[]>;
  updateWidgetConfig(userId: string, widgetType: string, config: Partial<WidgetConfig>): Promise<WidgetConfig>;
  
  // Time Table methods
  getTimeTables(userId: string, date?: string): Promise<TimeTable[]>;
  createTimeTable(timetable: InsertTimeTable): Promise<TimeTable>;
  updateTimeTable(id: string, updates: Partial<TimeTable>): Promise<TimeTable | undefined>;
  deleteTimeTable(id: string): Promise<boolean>;
  
  // Project methods
  getProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Project Milestone methods
  getProjectMilestones(projectId: string): Promise<ProjectMilestone[]>;
  createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone>;
  updateProjectMilestone(id: string, updates: Partial<ProjectMilestone>): Promise<ProjectMilestone | undefined>;
  deleteProjectMilestone(id: string): Promise<boolean>;
  
  // Subscription methods
  getSubscriptions(userId: string): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: string): Promise<boolean>;
  
  // Challenge methods
  getChallenges(userId: string): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge | undefined>;
  deleteChallenge(id: string): Promise<boolean>;
  
  // World Clock methods
  getWorldClocks(userId: string): Promise<WorldClock[]>;
  createWorldClock(clock: InsertWorldClock): Promise<WorldClock>;
  updateWorldClock(id: string, updates: Partial<WorldClock>): Promise<WorldClock | undefined>;
  deleteWorldClock(id: string): Promise<boolean>;
  
  // Web Activity methods
  getWebActivity(userId: string, type?: string): Promise<WebActivity[]>;
  createWebActivity(activity: InsertWebActivity): Promise<WebActivity>;
  updateWebActivity(id: string, updates: Partial<WebActivity>): Promise<WebActivity | undefined>;
  deleteWebActivity(id: string): Promise<boolean>;
  
  // Anniversary methods
  getAnniversaries(userId: string): Promise<Anniversary[]>;
  createAnniversary(anniversary: InsertAnniversary): Promise<Anniversary>;
  updateAnniversary(id: string, updates: Partial<Anniversary>): Promise<Anniversary | undefined>;
  deleteAnniversary(id: string): Promise<boolean>;
  
  // Notification methods
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: string, updates: Partial<Notification>): Promise<Notification | undefined>;
  deleteNotification(id: string): Promise<boolean>;
  
  // Social Media Post methods
  getSocialMediaPosts(userId: string, platform?: string): Promise<SocialMediaPost[]>;
  createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost>;
  updateSocialMediaPost(id: string, updates: Partial<SocialMediaPost>): Promise<SocialMediaPost | undefined>;
  deleteSocialMediaPost(id: string): Promise<boolean>;
  
  // News Article methods
  getNewsArticles(userId: string, category?: string): Promise<NewsArticle[]>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: string): Promise<boolean>;
  
  // Brainstorm Session methods
  getBrainstormSessions(userId: string): Promise<BrainstormSession[]>;
  createBrainstormSession(session: InsertBrainstormSession): Promise<BrainstormSession>;
  updateBrainstormSession(id: string, updates: Partial<BrainstormSession>): Promise<BrainstormSession | undefined>;
  deleteBrainstormSession(id: string): Promise<boolean>;
  
  // Search History methods
  getSearchHistory(userId: string): Promise<SearchHistory[]>;
  createSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;
  updateSearchHistory(id: string, updates: Partial<SearchHistory>): Promise<SearchHistory | undefined>;
  deleteSearchHistory(id: string): Promise<boolean>;

  // Theme Scheduler methods
  getThemeSchedules(userId: string): Promise<any[]>;
  createThemeSchedule(schedule: any): Promise<any>;
  updateThemeSchedule(id: string, updates: any): Promise<any>;
  deleteThemeSchedule(id: string): Promise<boolean>;

  // Widget Layout methods
  getWidgetLayouts(userId: string): Promise<any[]>;
  createWidgetLayout(layout: any): Promise<any>;
  updateWidgetLayout(id: string, updates: any): Promise<any>;
  deleteWidgetLayout(id: string): Promise<boolean>;
  getCurrentLayout(userId: string): Promise<string | undefined>;
  setCurrentLayout(userId: string, layoutId: string): Promise<void>;

  // Daily Photo methods
  getDailyPhoto(userId: string, date: string): Promise<any>;
  createDailyPhoto(photo: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private userSettings: Map<string, UserSettings>;
  private scheduleEvents: Map<string, ScheduleEvent>;
  private habits: Map<string, Habit>;
  private quickLinks: Map<string, QuickLink>;
  private dailySummaries: Map<string, DailySummary>;
  private dailyBooks: Map<string, DailyBook>;
  private websiteUsage: Map<string, WebsiteUsage>;
  private aiInsights: Map<string, AIInsight>;
  private reminders: Map<string, Reminder>;
  private goals: Map<string, Goal>;
  private learningQueue: Map<string, LearningQueue>;
  private expenses: Map<string, Expense>;
  private timeTracking: Map<string, TimeTracking>;
  private workoutPlans: Map<string, WorkoutPlan>;
  private workoutSessions: Map<string, WorkoutSession>;
  private mealPlans: Map<string, MealPlan>;
  private bodyCareRoutines: Map<string, BodyCareRoutine>;
  private skillProgress: Map<string, SkillProgress>;
  private focusSessions: Map<string, FocusSession>;
  private leaderboardStats: Map<string, LeaderboardStats>;
  private widgetConfigs: Map<string, WidgetConfig>;
  private timeTables: Map<string, TimeTable>;
  private projects: Map<string, Project>;
  private projectMilestones: Map<string, ProjectMilestone>;
  private subscriptions: Map<string, Subscription>;
  private challenges: Map<string, Challenge>;
  private worldClocks: Map<string, WorldClock>;
  private webActivity: Map<string, WebActivity>;
  private anniversaries: Map<string, Anniversary>;
  private notifications: Map<string, Notification>;
  private socialMediaPosts: Map<string, SocialMediaPost>;
  private newsArticles: Map<string, NewsArticle>;
  private brainstormSessions: Map<string, BrainstormSession>;
  private searchHistory: Map<string, SearchHistory>;
  private themeSchedules: Map<string, any>;
  private widgetLayouts: Map<string, any>;
  private currentLayouts: Map<string, string>;
  private dailyPhotos: Map<string, any>;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.userSettings = new Map();
    this.scheduleEvents = new Map();
    this.habits = new Map();
    this.quickLinks = new Map();
    this.dailySummaries = new Map();
    this.dailyBooks = new Map();
    this.websiteUsage = new Map();
    this.aiInsights = new Map();
    this.reminders = new Map();
    this.goals = new Map();
    this.learningQueue = new Map();
    this.expenses = new Map();
    this.timeTracking = new Map();
    this.workoutPlans = new Map();
    this.workoutSessions = new Map();
    this.mealPlans = new Map();
    this.bodyCareRoutines = new Map();
    this.skillProgress = new Map();
    this.focusSessions = new Map();
    this.leaderboardStats = new Map();
    this.widgetConfigs = new Map();
    this.timeTables = new Map();
    this.projects = new Map();
    this.projectMilestones = new Map();
    this.subscriptions = new Map();
    this.challenges = new Map();
    this.worldClocks = new Map();
    this.webActivity = new Map();
    this.anniversaries = new Map();
    this.notifications = new Map();
    this.socialMediaPosts = new Map();
    this.newsArticles = new Map();
    this.brainstormSessions = new Map();
    this.searchHistory = new Map();
    this.themeSchedules = new Map();
    this.widgetLayouts = new Map();
    this.currentLayouts = new Map();
    this.dailyPhotos = new Map();
    
    // Create a default user for the demo
    const defaultUser: User = {
      id: "default-user",
      name: "Alex",
      email: "alex@example.com",
      createdAt: new Date(),
    };
    this.users.set("default-user", defaultUser);
    
    // Create default settings
    const defaultSettings: UserSettings = {
      id: "default-settings",
      userId: "default-user",
      userName: "Alex",
      dailyFocus: "",
      quickNotes: "",
      backgroundImage: "",
      panelVisibility: JSON.stringify({
        todo: true,
        schedule: true,
        todaySummary: true,
        reminders: true,
        goals: true,
        timeTracking: true,
        habits: true,
        pomodoro: true,
        quickAccess: true,
        leaderboard: true,
        learningQueue: true,
        dailyBook: true,
        workout: true,
        expenses: true,
        aiCoach: true,
        websiteUsage: true,
        weather: true,
        notes: true,
        timeTable: true,
        bodyCare: true,
        mealPlanner: true,
        focusMode: true,
        projectTracker: true,
        subscriptions: true,
        challenge: true,
        aiBrainstorm: true,
        internetSearch: true,
        worldClock: true,
        webActivity: true,
        anniversaries: true,
        notificationCenter: true,
        socialMediaHub: true,
        newsFeed: true,
        themeScheduler: true,
        widgetLayouts: true,
        dailyPhoto: true,
      }),
      segmentVisibility: JSON.stringify({
        timeDisplay: true,
        dateDisplay: true,
        personalGreeting: true,
        searchWidget: true,
        dailyQuote: true,
        mainFocus: true,
      }),
      showDummyData: true,
    };
    this.userSettings.set("default-user", defaultSettings);
    
    // Create sample data for new features
    const sampleSchedule: ScheduleEvent = {
      id: "sample-event-1",
      userId: "default-user",
      title: "Team meeting",
      time: "10:00",
      completed: false,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };
    this.scheduleEvents.set("sample-event-1", sampleSchedule);
    
    const sampleHabit: Habit = {
      id: "sample-habit-1",
      userId: "default-user",
      name: "Morning meditation",
      icon: "🧘",
      streak: 3,
      lastCompleted: "",
      createdAt: new Date(),
    };
    this.habits.set("sample-habit-1", sampleHabit);
    
    const sampleLink: QuickLink = {
      id: "sample-link-1",
      userId: "default-user",
      name: "Gmail",
      url: "https://gmail.com",
      icon: "📧",
      order: 0,
      createdAt: new Date(),
    };
    this.quickLinks.set("sample-link-1", sampleLink);
    
    // Create sample data for new features
    const today = new Date().toISOString().split('T')[0];
    
    const sampleSummary: DailySummary = {
      id: "sample-summary-1",
      userId: "default-user",
      date: today,
      tasksCompleted: 2,
      totalTasks: 5,
      focusTimeMinutes: 75,
      habitsCompleted: 3,
      totalHabits: 4,
      productivityScore: 78,
      createdAt: new Date(),
    };
    this.dailySummaries.set(`default-user-${today}`, sampleSummary);
    
    const sampleBook: DailyBook = {
      id: "sample-book-1",
      userId: "default-user",
      date: today,
      title: "Atomic Habits",
      author: "James Clear",
      summary: "A practical guide to building good habits and breaking bad ones through small, consistent changes.",
      keyTakeaway: "Focus on systems rather than goals. Small improvements compound over time.",
      genre: "Self-Help",
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=300&fit=crop",
      createdAt: new Date(),
    };
    this.dailyBooks.set(`default-user-${today}`, sampleBook);
    
    // Sample website usage
    const sampleUsage: WebsiteUsage[] = [
      {
        id: "usage-1",
        userId: "default-user",
        date: today,
        domain: "youtube.com",
        title: "YouTube",
        timeSpentMinutes: 45,
        visitCount: 8,
        category: "entertainment",
        createdAt: new Date(),
      },
      {
        id: "usage-2",
        userId: "default-user",
        date: today,
        domain: "github.com",
        title: "GitHub",
        timeSpentMinutes: 120,
        visitCount: 15,
        category: "work",
        createdAt: new Date(),
      },
      {
        id: "usage-3",
        userId: "default-user",
        date: today,
        domain: "twitter.com",
        title: "Twitter",
        timeSpentMinutes: 25,
        visitCount: 12,
        category: "social",
        createdAt: new Date(),
      },
    ];
    sampleUsage.forEach(usage => this.websiteUsage.set(usage.id, usage));
    
    // Sample AI insights
    const sampleInsights: AIInsight[] = [
      {
        id: "insight-1",
        userId: "default-user",
        date: today,
        insight: "You spent 45 minutes on YouTube today, which is 30% of your focus time. Consider using a website blocker during work hours.",
        category: "focus",
        severity: "warning",
        actionable: true,
        createdAt: new Date(),
      },
      {
        id: "insight-2",
        userId: "default-user",
        date: today,
        insight: "Great job maintaining a 3-day meditation streak! Consistency is key to building lasting habits.",
        category: "habits",
        severity: "info",
        actionable: false,
        createdAt: new Date(),
      },
      {
        id: "insight-3",
        userId: "default-user",
        date: today,
        insight: "Your productivity score is 78% today. You're on track to meet your weekly goals!",
        category: "productivity",
        severity: "info",
        actionable: false,
        createdAt: new Date(),
      },
    ];
    sampleInsights.forEach(insight => this.aiInsights.set(insight.id, insight));
    
    // Initialize sample data for new features
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    const today = new Date().toISOString().split('T')[0];
    const userId = "default-user";
    
    // Sample reminders
    const sampleReminders: Reminder[] = [
      {
        id: "reminder-water-1",
        userId,
        type: "water_intake",
        title: "Drink water 💧",
        interval: 60, // every hour
        isActive: true,
        lastTriggered: null,
        nextDue: new Date(Date.now() + 60 * 60 * 1000),
        createdAt: new Date(),
      },
      {
        id: "reminder-stretch-1",
        userId,
        type: "stretch_break",
        title: "Take a stretch break 🧘",
        interval: 90, // every 90 minutes
        isActive: true,
        lastTriggered: null,
        nextDue: new Date(Date.now() + 90 * 60 * 1000),
        createdAt: new Date(),
      }
    ];
    sampleReminders.forEach(reminder => this.reminders.set(reminder.id, reminder));
    
    // Sample goals
    const sampleGoals: Goal[] = [
      {
        id: "goal-daily-1",
        userId,
        title: "Complete 5 tasks",
        description: "Stay productive by completing at least 5 tasks today",
        type: "daily",
        status: "active",
        progress: 40,
        targetValue: 5,
        currentValue: 2,
        unit: "tasks",
        deadline: today,
        createdAt: new Date(),
      },
      {
        id: "goal-weekly-1",
        userId,
        title: "Exercise 4 times",
        description: "Maintain fitness by working out 4 times this week",
        type: "weekly",
        status: "active",
        progress: 50,
        targetValue: 4,
        currentValue: 2,
        unit: "workouts",
        deadline: "2025-08-24",
        createdAt: new Date(),
      }
    ];
    sampleGoals.forEach(goal => this.goals.set(goal.id, goal));
    
    // Sample learning queue
    const sampleLearning: LearningQueue[] = [
      {
        id: "learning-1",
        userId,
        type: "podcast",
        title: "The Tim Ferriss Show - How to Build Habits",
        url: "https://tim.blog/podcast",
        description: "Learn about habit formation from productivity experts",
        category: "productivity",
        estimatedTime: 60,
        status: "pending",
        progress: 0,
        priority: 4,
        addedAt: new Date(),
        completedAt: null,
      },
      {
        id: "learning-2",
        userId,
        type: "article",
        title: "Deep Work Principles for the Digital Age",
        url: "https://example.com/deep-work",
        description: "Cal Newport's strategies for focused work",
        category: "focus",
        estimatedTime: 15,
        status: "in_progress",
        progress: 60,
        priority: 5,
        addedAt: new Date(),
        completedAt: null,
      }
    ];
    sampleLearning.forEach(item => this.learningQueue.set(item.id, item));
    
    // Sample expenses
    const sampleExpenses: Expense[] = [
      {
        id: "expense-1",
        userId,
        amount: 1250, // $12.50 in cents
        currency: "USD",
        category: "food",
        description: "Lunch at local cafe",
        date: today,
        paymentMethod: "card",
        tags: "restaurant,lunch",
        isRecurring: false,
        createdAt: new Date(),
      },
      {
        id: "expense-2",
        userId,
        amount: 4999, // $49.99 in cents
        currency: "USD",
        category: "health",
        description: "Monthly gym membership",
        date: today,
        paymentMethod: "card",
        tags: "fitness,recurring",
        isRecurring: true,
        createdAt: new Date(),
      }
    ];
    sampleExpenses.forEach(expense => this.expenses.set(expense.id, expense));
    
    // Sample workout plans
    const sampleWorkoutPlans: WorkoutPlan[] = [
      {
        id: "workout-plan-1",
        userId,
        name: "Morning Strength Training",
        type: "strength",
        difficulty: "intermediate",
        duration: 45,
        exercises: JSON.stringify([
          { name: "Push-ups", sets: 3, reps: 15 },
          { name: "Squats", sets: 3, reps: 20 },
          { name: "Plank", sets: 3, duration: "60s" }
        ]),
        isActive: true,
        createdAt: new Date(),
      }
    ];
    sampleWorkoutPlans.forEach(plan => this.workoutPlans.set(plan.id, plan));
    
    // Sample meal plans
    const sampleMealPlans: MealPlan[] = [
      {
        id: "meal-1",
        userId,
        date: today,
        mealType: "breakfast",
        name: "Overnight Oats with Berries",
        ingredients: JSON.stringify(["oats", "milk", "berries", "honey", "chia seeds"]),
        calories: 350,
        protein: 12,
        carbs: 45,
        fat: 8,
        isCompleted: true,
        notes: "Delicious and nutritious start to the day",
        createdAt: new Date(),
      },
      {
        id: "meal-2",
        userId,
        date: today,
        mealType: "lunch",
        name: "Quinoa Buddha Bowl",
        ingredients: JSON.stringify(["quinoa", "chickpeas", "avocado", "vegetables", "tahini"]),
        calories: 520,
        protein: 18,
        carbs: 60,
        fat: 22,
        isCompleted: false,
        notes: "Planned for lunch",
        createdAt: new Date(),
      }
    ];
    sampleMealPlans.forEach(meal => this.mealPlans.set(meal.id, meal));
    
    // Sample body care routines
    const sampleBodyCare: BodyCareRoutine[] = [
      {
        id: "routine-1",
        userId,
        name: "Morning Skincare",
        type: "skincare",
        timeOfDay: "morning",
        steps: JSON.stringify([
          "Gentle cleanser",
          "Vitamin C serum",
          "Moisturizer",
          "SPF 30+ sunscreen"
        ]),
        isActive: true,
        lastCompleted: today,
        streak: 5,
        createdAt: new Date(),
      }
    ];
    sampleBodyCare.forEach(routine => this.bodyCareRoutines.set(routine.id, routine));
    
    // Sample skill progress
    const sampleSkills: SkillProgress[] = [
      {
        id: "skill-1",
        userId,
        skillName: "Spanish Language",
        category: "language",
        currentLevel: "beginner",
        targetLevel: "intermediate",
        progressPercentage: 35,
        timeSpentMinutes: 450,
        milestones: JSON.stringify([
          "Completed basic vocabulary (✓)",
          "Started present tense verbs",
          "Target: Hold 5-minute conversation"
        ]),
        resources: JSON.stringify([
          { name: "Duolingo", url: "https://duolingo.com" },
          { name: "SpanishPod101", url: "https://spanishpod101.com" }
        ]),
        lastPracticed: today,
        createdAt: new Date(),
      }
    ];
    sampleSkills.forEach(skill => this.skillProgress.set(skill.id, skill));
    
    // Default widget configuration
    const defaultWidgets = [
      "personal-greeting", "time-display", "daily-quote", "main-focus",
      "todo-widget", "schedule-widget", "habits-widget", "pomodoro-widget",
      "quick-access-widget", "notes-widget", "weather-widget",
      "reminders-widget", "goals-widget", "learning-queue-widget",
      "expenses-widget", "time-tracking-widget", "workout-widget",
      "meal-plan-widget", "body-care-widget", "skill-tracker-widget",
      "focus-mode-widget", "leaderboard-widget"
    ];
    
    defaultWidgets.forEach((widgetType, index) => {
      const config: WidgetConfig = {
        id: `widget-${widgetType}-${userId}`,
        userId,
        widgetType,
        isVisible: index < 12, // Show first 12 widgets by default
        position: index,
        size: "medium",
        settings: "{}",
        updatedAt: new Date(),
      };
      this.widgetConfigs.set(`${userId}-${widgetType}`, config);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
      order: insertTask.order || 0,
      completed: insertTask.completed || false,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return this.userSettings.get(userId);
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = randomUUID();
    const settings: UserSettings = {
      ...insertSettings,
      id,
      userName: insertSettings.userName || "Friend",
      dailyFocus: insertSettings.dailyFocus || "",
      quickNotes: insertSettings.quickNotes || "",
      backgroundImage: insertSettings.backgroundImage || "",
      panelVisibility: insertSettings.panelVisibility || "{}",
    };
    this.userSettings.set(insertSettings.userId, settings);
    return settings;
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const settings = this.userSettings.get(userId);
    if (!settings) return undefined;
    
    const updatedSettings = { ...settings, ...updates };
    this.userSettings.set(userId, updatedSettings);
    return updatedSettings;
  }

  // Schedule Event methods
  async getScheduleEvents(userId: string, date: string): Promise<ScheduleEvent[]> {
    return Array.from(this.scheduleEvents.values())
      .filter(event => event.userId === userId && event.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  async createScheduleEvent(insertEvent: InsertScheduleEvent): Promise<ScheduleEvent> {
    const id = randomUUID();
    const event: ScheduleEvent = {
      ...insertEvent,
      id,
      createdAt: new Date(),
      completed: insertEvent.completed || false,
    };
    this.scheduleEvents.set(id, event);
    return event;
  }

  async updateScheduleEvent(id: string, updates: Partial<ScheduleEvent>): Promise<ScheduleEvent | undefined> {
    const event = this.scheduleEvents.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.scheduleEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteScheduleEvent(id: string): Promise<boolean> {
    return this.scheduleEvents.delete(id);
  }

  // Habit methods
  async getHabits(userId: string): Promise<Habit[]> {
    return Array.from(this.habits.values())
      .filter(habit => habit.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = {
      ...insertHabit,
      id,
      createdAt: new Date(),
      streak: insertHabit.streak || 0,
      lastCompleted: insertHabit.lastCompleted || "",
      icon: insertHabit.icon || "📝",
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const updatedHabit = { ...habit, ...updates };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: string): Promise<boolean> {
    return this.habits.delete(id);
  }

  // Quick Link methods
  async getQuickLinks(userId: string): Promise<QuickLink[]> {
    return Array.from(this.quickLinks.values())
      .filter(link => link.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  async createQuickLink(insertLink: InsertQuickLink): Promise<QuickLink> {
    const id = randomUUID();
    const link: QuickLink = {
      ...insertLink,
      id,
      createdAt: new Date(),
      order: insertLink.order || 0,
      icon: insertLink.icon || "🔗",
    };
    this.quickLinks.set(id, link);
    return link;
  }

  async updateQuickLink(id: string, updates: Partial<QuickLink>): Promise<QuickLink | undefined> {
    const link = this.quickLinks.get(id);
    if (!link) return undefined;
    
    const updatedLink = { ...link, ...updates };
    this.quickLinks.set(id, updatedLink);
    return updatedLink;
  }

  async deleteQuickLink(id: string): Promise<boolean> {
    return this.quickLinks.delete(id);
  }

  // Daily Summary methods
  async getDailySummary(userId: string, date: string): Promise<DailySummary | undefined> {
    return this.dailySummaries.get(`${userId}-${date}`);
  }

  async createDailySummary(insertSummary: InsertDailySummary): Promise<DailySummary> {
    const id = randomUUID();
    const summary: DailySummary = {
      ...insertSummary,
      id,
      createdAt: new Date(),
      tasksCompleted: insertSummary.tasksCompleted || 0,
      totalTasks: insertSummary.totalTasks || 0,
      focusTimeMinutes: insertSummary.focusTimeMinutes || 0,
      habitsCompleted: insertSummary.habitsCompleted || 0,
      totalHabits: insertSummary.totalHabits || 0,
      productivityScore: insertSummary.productivityScore || 0,
    };
    this.dailySummaries.set(`${insertSummary.userId}-${insertSummary.date}`, summary);
    return summary;
  }

  async updateDailySummary(userId: string, date: string, updates: Partial<DailySummary>): Promise<DailySummary | undefined> {
    const summary = this.dailySummaries.get(`${userId}-${date}`);
    if (!summary) return undefined;
    
    const updatedSummary = { ...summary, ...updates };
    this.dailySummaries.set(`${userId}-${date}`, updatedSummary);
    return updatedSummary;
  }

  // Daily Book methods
  async getDailyBook(userId: string, date: string): Promise<DailyBook | undefined> {
    return this.dailyBooks.get(`${userId}-${date}`);
  }

  async createDailyBook(insertBook: InsertDailyBook): Promise<DailyBook> {
    const id = randomUUID();
    const book: DailyBook = {
      ...insertBook,
      id,
      createdAt: new Date(),
      coverUrl: insertBook.coverUrl || null,
    };
    this.dailyBooks.set(`${insertBook.userId}-${insertBook.date}`, book);
    return book;
  }

  // Website Usage methods
  async getWebsiteUsage(userId: string, date: string): Promise<WebsiteUsage[]> {
    return Array.from(this.websiteUsage.values())
      .filter(usage => usage.userId === userId && usage.date === date)
      .sort((a, b) => b.timeSpentMinutes - a.timeSpentMinutes);
  }

  async createWebsiteUsage(insertUsage: InsertWebsiteUsage): Promise<WebsiteUsage> {
    const id = randomUUID();
    const usage: WebsiteUsage = {
      ...insertUsage,
      id,
      createdAt: new Date(),
      timeSpentMinutes: insertUsage.timeSpentMinutes || 0,
      visitCount: insertUsage.visitCount || 1,
      category: insertUsage.category || "other",
    };
    this.websiteUsage.set(id, usage);
    return usage;
  }

  async updateWebsiteUsage(id: string, updates: Partial<WebsiteUsage>): Promise<WebsiteUsage | undefined> {
    const usage = this.websiteUsage.get(id);
    if (!usage) return undefined;
    
    const updatedUsage = { ...usage, ...updates };
    this.websiteUsage.set(id, updatedUsage);
    return updatedUsage;
  }

  // AI Insights methods
  async getAIInsights(userId: string, date: string): Promise<AIInsight[]> {
    return Array.from(this.aiInsights.values())
      .filter(insight => insight.userId === userId && insight.date === date)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAIInsight(insertInsight: InsertAIInsight): Promise<AIInsight> {
    const id = randomUUID();
    const insight: AIInsight = {
      ...insertInsight,
      id,
      createdAt: new Date(),
      severity: insertInsight.severity || "info",
      actionable: insertInsight.actionable !== undefined ? insertInsight.actionable : true,
    };
    this.aiInsights.set(id, insight);
    return insight;
  }

  // Reminder methods
  async getReminders(userId: string): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = randomUUID();
    const reminder: Reminder = {
      ...insertReminder,
      id,
      createdAt: new Date(),
      isActive: insertReminder.isActive !== undefined ? insertReminder.isActive : true,
      lastTriggered: insertReminder.lastTriggered || null,
      nextDue: insertReminder.nextDue || null,
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, ...updates };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async deleteReminder(id: string): Promise<boolean> {
    return this.reminders.delete(id);
  }

  // Goal methods
  async getGoals(userId: string, type?: string): Promise<Goal[]> {
    return Array.from(this.goals.values())
      .filter(goal => goal.userId === userId && (type ? goal.type === type : true))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      ...insertGoal,
      id,
      createdAt: new Date(),
      status: insertGoal.status || "active",
      progress: insertGoal.progress || 0,
      targetValue: insertGoal.targetValue || 1,
      currentValue: insertGoal.currentValue || 0,
      unit: insertGoal.unit || "",
      description: insertGoal.description || "",
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Learning Queue methods
  async getLearningQueue(userId: string): Promise<LearningQueue[]> {
    return Array.from(this.learningQueue.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.priority - a.priority || b.addedAt.getTime() - a.addedAt.getTime());
  }

  async createLearningItem(insertItem: InsertLearningQueue): Promise<LearningQueue> {
    const id = randomUUID();
    const item: LearningQueue = {
      ...insertItem,
      id,
      addedAt: new Date(),
      description: insertItem.description || "",
      category: insertItem.category || "general",
      estimatedTime: insertItem.estimatedTime || 0,
      status: insertItem.status || "pending",
      progress: insertItem.progress || 0,
      priority: insertItem.priority || 3,
      completedAt: insertItem.completedAt || null,
    };
    this.learningQueue.set(id, item);
    return item;
  }

  async updateLearningItem(id: string, updates: Partial<LearningQueue>): Promise<LearningQueue | undefined> {
    const item = this.learningQueue.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.learningQueue.set(id, updatedItem);
    return updatedItem;
  }

  async deleteLearningItem(id: string): Promise<boolean> {
    return this.learningQueue.delete(id);
  }

  // Expense methods
  async getExpenses(userId: string, startDate?: string, endDate?: string): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter(expense => {
        if (expense.userId !== userId) return false;
        if (startDate && expense.date < startDate) return false;
        if (endDate && expense.date > endDate) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: new Date(),
      currency: insertExpense.currency || "USD",
      paymentMethod: insertExpense.paymentMethod || "cash",
      tags: insertExpense.tags || "",
      isRecurring: insertExpense.isRecurring || false,
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { ...expense, ...updates };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Time Tracking methods
  async getTimeTracking(userId: string, date?: string): Promise<TimeTracking[]> {
    return Array.from(this.timeTracking.values())
      .filter(entry => entry.userId === userId && (date ? entry.date === date : true))
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async createTimeEntry(insertEntry: InsertTimeTracking): Promise<TimeTracking> {
    const id = randomUUID();
    const entry: TimeTracking = {
      ...insertEntry,
      id,
      createdAt: new Date(),
      endTime: insertEntry.endTime || null,
      duration: insertEntry.duration || 0,
      description: insertEntry.description || "",
    };
    this.timeTracking.set(id, entry);
    return entry;
  }

  async updateTimeEntry(id: string, updates: Partial<TimeTracking>): Promise<TimeTracking | undefined> {
    const entry = this.timeTracking.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...updates };
    this.timeTracking.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    return this.timeTracking.delete(id);
  }

  // Workout Plan methods
  async getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return Array.from(this.workoutPlans.values())
      .filter(plan => plan.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createWorkoutPlan(insertPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const id = randomUUID();
    const plan: WorkoutPlan = {
      ...insertPlan,
      id,
      createdAt: new Date(),
      difficulty: insertPlan.difficulty || "beginner",
      isActive: insertPlan.isActive !== undefined ? insertPlan.isActive : true,
    };
    this.workoutPlans.set(id, plan);
    return plan;
  }

  async updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan | undefined> {
    const plan = this.workoutPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updates };
    this.workoutPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteWorkoutPlan(id: string): Promise<boolean> {
    return this.workoutPlans.delete(id);
  }

  // Workout Session methods
  async getWorkoutSessions(userId: string, date?: string): Promise<WorkoutSession[]> {
    return Array.from(this.workoutSessions.values())
      .filter(session => session.userId === userId && (date ? session.date === date : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const id = randomUUID();
    const session: WorkoutSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      planId: insertSession.planId || null,
      notes: insertSession.notes || "",
      rating: insertSession.rating || 3,
    };
    this.workoutSessions.set(id, session);
    return session;
  }

  async updateWorkoutSession(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession | undefined> {
    const session = this.workoutSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.workoutSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteWorkoutSession(id: string): Promise<boolean> {
    return this.workoutSessions.delete(id);
  }

  // Meal Plan methods
  async getMealPlans(userId: string, date?: string): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values())
      .filter(meal => meal.userId === userId && (date ? meal.date === date : true))
      .sort((a, b) => {
        const mealOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
        return mealOrder[a.mealType as keyof typeof mealOrder] - mealOrder[b.mealType as keyof typeof mealOrder];
      });
  }

  async createMealPlan(insertMeal: InsertMealPlan): Promise<MealPlan> {
    const id = randomUUID();
    const meal: MealPlan = {
      ...insertMeal,
      id,
      createdAt: new Date(),
      calories: insertMeal.calories || 0,
      protein: insertMeal.protein || 0,
      carbs: insertMeal.carbs || 0,
      fat: insertMeal.fat || 0,
      isCompleted: insertMeal.isCompleted || false,
      notes: insertMeal.notes || "",
    };
    this.mealPlans.set(id, meal);
    return meal;
  }

  async updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<MealPlan | undefined> {
    const meal = this.mealPlans.get(id);
    if (!meal) return undefined;
    
    const updatedMeal = { ...meal, ...updates };
    this.mealPlans.set(id, updatedMeal);
    return updatedMeal;
  }

  async deleteMealPlan(id: string): Promise<boolean> {
    return this.mealPlans.delete(id);
  }

  // Body Care Routine methods
  async getBodyCareRoutines(userId: string): Promise<BodyCareRoutine[]> {
    return Array.from(this.bodyCareRoutines.values())
      .filter(routine => routine.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createBodyCareRoutine(insertRoutine: InsertBodyCareRoutine): Promise<BodyCareRoutine> {
    const id = randomUUID();
    const routine: BodyCareRoutine = {
      ...insertRoutine,
      id,
      createdAt: new Date(),
      isActive: insertRoutine.isActive !== undefined ? insertRoutine.isActive : true,
      lastCompleted: insertRoutine.lastCompleted || "",
      streak: insertRoutine.streak || 0,
    };
    this.bodyCareRoutines.set(id, routine);
    return routine;
  }

  async updateBodyCareRoutine(id: string, updates: Partial<BodyCareRoutine>): Promise<BodyCareRoutine | undefined> {
    const routine = this.bodyCareRoutines.get(id);
    if (!routine) return undefined;
    
    const updatedRoutine = { ...routine, ...updates };
    this.bodyCareRoutines.set(id, updatedRoutine);
    return updatedRoutine;
  }

  async deleteBodyCareRoutine(id: string): Promise<boolean> {
    return this.bodyCareRoutines.delete(id);
  }

  // Skill Progress methods
  async getSkillProgress(userId: string): Promise<SkillProgress[]> {
    return Array.from(this.skillProgress.values())
      .filter(skill => skill.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createSkillProgress(insertSkill: InsertSkillProgress): Promise<SkillProgress> {
    const id = randomUUID();
    const skill: SkillProgress = {
      ...insertSkill,
      id,
      createdAt: new Date(),
      currentLevel: insertSkill.currentLevel || "beginner",
      targetLevel: insertSkill.targetLevel || "intermediate",
      progressPercentage: insertSkill.progressPercentage || 0,
      timeSpentMinutes: insertSkill.timeSpentMinutes || 0,
      milestones: insertSkill.milestones || "[]",
      resources: insertSkill.resources || "[]",
      lastPracticed: insertSkill.lastPracticed || "",
    };
    this.skillProgress.set(id, skill);
    return skill;
  }

  async updateSkillProgress(id: string, updates: Partial<SkillProgress>): Promise<SkillProgress | undefined> {
    const skill = this.skillProgress.get(id);
    if (!skill) return undefined;
    
    const updatedSkill = { ...skill, ...updates };
    this.skillProgress.set(id, updatedSkill);
    return updatedSkill;
  }

  async deleteSkillProgress(id: string): Promise<boolean> {
    return this.skillProgress.delete(id);
  }

  // Focus Session methods
  async getFocusSessions(userId: string, date?: string): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values())
      .filter(session => {
        if (session.userId !== userId) return false;
        if (date) {
          const sessionDate = session.startTime.toISOString().split('T')[0];
          if (sessionDate !== date) return false;
        }
        return true;
      })
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async createFocusSession(insertSession: InsertFocusSession): Promise<FocusSession> {
    const id = randomUUID();
    const session: FocusSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      endTime: insertSession.endTime || null,
      duration: insertSession.duration || 0,
      actualDuration: insertSession.actualDuration || 0,
      blockedSites: insertSession.blockedSites || "[]",
      sessionType: insertSession.sessionType || "deep_work",
      isActive: insertSession.isActive || false,
      completionRate: insertSession.completionRate || 0,
    };
    this.focusSessions.set(id, session);
    return session;
  }

  async updateFocusSession(id: string, updates: Partial<FocusSession>): Promise<FocusSession | undefined> {
    const session = this.focusSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.focusSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteFocusSession(id: string): Promise<boolean> {
    return this.focusSessions.delete(id);
  }

  // Leaderboard Stats methods
  async getLeaderboardStats(userId: string, period?: string): Promise<LeaderboardStats[]> {
    return Array.from(this.leaderboardStats.values())
      .filter(stats => {
        if (stats.userId !== userId) return false;
        if (period) {
          if (period.includes('W')) return stats.week === period;
          if (period.includes('-')) return stats.month === period;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createLeaderboardStats(insertStats: InsertLeaderboardStats): Promise<LeaderboardStats> {
    const id = randomUUID();
    const stats: LeaderboardStats = {
      ...insertStats,
      id,
      createdAt: new Date(),
      tasksCompleted: insertStats.tasksCompleted || 0,
      focusTimeMinutes: insertStats.focusTimeMinutes || 0,
      workoutSessions: insertStats.workoutSessions || 0,
      learningTimeMinutes: insertStats.learningTimeMinutes || 0,
      habitsCompleted: insertStats.habitsCompleted || 0,
      productivityScore: insertStats.productivityScore || 0,
    };
    this.leaderboardStats.set(id, stats);
    return stats;
  }

  async updateLeaderboardStats(id: string, updates: Partial<LeaderboardStats>): Promise<LeaderboardStats | undefined> {
    const stats = this.leaderboardStats.get(id);
    if (!stats) return undefined;
    
    const updatedStats = { ...stats, ...updates };
    this.leaderboardStats.set(id, updatedStats);
    return updatedStats;
  }

  // Widget Config methods
  async getWidgetConfig(userId: string): Promise<WidgetConfig[]> {
    return Array.from(this.widgetConfigs.values())
      .filter(config => config.userId === userId)
      .sort((a, b) => a.position - b.position);
  }

  async updateWidgetConfig(userId: string, widgetType: string, config: Partial<WidgetConfig>): Promise<WidgetConfig> {
    const key = `${userId}-${widgetType}`;
    const existingConfig = this.widgetConfigs.get(key);
    
    if (existingConfig) {
      const updatedConfig = { ...existingConfig, ...config, updatedAt: new Date() };
      this.widgetConfigs.set(key, updatedConfig);
      return updatedConfig;
    } else {
      const newConfig: WidgetConfig = {
        id: randomUUID(),
        userId,
        widgetType,
        isVisible: true,
        position: 0,
        size: "medium",
        settings: "{}",
        updatedAt: new Date(),
        ...config,
      };
      this.widgetConfigs.set(key, newConfig);
      return newConfig;
    }
  }

  // Time Table methods
  async getTimeTables(userId: string, date?: string): Promise<TimeTable[]> {
    return Array.from(this.timeTables.values())
      .filter(table => table.userId === userId && (date ? table.date === date : true))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  async createTimeTable(insertTable: InsertTimeTable): Promise<TimeTable> {
    const id = randomUUID();
    const table: TimeTable = {
      ...insertTable,
      id,
      createdAt: new Date(),
      isCompleted: insertTable.isCompleted || false,
      notes: insertTable.notes || "",
    };
    this.timeTables.set(id, table);
    return table;
  }

  async updateTimeTable(id: string, updates: Partial<TimeTable>): Promise<TimeTable | undefined> {
    const table = this.timeTables.get(id);
    if (!table) return undefined;
    const updatedTable = { ...table, ...updates };
    this.timeTables.set(id, updatedTable);
    return updatedTable;
  }

  async deleteTimeTable(id: string): Promise<boolean> {
    return this.timeTables.delete(id);
  }

  // Project methods
  async getProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
      description: insertProject.description || "",
      status: insertProject.status || "active",
      priority: insertProject.priority || "medium",
      progress: insertProject.progress || 0,
      tags: insertProject.tags || "",
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Project Milestone methods
  async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    return Array.from(this.projectMilestones.values())
      .filter(milestone => milestone.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async createProjectMilestone(insertMilestone: InsertProjectMilestone): Promise<ProjectMilestone> {
    const id = randomUUID();
    const milestone: ProjectMilestone = {
      ...insertMilestone,
      id,
      createdAt: new Date(),
      description: insertMilestone.description || "",
      isCompleted: insertMilestone.isCompleted || false,
      completedAt: insertMilestone.completedAt || null,
      order: insertMilestone.order || 0,
    };
    this.projectMilestones.set(id, milestone);
    return milestone;
  }

  async updateProjectMilestone(id: string, updates: Partial<ProjectMilestone>): Promise<ProjectMilestone | undefined> {
    const milestone = this.projectMilestones.get(id);
    if (!milestone) return undefined;
    const updatedMilestone = { ...milestone, ...updates };
    this.projectMilestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  async deleteProjectMilestone(id: string): Promise<boolean> {
    return this.projectMilestones.delete(id);
  }

  // Subscription methods
  async getSubscriptions(userId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createSubscription(insertSub: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = {
      ...insertSub,
      id,
      createdAt: new Date(),
      description: insertSub.description || "",
      currency: insertSub.currency || "USD",
      category: insertSub.category || "other",
      isActive: insertSub.isActive !== undefined ? insertSub.isActive : true,
      url: insertSub.url || "",
      notes: insertSub.notes || "",
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const sub = this.subscriptions.get(id);
    if (!sub) return undefined;
    const updatedSub = { ...sub, ...updates };
    this.subscriptions.set(id, updatedSub);
    return updatedSub;
  }

  async deleteSubscription(id: string): Promise<boolean> {
    return this.subscriptions.delete(id);
  }

  // Challenge methods
  async getChallenges(userId: string): Promise<Challenge[]> {
    return Array.from(this.challenges.values())
      .filter(challenge => challenge.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const id = randomUUID();
    const challenge: Challenge = {
      ...insertChallenge,
      id,
      createdAt: new Date(),
      isActive: insertChallenge.isActive !== undefined ? insertChallenge.isActive : true,
      progress: insertChallenge.progress || 0,
      participants: insertChallenge.participants || 1,
      difficulty: insertChallenge.difficulty || "medium",
    };
    this.challenges.set(id, challenge);
    return challenge;
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge | undefined> {
    const challenge = this.challenges.get(id);
    if (!challenge) return undefined;
    const updatedChallenge = { ...challenge, ...updates };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  async deleteChallenge(id: string): Promise<boolean> {
    return this.challenges.delete(id);
  }

  // World Clock methods
  async getWorldClocks(userId: string): Promise<WorldClock[]> {
    return Array.from(this.worldClocks.values())
      .filter(clock => clock.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  async createWorldClock(insertClock: InsertWorldClock): Promise<WorldClock> {
    const id = randomUUID();
    const clock: WorldClock = {
      ...insertClock,
      id,
      createdAt: new Date(),
      isActive: insertClock.isActive !== undefined ? insertClock.isActive : true,
      order: insertClock.order || 0,
      utcOffset: insertClock.utcOffset || 0,
      isDST: insertClock.isDST || false,
    };
    this.worldClocks.set(id, clock);
    return clock;
  }

  async updateWorldClock(id: string, updates: Partial<WorldClock>): Promise<WorldClock | undefined> {
    const clock = this.worldClocks.get(id);
    if (!clock) return undefined;
    const updatedClock = { ...clock, ...updates };
    this.worldClocks.set(id, updatedClock);
    return updatedClock;
  }

  async deleteWorldClock(id: string): Promise<boolean> {
    return this.worldClocks.delete(id);
  }

  // Web Activity methods
  async getWebActivity(userId: string, type?: string): Promise<WebActivity[]> {
    return Array.from(this.webActivity.values())
      .filter(activity => {
        if (activity.userId !== userId) return false;
        if (type && activity.activityType !== type) return false;
        return true;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createWebActivity(insertActivity: InsertWebActivity): Promise<WebActivity> {
    const id = randomUUID();
    const activity: WebActivity = {
      ...insertActivity,
      id,
      createdAt: new Date(),
      duration: insertActivity.duration || 0,
      category: insertActivity.category || "other",
      isProductivity: insertActivity.isProductivity || false,
    };
    this.webActivity.set(id, activity);
    return activity;
  }

  async updateWebActivity(id: string, updates: Partial<WebActivity>): Promise<WebActivity | undefined> {
    const activity = this.webActivity.get(id);
    if (!activity) return undefined;
    const updatedActivity = { ...activity, ...updates };
    this.webActivity.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteWebActivity(id: string): Promise<boolean> {
    return this.webActivity.delete(id);
  }

  // Anniversary methods
  async getAnniversaries(userId: string): Promise<Anniversary[]> {
    return Array.from(this.anniversaries.values())
      .filter(anniversary => anniversary.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createAnniversary(insertAnniversary: InsertAnniversary): Promise<Anniversary> {
    const id = randomUUID();
    const anniversary: Anniversary = {
      ...insertAnniversary,
      id,
      createdAt: new Date(),
      description: insertAnniversary.description || "",
      isRecurring: insertAnniversary.isRecurring !== undefined ? insertAnniversary.isRecurring : true,
      reminderDays: insertAnniversary.reminderDays || 7,
      category: insertAnniversary.category || "other",
    };
    this.anniversaries.set(id, anniversary);
    return anniversary;
  }

  async updateAnniversary(id: string, updates: Partial<Anniversary>): Promise<Anniversary | undefined> {
    const anniversary = this.anniversaries.get(id);
    if (!anniversary) return undefined;
    const updatedAnniversary = { ...anniversary, ...updates };
    this.anniversaries.set(id, updatedAnniversary);
    return updatedAnniversary;
  }

  async deleteAnniversary(id: string): Promise<boolean> {
    return this.anniversaries.delete(id);
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date(),
      isRead: insertNotification.isRead || false,
      priority: insertNotification.priority || "medium",
      category: insertNotification.category || "general",
      actionUrl: insertNotification.actionUrl || "",
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    const updatedNotification = { ...notification, ...updates };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Social Media Post methods
  async getSocialMediaPosts(userId: string, platform?: string): Promise<SocialMediaPost[]> {
    return Array.from(this.socialMediaPosts.values())
      .filter(post => {
        if (post.userId !== userId) return false;
        if (platform && post.platform !== platform) return false;
        return true;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createSocialMediaPost(insertPost: InsertSocialMediaPost): Promise<SocialMediaPost> {
    const id = randomUUID();
    const post: SocialMediaPost = {
      ...insertPost,
      id,
      createdAt: new Date(),
      likes: insertPost.likes || 0,
      shares: insertPost.shares || 0,
      comments: insertPost.comments || 0,
      isPublished: insertPost.isPublished !== undefined ? insertPost.isPublished : true,
      mediaUrls: insertPost.mediaUrls || "[]",
    };
    this.socialMediaPosts.set(id, post);
    return post;
  }

  async updateSocialMediaPost(id: string, updates: Partial<SocialMediaPost>): Promise<SocialMediaPost | undefined> {
    const post = this.socialMediaPosts.get(id);
    if (!post) return undefined;
    const updatedPost = { ...post, ...updates };
    this.socialMediaPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteSocialMediaPost(id: string): Promise<boolean> {
    return this.socialMediaPosts.delete(id);
  }

  // News Article methods
  async getNewsArticles(userId: string, category?: string): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => {
        if (article.userId !== userId) return false;
        if (category && article.category !== category) return false;
        return true;
      })
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  async createNewsArticle(insertArticle: InsertNewsArticle): Promise<NewsArticle> {
    const id = randomUUID();
    const article: NewsArticle = {
      ...insertArticle,
      id,
      createdAt: new Date(),
      summary: insertArticle.summary || "",
      imageUrl: insertArticle.imageUrl || "",
      isRead: insertArticle.isRead || false,
      isSaved: insertArticle.isSaved || false,
      readingTime: insertArticle.readingTime || 5,
    };
    this.newsArticles.set(id, article);
    return article;
  }

  async updateNewsArticle(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle | undefined> {
    const article = this.newsArticles.get(id);
    if (!article) return undefined;
    const updatedArticle = { ...article, ...updates };
    this.newsArticles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteNewsArticle(id: string): Promise<boolean> {
    return this.newsArticles.delete(id);
  }

  // Brainstorm Session methods
  async getBrainstormSessions(userId: string): Promise<BrainstormSession[]> {
    return Array.from(this.brainstormSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createBrainstormSession(insertSession: InsertBrainstormSession): Promise<BrainstormSession> {
    const id = randomUUID();
    const session: BrainstormSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      status: insertSession.status || "active",
      ideas: insertSession.ideas || "[]",
      tags: insertSession.tags || "",
      aiSuggestions: insertSession.aiSuggestions || "[]",
    };
    this.brainstormSessions.set(id, session);
    return session;
  }

  async updateBrainstormSession(id: string, updates: Partial<BrainstormSession>): Promise<BrainstormSession | undefined> {
    const session = this.brainstormSessions.get(id);
    if (!session) return undefined;
    const updatedSession = { ...session, ...updates };
    this.brainstormSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteBrainstormSession(id: string): Promise<boolean> {
    return this.brainstormSessions.delete(id);
  }

  // Search History methods
  async getSearchHistory(userId: string): Promise<SearchHistory[]> {
    return Array.from(this.searchHistory.values())
      .filter(search => search.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createSearchHistory(insertSearch: InsertSearchHistory): Promise<SearchHistory> {
    const id = randomUUID();
    const search: SearchHistory = {
      ...insertSearch,
      id,
      createdAt: new Date(),
      resultCount: insertSearch.resultCount || 0,
      clickedResults: insertSearch.clickedResults || "[]",
      sessionId: insertSearch.sessionId || "",
    };
    this.searchHistory.set(id, search);
    return search;
  }

  async updateSearchHistory(id: string, updates: Partial<SearchHistory>): Promise<SearchHistory | undefined> {
    const search = this.searchHistory.get(id);
    if (!search) return undefined;
    const updatedSearch = { ...search, ...updates };
    this.searchHistory.set(id, updatedSearch);
    return updatedSearch;
  }

  async deleteSearchHistory(id: string): Promise<boolean> {
    return this.searchHistory.delete(id);
  }

  // Theme Scheduler methods
  async getThemeSchedules(userId: string): Promise<any[]> {
    return Array.from(this.themeSchedules.values())
      .filter(schedule => schedule.userId === userId);
  }

  async createThemeSchedule(schedule: any): Promise<any> {
    const id = randomUUID();
    const newSchedule = {
      ...schedule,
      id,
      createdAt: new Date(),
    };
    this.themeSchedules.set(id, newSchedule);
    return newSchedule;
  }

  async updateThemeSchedule(id: string, updates: any): Promise<any> {
    const schedule = this.themeSchedules.get(id);
    if (!schedule) return undefined;
    const updatedSchedule = { ...schedule, ...updates };
    this.themeSchedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteThemeSchedule(id: string): Promise<boolean> {
    return this.themeSchedules.delete(id);
  }

  // Widget Layout methods
  async getWidgetLayouts(userId: string): Promise<any[]> {
    return Array.from(this.widgetLayouts.values())
      .filter(layout => layout.userId === userId);
  }

  async createWidgetLayout(layout: any): Promise<any> {
    const id = randomUUID();
    const newLayout = {
      ...layout,
      id,
      createdAt: new Date(),
    };
    this.widgetLayouts.set(id, newLayout);
    return newLayout;
  }

  async updateWidgetLayout(id: string, updates: any): Promise<any> {
    const layout = this.widgetLayouts.get(id);
    if (!layout) return undefined;
    const updatedLayout = { ...layout, ...updates };
    this.widgetLayouts.set(id, updatedLayout);
    return updatedLayout;
  }

  async deleteWidgetLayout(id: string): Promise<boolean> {
    return this.widgetLayouts.delete(id);
  }

  async getCurrentLayout(userId: string): Promise<string | undefined> {
    return this.currentLayouts.get(userId);
  }

  async setCurrentLayout(userId: string, layoutId: string): Promise<void> {
    this.currentLayouts.set(userId, layoutId);
  }

  // Daily Photo methods
  async getDailyPhoto(userId: string, date: string): Promise<any> {
    const key = `${userId}-${date}`;
    return this.dailyPhotos.get(key);
  }

  async createDailyPhoto(photo: any): Promise<any> {
    const id = randomUUID();
    const newPhoto = {
      ...photo,
      id,
      createdAt: new Date(),
    };
    const key = `${photo.userId}-${photo.date}`;
    this.dailyPhotos.set(key, newPhoto);
    return newPhoto;
  }
}

export const storage = new MemStorage();
