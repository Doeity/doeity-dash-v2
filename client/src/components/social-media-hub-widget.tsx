import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Share2, ExternalLink, Heart, MessageCircle, Repeat2, Bookmark, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
// Card components removed - using glassmorphism divs instead
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SocialMediaPost, InsertSocialMediaPost } from "@shared/schema";

const PLATFORM_COLORS = {
  linkedin: "bg-blue-600 text-white",
  twitter: "bg-sky-500 text-white", 
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
};

const PLATFORM_ICONS = {
  linkedin: "💼",
  twitter: "🐦",
  instagram: "📸",
};

export function SocialMediaHubWidget() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery<SocialMediaPost[]>({
    queryKey: ["/api/social-media-posts"],
  });

  const refreshFeed = useMutation({
    mutationFn: async () => {
      setRefreshing(true);
      // Simulate API call to refresh social media feeds
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRefreshing(false);
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-media-posts"] });
    },
  });

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return postDate.toLocaleDateString();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getFilteredPosts = () => {
    let filtered = posts;
    
    if (selectedPlatform !== "all") {
      filtered = filtered.filter(post => post.platform === selectedPlatform);
    }
    
    return filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  };

  const filteredPosts = getFilteredPosts();
  const platforms = [...new Set(posts.map(post => post.platform))];

  // Sample posts for demonstration
  const samplePosts: SocialMediaPost[] = [
    {
      id: "sample-1",
      userId: "default-user",
      platform: "linkedin",
      postId: "linkedin-1",
      author: "Sarah Johnson",
      authorHandle: "@sarahjohnson",
      content: "Just launched our new product! Excited to see how it impacts the industry. The team worked incredibly hard on this. #ProductLaunch #Innovation #TeamWork",
      link: "https://linkedin.com/posts/sample",
      imageUrl: "",
      likes: 127,
      shares: 23,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      fetchedAt: new Date().toISOString(),
    },
    {
      id: "sample-2", 
      userId: "default-user",
      platform: "twitter",
      postId: "twitter-1",
      author: "Tech News Daily",
      authorHandle: "@technews",
      content: "Breaking: Major breakthrough in AI research announced today. This could change everything we know about machine learning. What are your thoughts? 🤖",
      link: "https://twitter.com/sample",
      imageUrl: "",
      likes: 892,
      shares: 234,
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      fetchedAt: new Date().toISOString(),
    }
  ];

  const displayPosts = posts.length > 0 ? filteredPosts : samplePosts;

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <Share2 className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Social Media</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => refreshFeed.mutate()}
          disabled={refreshing}
          className="h-8 w-8 p-0 text-white opacity-70 hover:opacity-100"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div>
        <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">All</TabsTrigger>
            <TabsTrigger value="linkedin" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">LinkedIn</TabsTrigger>
            <TabsTrigger value="twitter" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Twitter</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedPlatform} className="space-y-4 mt-4">
            {displayPosts.length === 0 ? (
              <div className="text-center py-8">
                <Share2 className="w-12 h-12 mx-auto text-white opacity-30 mb-2" />
                <p className="text-sm text-white opacity-60">No social media posts</p>
                <p className="text-xs text-white opacity-40 mt-1">
                  Connect your accounts to see feeds here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayPosts.slice(0, 4).map(post => {
                  const platformIcon = PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS];
                  const platformColor = PLATFORM_COLORS[post.platform as keyof typeof PLATFORM_COLORS];
                  
                  return (
                    <div key={post.id} className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg p-4 space-y-3 hover:bg-white hover:bg-opacity-20 transition-colors">
                      {/* Post header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {post.author.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-white">{post.author}</p>
                              <span className="text-lg">{platformIcon}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white opacity-60">
                              <span>{post.authorHandle}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(post.publishedAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Badge className={`text-xs ${platformColor}`}>
                          {post.platform}
                        </Badge>
                      </div>

                      {/* Post content */}
                      <div className="space-y-3">
                        <p className="text-sm text-white leading-relaxed">
                          {post.content.length > 200 
                            ? `${post.content.slice(0, 200)}...` 
                            : post.content
                          }
                        </p>
                        
                        {post.imageUrl && (
                          <div className="rounded-lg overflow-hidden">
                            <img 
                              src={post.imageUrl} 
                              alt="Post image"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Post actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-white border-opacity-20">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-white opacity-70">
                            <Heart className="w-4 h-4" />
                            <span className="text-xs">{formatNumber(post.likes)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-white opacity-70">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">Reply</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-white opacity-70">
                            <Repeat2 className="w-4 h-4" />
                            <span className="text-xs">{formatNumber(post.shares)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-white opacity-70 hover:opacity-100"
                          >
                            <Bookmark className="h-3 w-3" />
                          </Button>
                          
                          {post.link && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-white opacity-70 hover:opacity-100"
                              onClick={() => window.open(post.link, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {displayPosts.length > 4 && (
                  <p className="text-xs text-white opacity-50 text-center pt-2">
                    Showing 4 of {displayPosts.length} posts
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Connection status */}
        <div className="mt-4 p-3 bg-blue-500 bg-opacity-20 rounded-lg border border-white border-opacity-20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white">Connected Accounts</h4>
          </div>
          <div className="text-xs text-white opacity-70">
            {posts.length > 0 
              ? `${platforms.length} platform${platforms.length !== 1 ? 's' : ''} connected`
              : "Demo mode - Connect your social media accounts to see real feeds"
            }
          </div>
        </div>
      </div>
    </div>
  );
}