import { useState } from "react";
import { BookOpen, Plus, Clock, Star, ExternalLink, Play, Pause, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface LearningItem {
  id: string;
  type: "podcast" | "article" | "video" | "book" | "course";
  title: string;
  url: string;
  description: string;
  category: string;
  estimatedTime: number; // minutes
  status: "pending" | "in_progress" | "completed";
  progress: number; // percentage
  priority: number; // 1-5
  addedAt: Date;
  completedAt: Date | null;
}

export function LearningQueueWidget() {
  const [newItem, setNewItem] = useState({
    title: "",
    url: "",
    description: "",
    type: "article" as const,
    category: "general",
    estimatedTime: 15,
    priority: 3,
    status: "pending" as const,
    progress: 0,
    userId: "default-user",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const queryClient = useQueryClient();

  const { data: learningQueue = [], isLoading } = useQuery({
    queryKey: ["/api/learning-queue"],
    queryFn: async () => {
      const response = await fetch("/api/learning-queue");
      if (!response.ok) throw new Error("Failed to fetch learning queue");
      return response.json();
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (item: typeof newItem) => {
      const response = await fetch("/api/learning-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error("Failed to create learning item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-queue"] });
      setShowAddDialog(false);
      setNewItem({
        title: "",
        url: "",
        description: "",
        type: "article",
        category: "general",
        estimatedTime: 15,
        priority: 3,
        status: "pending",
        progress: 0,
        userId: "default-user",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LearningItem> }) => {
      const response = await fetch(`/api/learning-queue/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update learning item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-queue"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/learning-queue/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete learning item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-queue"] });
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "podcast": return "🎧";
      case "video": return "🎥";
      case "book": return "📚";
      case "course": return "🎓";
      default: return "📄";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "text-red-400";
    if (priority >= 3) return "text-yellow-400";
    return "text-green-400";
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const markAsStarted = (item: LearningItem) => {
    updateItemMutation.mutate({
      id: item.id,
      updates: { status: "in_progress", progress: 10 },
    });
  };

  const markAsCompleted = (item: LearningItem) => {
    updateItemMutation.mutate({
      id: item.id,
      updates: { 
        status: "completed", 
        progress: 100,
        completedAt: new Date(),
      },
    });
  };

  const updateProgress = (item: LearningItem, newProgress: number) => {
    const status = newProgress >= 100 ? "completed" : "in_progress";
    updateItemMutation.mutate({
      id: item.id,
      updates: { 
        progress: newProgress, 
        status,
        ...(newProgress >= 100 && { completedAt: new Date() }),
      },
    });
  };

  const categories = ["general", "productivity", "focus", "health", "technology", "business", "personal"];
  
  const filteredItems = learningQueue.filter((item: LearningItem) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  const quickAddTemplates = {
    article: [
      { title: "Deep Work Principles", url: "https://example.com/deep-work", time: 15 },
      { title: "Productivity Hacks", url: "https://example.com/productivity", time: 10 },
    ],
    podcast: [
      { title: "The Tim Ferriss Show", url: "https://tim.blog/podcast", time: 60 },
      { title: "Huberman Lab", url: "https://hubermanlab.com", time: 90 },
    ],
    video: [
      { title: "How to Focus Better", url: "https://youtube.com", time: 20 },
      { title: "Learning Techniques", url: "https://youtube.com", time: 30 },
    ],
  };

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-4 bg-white bg-opacity-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Learning Queue</h3>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-sm max-w-md">
            <DialogHeader>
              <DialogTitle>Add Learning Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={newItem.type}
                onValueChange={(value: any) => setNewItem({ ...newItem, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">📄 Article</SelectItem>
                  <SelectItem value="podcast">🎧 Podcast</SelectItem>
                  <SelectItem value="video">🎥 Video</SelectItem>
                  <SelectItem value="book">📚 Book</SelectItem>
                  <SelectItem value="course">🎓 Course</SelectItem>
                </SelectContent>
              </Select>

              {quickAddTemplates[newItem.type as keyof typeof quickAddTemplates] && (
                <div className="space-y-1">
                  <p className="text-xs text-white opacity-60">Quick add:</p>
                  <div className="grid gap-1">
                    {quickAddTemplates[newItem.type as keyof typeof quickAddTemplates].map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewItem({
                            ...newItem,
                            title: template.title,
                            url: template.url,
                            estimatedTime: template.time,
                          });
                        }}
                        className="text-xs h-auto py-1 justify-start"
                      >
                        {template.title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Input
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
              
              <Input
                placeholder="URL"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              />
              
              <Input
                placeholder="Description (optional)"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Minutes"
                  value={newItem.estimatedTime}
                  onChange={(e) => setNewItem({ ...newItem, estimatedTime: parseInt(e.target.value) || 15 })}
                />
              </div>

              <Select
                value={newItem.priority.toString()}
                onValueChange={(value) => setNewItem({ ...newItem, priority: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">🔥 Urgent</SelectItem>
                  <SelectItem value="4">⚡ High</SelectItem>
                  <SelectItem value="3">📋 Medium</SelectItem>
                  <SelectItem value="2">📝 Low</SelectItem>
                  <SelectItem value="1">❄️ Someday</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => createItemMutation.mutate({
                  ...newItem,
                  status: "pending",
                  progress: 0,
                  userId: "default-user",
                })}
                disabled={!newItem.title || !newItem.url || createItemMutation.isPending}
                className="w-full"
              >
                Add to Queue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="pending" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Queue</TabsTrigger>
            <TabsTrigger value="in_progress" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Active</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Done</TabsTrigger>
            <TabsTrigger value="all" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-2 mt-3">
            {filteredItems.length === 0 ? (
              <p className="text-sm text-white/60 text-center py-4">
                No {activeTab === "all" ? "learning items" : activeTab} items yet.
              </p>
            ) : (
              filteredItems.map((item: LearningItem) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getTypeIcon(item.type)}</span>
                        <h4 className="text-sm font-medium text-white truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <div className={`flex items-center ${getPriorityColor(item.priority)}`}>
                            {Array.from({ length: item.priority }).map((_, i) => (
                              <Star key={i} className="h-2 w-2 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-xs text-white/60 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-white/60 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(item.estimatedTime)}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open
                        </a>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItemMutation.mutate(item.id)}
                      className="h-6 w-6 p-0 text-white/60 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {item.status === "in_progress" && (
                    <div className="space-y-2">
                      <Progress value={item.progress} className="h-2" />
                      <div className="flex gap-1">
                        {[25, 50, 75, 100].map((percent) => (
                          <Button
                            key={percent}
                            size="sm"
                            variant="outline"
                            onClick={() => updateProgress(item, percent)}
                            className="flex-1 h-6 text-xs"
                          >
                            {percent}%
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => markAsStarted(item)}
                      className="w-full h-7 text-xs"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start Learning
                    </Button>
                  )}

                  {item.status === "in_progress" && (
                    <Button
                      size="sm"
                      onClick={() => markAsCompleted(item)}
                      className="w-full h-7 text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}