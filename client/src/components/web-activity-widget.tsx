import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, Clock, TrendingUp, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
// Card components removed - using glassmorphism divs instead
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WebActivity, InsertWebActivity } from "@shared/schema";

const CATEGORY_COLORS = {
  work: "bg-blue-100 text-blue-800",
  social: "bg-pink-100 text-pink-800",
  entertainment: "bg-purple-100 text-purple-800",
  education: "bg-green-100 text-green-800",
  shopping: "bg-orange-100 text-orange-800",
  news: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800",
};

export function WebActivityWidget() {
  const [activeTab, setActiveTab] = useState("recent");
  const queryClient = useQueryClient();

  const { data: webActivity = [] } = useQuery<WebActivity[]>({
    queryKey: ["/api/web-activity"],
  });

  const addActivity = useMutation({
    mutationFn: async (data: InsertWebActivity) => {
      const response = await fetch("/api/web-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add web activity");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/web-activity"] });
    },
  });

  const formatTimeSpent = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (domain: string): string => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  };

  const categorizeWebsite = (domain: string): string => {
    if (domain.includes('github') || domain.includes('stackoverflow') || domain.includes('docs')) return 'work';
    if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('instagram') || domain.includes('linkedin')) return 'social';
    if (domain.includes('youtube') || domain.includes('netflix') || domain.includes('spotify')) return 'entertainment';
    if (domain.includes('coursera') || domain.includes('udemy') || domain.includes('khan') || domain.includes('edu')) return 'education';
    if (domain.includes('amazon') || domain.includes('shop') || domain.includes('store')) return 'shopping';
    if (domain.includes('news') || domain.includes('cnn') || domain.includes('bbc') || domain.includes('reuters')) return 'news';
    return 'other';
  };

  // Sample data simulation (in real implementation, this would come from browser extension or tracking service)
  const recentActivity = webActivity
    .sort((a, b) => new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime())
    .slice(0, 8);

  const frequentActivity = webActivity
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 8);

  const totalTimeToday = webActivity.reduce((total, activity) => {
    const today = new Date().toDateString();
    const activityDate = new Date(activity.lastVisited).toDateString();
    return activityDate === today ? total + activity.totalTimeSpent : total;
  }, 0);

  const topDomains = webActivity.reduce((domains: Record<string, { count: number; time: number }>, activity) => {
    if (!domains[activity.domain]) {
      domains[activity.domain] = { count: 0, time: 0 };
    }
    domains[activity.domain].count += activity.visitCount;
    domains[activity.domain].time += activity.totalTimeSpent;
    return domains;
  }, {});

  const sortedDomains = Object.entries(topDomains)
    .sort(([, a], [, b]) => b.time - a.time)
    .slice(0, 5);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
      <div className="pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Web Activity</h3>
        </div>
      </div>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="recent" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Recent</TabsTrigger>
            <TabsTrigger value="frequent" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Frequent</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-4">
            {/* Today's summary */}
            <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-1 text-white">
                  <Clock className="w-4 h-4 text-white opacity-80" />
                  Today's Activity
                </h4>
                <Badge variant="outline" className="text-xs text-white opacity-70">
                  {recentActivity.length} sites
                </Badge>
              </div>
              <div className="text-lg font-bold text-green-300">
                {formatTimeSpent(totalTimeToday)}
              </div>
              <p className="text-xs text-white opacity-60">Total browsing time</p>
            </div>

            {/* Recent sites */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Recently Visited</h4>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-white opacity-60 italic text-center py-4">
                  No recent activity tracked
                </p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map(activity => {
                    const domain = getDomainFromUrl(activity.url);
                    const category = categorizeWebsite(domain);
                    const timeAgo = new Date(activity.lastVisited).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div key={activity.id} className="flex items-center justify-between p-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg hover:bg-white hover:bg-opacity-20">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getFaviconUrl(domain)} 
                            alt=""
                            className="w-4 h-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white">
                              {activity.title.slice(0, 40)}...
                            </p>
                            <p className="text-xs text-white opacity-60">{domain}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}>
                            {category}
                          </Badge>
                          <div className="text-xs text-white opacity-50">
                            {timeAgo}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(activity.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="frequent" className="space-y-4">
            {/* Top domains */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Most Visited Sites
              </h4>
              {sortedDomains.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  No frequent activity data
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedDomains.map(([domain, stats], index) => (
                    <div key={domain} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-xs font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <img 
                          src={getFaviconUrl(domain)} 
                          alt=""
                          className="w-4 h-4"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">{domain}</p>
                          <p className="text-xs text-gray-600">
                            {stats.count} visits
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatTimeSpent(stats.time)}
                        </p>
                        <p className="text-xs text-gray-600">
                          time spent
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Most visited pages */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Most Visited Pages</h4>
              {frequentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  No frequent pages tracked
                </p>
              ) : (
                <div className="space-y-2">
                  {frequentActivity.slice(0, 4).map(activity => {
                    const domain = getDomainFromUrl(activity.url);
                    const category = categorizeWebsite(domain);

                    return (
                      <div key={activity.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getFaviconUrl(domain)} 
                            alt=""
                            className="w-4 h-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {activity.title.slice(0, 35)}...
                            </p>
                            <p className="text-xs text-gray-600">{domain}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-gray-600 text-right">
                            <div>{activity.visitCount} visits</div>
                            <div>{formatTimeSpent(activity.totalTimeSpent)}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(activity.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add sample data note */}
        <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <strong>Note:</strong> This widget shows sample data. In a real implementation, 
          it would track actual browsing activity through a browser extension or tracking service.
        </div>
      </div>
    </div>
  );
}