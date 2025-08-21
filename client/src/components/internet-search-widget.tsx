import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ExternalLink, History, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
// Card components removed - using glassmorphism divs instead
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SearchHistory, InsertSearchHistory } from "@shared/schema";

const SEARCH_ENGINES = [
  { value: "google", label: "Google", url: "https://www.google.com/search?q=" },
  { value: "bing", label: "Bing", url: "https://www.bing.com/search?q=" },
  { value: "duckduckgo", label: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  { value: "yahoo", label: "Yahoo", url: "https://search.yahoo.com/search?p=" },
];

const QUICK_SEARCHES = [
  "Latest technology news",
  "Best productivity apps 2024", 
  "How to improve focus",
  "Weather forecast",
  "Stock market today",
  "Recipe ideas",
  "Programming tutorials",
  "Workout routines",
];

export function InternetSearchWidget() {
  const [query, setQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("google");
  const [activeTab, setActiveTab] = useState("search");
  const queryClient = useQueryClient();

  const { data: searchHistory = [] } = useQuery<SearchHistory[]>({
    queryKey: ["/api/search-history"],
  });

  const saveSearch = useMutation({
    mutationFn: async (data: InsertSearchHistory) => {
      const response = await fetch("/api/search-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save search");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-history"] });
    },
  });

  const deleteSearchHistory = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/search-history/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete search history");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-history"] });
    },
  });

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) return;

    const engine = SEARCH_ENGINES.find(e => e.value === selectedEngine);
    if (!engine) return;

    // Save search to history
    saveSearch.mutate({
      query: searchTerm.trim(),
      searchEngine: selectedEngine,
      resultCount: 0, // Would be populated by actual search results
      clickedResults: "[]",
      userId: "default-user",
    });

    // Open search in new tab
    const searchUrl = engine.url + encodeURIComponent(searchTerm.trim());
    window.open(searchUrl, '_blank');

    // Clear input if using main search
    if (!searchQuery) {
      setQuery("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const searchDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - searchDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return searchDate.toLocaleDateString();
  };

  const recentSearches = searchHistory
    .sort((a, b) => new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime())
    .slice(0, 10);

  const popularSearches = searchHistory
    .reduce((acc, search) => {
      const existing = acc.find(s => s.query.toLowerCase() === search.query.toLowerCase());
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ query: search.query, count: 1, lastSearched: search.searchedAt });
      }
      return acc;
    }, [] as { query: string; count: number; lastSearched: string }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
      <div className="pb-3">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Internet Search</h3>
        </div>
      </div>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="search" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Search</TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            {/* Search engine selector */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-white opacity-70" />
              <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_ENGINES.map(engine => (
                    <SelectItem key={engine.value} value={engine.value}>
                      {engine.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search input */}
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search the internet..."
                className="flex-1"
              />
              <Button 
                onClick={() => handleSearch()}
                disabled={!query.trim()}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick searches */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Quick Searches</h4>
              <div className="grid grid-cols-1 gap-1">
                {QUICK_SEARCHES.slice(0, 4).map((quickSearch, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearch(quickSearch)}
                    className="justify-start text-xs h-8 px-3 text-white/70 hover:text-white"
                  >
                    <Search className="w-3 h-3 mr-2" />
                    {quickSearch}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recent searches preview */}
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Recent</h4>
                <div className="space-y-1">
                  {recentSearches.slice(0, 3).map(search => (
                    <div 
                      key={search.id} 
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSearch(search.query)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <History className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">
                          {search.query}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {search.searchEngine}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(search.searchedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {searchHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No search history</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your searches will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Popular searches */}
                {popularSearches.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Most Searched</h4>
                    <div className="space-y-1">
                      {popularSearches.slice(0, 4).map((search, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleSearch(search.query)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-5 h-5 bg-indigo-100 rounded-full text-xs font-bold text-indigo-600">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700 truncate">
                              {search.query}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {search.count}x
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(search.lastSearched)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All recent searches */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Recent Searches</h4>
                  <div className="space-y-1">
                    {recentSearches.map(search => (
                      <div 
                        key={search.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                      >
                        <div 
                          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleSearch(search.query)}
                        >
                          <History className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            {search.query}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {search.searchEngine}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(search.searchedAt)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSearchHistory.mutate(search.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Search stats */}
        {searchHistory.length > 0 && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-700">Total searches:</span>
              <span className="font-medium text-indigo-800">{searchHistory.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-700">Favorite engine:</span>
              <span className="font-medium text-indigo-800 capitalize">
                {(() => {
                  const engineCounts = searchHistory.reduce((acc, search) => {
                    acc[search.searchEngine] = (acc[search.searchEngine] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  const sortedEntries = Object.entries(engineCounts).sort(([,a], [,b]) => b - a);
                  return sortedEntries[0]?.[0] || "None";
                })()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}