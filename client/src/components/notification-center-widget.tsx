import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, MessageSquare, Calendar as CalendarIcon, AlertCircle, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
// Card components removed - using glassmorphism divs instead
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Notification, InsertNotification } from "@shared/schema";

const NOTIFICATION_ICONS = {
  email: Mail,
  slack: MessageSquare,
  calendar: CalendarIcon,
  reminder: Bell,
  system: AlertCircle,
};

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export function NotificationCenterWidget() {
  const [activeTab, setActiveTab] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to mark all notifications as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete notification");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationDate.toLocaleDateString();
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    if (showUnreadOnly) {
      filtered = filtered.filter(n => !n.isRead);
    }
    
    if (activeTab !== "all") {
      filtered = filtered.filter(n => n.type === activeTab);
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const notificationTypes = [...new Set(notifications.map(n => n.type))];

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>
      <div>
        {/* Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="unread-only"
              checked={showUnreadOnly}
              onCheckedChange={setShowUnreadOnly}
            />
            <Label htmlFor="unread-only" className="text-xs text-white">
              Show unread only
            </Label>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">All</TabsTrigger>
            <TabsTrigger value="email" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Email</TabsTrigger>
            <TabsTrigger value="system" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-3 mt-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto text-white opacity-30 mb-2" />
                <p className="text-sm text-white opacity-60">
                  {showUnreadOnly ? "No unread notifications" : "All caught up!"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.slice(0, 8).map(notification => {
                  const Icon = NOTIFICATION_ICONS[notification.type as keyof typeof NOTIFICATION_ICONS] || AlertCircle;
                  const priorityColor = PRIORITY_COLORS[notification.priority as keyof typeof PRIORITY_COLORS];
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 border border-white border-opacity-20 rounded-lg transition-colors ${
                        notification.isRead 
                          ? 'bg-white bg-opacity-10' 
                          : 'bg-white bg-opacity-20 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            notification.isRead ? 'text-white opacity-40' : 'text-blue-300'
                          }`} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-medium truncate ${
                                notification.isRead ? 'text-gray-600' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h4>
                              <Badge className={`text-xs ${priorityColor}`}>
                                {notification.priority}
                              </Badge>
                            </div>
                            
                            <p className={`text-sm mb-2 ${
                              notification.isRead ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {notification.message.length > 100 
                                ? `${notification.message.slice(0, 100)}...` 
                                : notification.message
                              }
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {notification.type}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                              
                              {notification.actionUrl && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => window.open(notification.actionUrl, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                              onClick={() => markAsRead.mutate(notification.id)}
                              disabled={markAsRead.isPending}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            onClick={() => deleteNotification.mutate(notification.id)}
                            disabled={deleteNotification.isPending}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {filteredNotifications.length > 8 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    Showing 8 of {filteredNotifications.length} notifications
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Summary */}
        {notifications.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Total notifications:</span>
              <span className="font-medium text-blue-800">{notifications.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Unread:</span>
              <span className="font-medium text-blue-800">{unreadCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}