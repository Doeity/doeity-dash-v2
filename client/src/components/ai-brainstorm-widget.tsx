import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, Send, Star, History, Lightbulb, FileText, HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BrainstormSession, InsertBrainstormSession } from "@shared/schema";

const SESSION_TYPES = [
  { value: "idea_generation", label: "Idea Generation", icon: Lightbulb, description: "Generate creative ideas" },
  { value: "summary", label: "Summary", icon: FileText, description: "Summarize content" },
  { value: "analysis", label: "Analysis", icon: Search, description: "Analyze and break down topics" },
  { value: "question", label: "Q&A", icon: HelpCircle, description: "Ask questions and get answers" },
];

const QUICK_PROMPTS = [
  "Give me 10 creative business ideas for 2024",
  "Summarize the key benefits of remote work",
  "Analyze the pros and cons of electric vehicles",
  "What are effective productivity techniques?",
  "Creative writing prompts for a short story",
  "How to improve team communication?",
];

export function AIBrainstormWidget() {
  const [prompt, setPrompt] = useState("");
  const [sessionType, setSessionType] = useState("idea_generation");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery<BrainstormSession[]>({
    queryKey: ["/api/brainstorm-sessions"],
  });

  const createSession = useMutation({
    mutationFn: async (data: InsertBrainstormSession) => {
      setIsLoading(true);
      const response = await fetch("/api/brainstorm-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create brainstorm session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brainstorm-sessions"] });
      setPrompt("");
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorited }: { id: string; isFavorited: boolean }) => {
      const response = await fetch(`/api/brainstorm-sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorited }),
      });
      if (!response.ok) throw new Error("Failed to update session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brainstorm-sessions"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Simulate AI response - in real implementation, this would call OpenAI API
    const mockResponse = generateMockResponse(prompt, sessionType);
    
    const sessionData = {
      prompt: prompt.trim(),
      response: mockResponse,
      sessionType,
      tags: extractTags(prompt),
      userId: "default-user",
    };

    createSession.mutate(sessionData);
  };

  const generateMockResponse = (prompt: string, type: string): string => {
    // This is a mock implementation. In a real app, you'd call the OpenAI API
    switch (type) {
      case "idea_generation":
        return `Here are some creative ideas based on your prompt:\n\n1. **Innovative Solution A**: A fresh approach that combines modern technology with traditional methods.\n\n2. **Creative Concept B**: An out-of-the-box thinking that could revolutionize the space.\n\n3. **Strategic Direction C**: A data-driven approach that focuses on user experience.\n\n4. **Collaborative Framework D**: A community-based solution that encourages participation.\n\n5. **Sustainable Model E**: An environmentally conscious approach that creates long-term value.`;
      
      case "summary":
        return `**Key Summary Points:**\n\n• **Main Theme**: ${prompt.slice(0, 50)}...\n• **Important Aspects**: Critical elements that drive success\n• **Action Items**: Practical steps for implementation\n• **Considerations**: Factors to keep in mind\n• **Next Steps**: Recommended follow-up actions`;
      
      case "analysis":
        return `**Analysis Results:**\n\n**Strengths:**\n• Positive aspect 1\n• Advantage 2\n• Opportunity 3\n\n**Challenges:**\n• Potential obstacle 1\n• Risk factor 2\n• Limitation 3\n\n**Recommendations:**\n• Strategic suggestion 1\n• Implementation tip 2\n• Optimization approach 3`;
      
      case "question":
        return `**Answer:** Based on your question, here's a comprehensive response:\n\nThe key factors to consider are multifaceted and include both immediate and long-term implications. From a practical standpoint, the most effective approach would be to start with small, manageable steps while keeping the bigger picture in mind.\n\n**Additional Insights:**\n• Consider the context and timing\n• Evaluate available resources\n• Plan for potential challenges\n• Set measurable goals`;
      
      default:
        return "I'd be happy to help you explore this topic further. Could you provide more specific details about what you're looking for?";
    }
  };

  const extractTags = (prompt: string): string => {
    // Simple tag extraction based on keywords
    const commonKeywords = ['business', 'creative', 'technology', 'productivity', 'writing', 'marketing', 'strategy'];
    const foundTags = commonKeywords.filter(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
    return foundTags.join(',');
  };

  const useQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
  };

  const recentSessions = sessions.slice(0, 3);
  const favoriteSessions = sessions.filter(session => session.isFavorited);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">AI Brainstorm</h3>
        </div>
      </div>
      <div>
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="new" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">New Session</TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="sessionType" className="text-white">Session Type</Label>
                <Select value={sessionType} onValueChange={setSessionType}>
                  <SelectTrigger className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder:text-white placeholder:opacity-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30">
                    {SESSION_TYPES.map(type => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value} className="text-white focus:bg-white focus:bg-opacity-20">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white opacity-60 mt-1">
                  {SESSION_TYPES.find(t => t.value === sessionType)?.description}
                </p>
              </div>

              <div>
                <Label htmlFor="prompt" className="text-white">Your Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What would you like to brainstorm about?"
                  rows={3}
                  required
                  className="bg-white bg-opacity-10 border-white border-opacity-20 text-white placeholder:text-white placeholder:opacity-50 focus:border-white focus:border-opacity-40"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !prompt.trim()} 
                className="w-full"
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Generate Ideas
                  </>
                )}
              </Button>
            </form>

            {/* Quick prompts */}
            <div className="space-y-2">
              <Label className="text-xs text-white opacity-70">Quick Prompts:</Label>
              <div className="grid grid-cols-1 gap-1">
                {QUICK_PROMPTS.slice(0, 3).map((quickPrompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => useQuickPrompt(quickPrompt)}
                    className="text-xs text-left justify-start h-auto py-2 px-3 bg-white bg-opacity-10 border-white border-opacity-20 text-white hover:bg-white hover:bg-opacity-20"
                  >
                    {quickPrompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Latest response */}
            {recentSessions.length > 0 && (
              <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">Latest Response</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleFavorite.mutate({
                      id: recentSessions[0].id,
                      isFavorited: !recentSessions[0].isFavorited
                    })}
                  >
                    <Star className={`h-3 w-3 ${recentSessions[0].isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-white opacity-40'}`} />
                  </Button>
                </div>
                <p className="text-xs text-white opacity-80 mb-2">
                  <strong>Prompt:</strong> {recentSessions[0].prompt.slice(0, 100)}...
                </p>
                <div className="text-xs text-white opacity-70 whitespace-pre-wrap">
                  {recentSessions[0].response.slice(0, 200)}...
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-white opacity-60 italic text-center py-4">
                No brainstorm sessions yet
              </p>
            ) : (
              <div className="space-y-3">
                {/* Favorites */}
                {favoriteSessions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-1 text-white">
                      <Star className="w-4 h-4 text-yellow-400" />
                      Favorites
                    </h4>
                    {favoriteSessions.slice(0, 2).map(session => (
                      <div key={session.id} className="p-3 bg-yellow-500 bg-opacity-20 border border-white border-opacity-20 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {session.sessionType.replace('_', ' ')}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleFavorite.mutate({
                              id: session.id,
                              isFavorited: false
                            })}
                          >
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </Button>
                        </div>
                        <p className="text-xs font-medium mb-1 text-white">
                          {session.prompt.slice(0, 80)}...
                        </p>
                        <p className="text-xs text-white opacity-60">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent sessions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1 text-white">
                    <History className="w-4 h-4 text-white opacity-80" />
                    Recent Sessions
                  </h4>
                  {recentSessions.map(session => (
                    <div key={session.id} className="p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {session.sessionType.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {session.tags && (
                            <Badge variant="secondary" className="text-xs">
                              {session.tags.split(',')[0]}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleFavorite.mutate({
                              id: session.id,
                              isFavorited: !session.isFavorited
                            })}
                          >
                            <Star className={`h-3 w-3 ${session.isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-white opacity-40'}`} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs font-medium mb-1 text-white">
                        {session.prompt.slice(0, 80)}...
                      </p>
                      <p className="text-xs text-white opacity-60">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}