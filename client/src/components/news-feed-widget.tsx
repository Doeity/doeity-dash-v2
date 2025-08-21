import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Newspaper, ExternalLink, RefreshCw, Filter, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
// Card components removed - using glassmorphism divs instead
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NewsArticle, InsertNewsArticle } from "@shared/schema";

const NEWS_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "business", label: "Business" },
  { value: "technology", label: "Technology" },
  { value: "science", label: "Science" },
  { value: "health", label: "Health" },
  { value: "sports", label: "Sports" },
  { value: "entertainment", label: "Entertainment" },
];

const CATEGORY_COLORS = {
  general: "bg-gray-100 text-gray-800",
  business: "bg-green-100 text-green-800",
  technology: "bg-blue-100 text-blue-800",
  science: "bg-purple-100 text-purple-800",
  health: "bg-red-100 text-red-800",
  sports: "bg-orange-100 text-orange-800",
  entertainment: "bg-pink-100 text-pink-800",
};

export function NewsFeedWidget() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: articles = [] } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news-articles"],
  });

  const refreshNews = useMutation({
    mutationFn: async () => {
      setRefreshing(true);
      // Simulate API call to refresh news feed
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRefreshing(false);
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news-articles"] });
    },
  });

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const articleDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just published";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return articleDate.toLocaleDateString();
  };

  const getFilteredArticles = () => {
    let filtered = articles;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    return filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  };

  const filteredArticles = getFilteredArticles();

  // Sample news articles for demonstration
  const sampleArticles: NewsArticle[] = [
    {
      id: "sample-1",
      userId: "default-user",
      title: "Major Breakthrough in Quantum Computing Achieved by Research Team",
      description: "Scientists have made a significant advancement in quantum computing technology that could revolutionize the industry. The breakthrough promises faster processing speeds and enhanced security.",
      url: "https://example.com/quantum-breakthrough",
      source: "Tech Today",
      category: "technology",
      imageUrl: "",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      fetchedAt: new Date().toISOString(),
    },
    {
      id: "sample-2",
      userId: "default-user", 
      title: "Global Markets Show Strong Performance Despite Economic Uncertainty",
      description: "Stock markets worldwide have shown resilience and growth in the face of ongoing economic challenges. Analysts attribute this to improved investor confidence and strategic policy changes.",
      url: "https://example.com/market-performance",
      source: "Financial News",
      category: "business",
      imageUrl: "",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      fetchedAt: new Date().toISOString(),
    },
    {
      id: "sample-3",
      userId: "default-user",
      title: "New Study Reveals Surprising Health Benefits of Mediterranean Diet",
      description: "A comprehensive study spanning five years has uncovered additional health benefits of the Mediterranean diet, including improved cognitive function and reduced inflammation.",
      url: "https://example.com/mediterranean-diet",
      source: "Health Weekly",
      category: "health",
      imageUrl: "",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      fetchedAt: new Date().toISOString(),
    }
  ];

  const displayArticles = articles.length > 0 ? filteredArticles : sampleArticles;
  const categories = [...new Set(displayArticles.map(article => article.category))];

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-3">
        <h3 className="text-white font-medium text-lg flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-white" />
          News Feed
        </h3>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {NEWS_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refreshNews.mutate()}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      <div>
        {displayArticles.length === 0 ? (
          <div className="text-center py-8">
            <Newspaper className="w-12 h-12 mx-auto text-white opacity-30 mb-2" />
            <p className="text-sm text-white opacity-60">No news articles</p>
            <p className="text-xs text-white opacity-40 mt-1">
              Configure news sources to see headlines
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top story */}
            {displayArticles.length > 0 && (
              <div className="border border-white border-opacity-30 rounded-lg p-4 bg-blue-500 bg-opacity-20">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="destructive" className="text-xs">
                    TOP STORY
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => window.open(displayArticles[0].url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                
                <h3 className="font-bold text-base mb-2 leading-tight text-white">
                  {displayArticles[0].title}
                </h3>
                
                <p className="text-sm text-white opacity-80 mb-3 leading-relaxed">
                  {displayArticles[0].description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${CATEGORY_COLORS[displayArticles[0].category as keyof typeof CATEGORY_COLORS]}`}>
                      {displayArticles[0].category}
                    </Badge>
                    <span className="text-xs text-white opacity-50">{displayArticles[0].source}</span>
                  </div>
                  <span className="text-xs text-white opacity-50">
                    {formatTimeAgo(displayArticles[0].publishedAt)}
                  </span>
                </div>
              </div>
            )}

            {/* Other stories */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Latest Headlines</h4>
              {displayArticles.slice(1, 5).map(article => {
                const categoryColor = CATEGORY_COLORS[article.category as keyof typeof CATEGORY_COLORS];
                
                return (
                  <div key={article.id} className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg p-3 hover:bg-white hover:bg-opacity-20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 leading-tight text-white">
                          {article.title.length > 80 
                            ? `${article.title.slice(0, 80)}...` 
                            : article.title
                          }
                        </h4>
                        
                        <p className="text-xs text-white opacity-70 mb-2 leading-relaxed">
                          {article.description.length > 120 
                            ? `${article.description.slice(0, 120)}...` 
                            : article.description
                          }
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${categoryColor}`}>
                              {article.category}
                            </Badge>
                            <span className="text-xs text-white opacity-50">{article.source}</span>
                          </div>
                          <span className="text-xs text-white opacity-50">
                            {formatTimeAgo(article.publishedAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Bookmark className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(article.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayArticles.length > 5 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                Showing 5 of {displayArticles.length} articles
              </p>
            )}
          </div>
        )}

        {/* News sources info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-700">News Sources</h4>
          </div>
          <div className="text-xs text-gray-600">
            {articles.length > 0 
              ? `${[...new Set(articles.map(a => a.source))].length} sources configured`
              : "Demo mode - Configure RSS feeds and news sources for real headlines"
            }
          </div>
        </div>
      </div>
    </div>
  );
}