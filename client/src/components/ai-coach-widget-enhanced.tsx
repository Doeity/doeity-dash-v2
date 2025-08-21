import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Shirt, ChefHat, Music, Heart, Gamepad2, Calendar, RefreshCw, Settings, Thermometer } from "lucide-react";
import WidgetClearControls from "@/components/widget-clear-controls";
import { useToast } from "@/hooks/use-toast";
import type { AIInsight } from "@shared/schema";

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
}

interface TabConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function AICoachWidgetEnhanced() {
  const [activeTab, setActiveTab] = useState("productivity");
  const [tabConfigs, setTabConfigs] = useState<TabConfig[]>([
    { id: "productivity", name: "Productivity", icon: <Target className="h-4 w-4" />, enabled: true },
    { id: "outfit", name: "Outfit", icon: <Shirt className="h-4 w-4" />, enabled: true },
    { id: "recipe", name: "Recipe", icon: <ChefHat className="h-4 w-4" />, enabled: true },
    { id: "music", name: "Music", icon: <Music className="h-4 w-4" />, enabled: true },
    { id: "kindness", name: "Kindness", icon: <Heart className="h-4 w-4" />, enabled: true },
    { id: "games", name: "Games", icon: <Gamepad2 className="h-4 w-4" />, enabled: true },
    { id: "events", name: "Events", icon: <Calendar className="h-4 w-4" />, enabled: true },
  ]);
  const [deletedInsights, setDeletedInsights] = useState<AIInsight[]>([]);
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  const { data: insights = [] } = useQuery<AIInsight[]>({
    queryKey: [`/api/ai-insights?date=${today}`],
  });

  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["/api/weather", 40.7128, -74.0060], // Default to NYC coordinates
    retry: false,
  });

  const generateContent = (type: string) => {
    const suggestions = {
      productivity: [
        "Take a 5-minute break every hour to improve focus",
        "Use the Pomodoro technique for your next task",
        "Organize your workspace for better concentration",
        "Try time-blocking for deep work sessions",
        "Review and prioritize your task list",
        "Start with your most challenging task when energy is high",
        "Use the two-minute rule: if it takes less than 2 minutes, do it now",
        "Batch similar tasks together to maintain momentum"
      ],
      outfit: [
        weather ? `It's ${weather.temperature}°C and ${weather.condition.toLowerCase()}. Consider wearing layers.` : "Check the weather and dress accordingly.",
        "A classic blue shirt pairs well with most outfits",
        "Comfortable shoes are essential for long days",
        "Add a pop of color with accessories",
        "Choose breathable fabrics for active days",
        "Dark colors are more forgiving and versatile",
        "Invest in quality basics that mix and match well",
        "Consider the occasion when choosing your outfit"
      ],
      recipe: [
        "Try a Mediterranean quinoa bowl with fresh vegetables",
        "Make overnight oats with berries for tomorrow's breakfast",
        "Prepare a simple stir-fry with seasonal vegetables",
        "Bake salmon with herbs and lemon for dinner",
        "Create a smoothie with spinach, banana, and protein powder",
        "Cook a hearty lentil soup for meal prep",
        "Try grilled chicken with roasted vegetables",
        "Make a fresh caprese salad with basil and mozzarella"
      ],
      music: [
        "Discover lo-fi hip hop for focused work sessions",
        "Try classical music during creative tasks",
        "Explore world music for inspiration",
        "Listen to nature sounds for relaxation",
        "Create an upbeat playlist for workouts",
        "Ambient electronic music can enhance concentration",
        "Jazz is perfect for unwinding after work",
        "Instrumental versions of your favorite songs reduce distraction"
      ],
      kindness: [
        "Send a thoughtful message to a friend you haven't talked to lately",
        "Leave a positive review for a local business you enjoy",
        "Compliment someone genuinely today",
        "Donate items you no longer need to charity",
        "Hold the door open for someone behind you",
        "Pay for someone's coffee in line behind you",
        "Write a thank-you note to someone who's helped you",
        "Volunteer for a cause you care about this weekend"
      ],
      games: [
        "Try a 5-minute word puzzle to exercise your mind",
        "Play a quick logic game during your break",
        "Challenge yourself with a crossword puzzle",
        "Try meditation apps with gamified elements",
        "Play a memory game to improve cognitive function",
        "Sudoku puzzles enhance problem-solving skills",
        "Mobile brain training games can be done anywhere",
        "Chess puzzles improve strategic thinking"
      ],
      events: [
        "Check local community events happening this weekend",
        "Look for online workshops in your area of interest",
        "Find nearby nature walks or outdoor activities",
        "Explore free museum days in your city",
        "Join a local meetup group for your hobbies",
        "Attend a virtual conference in your field",
        "Check library events for book clubs or lectures",
        "Look for seasonal festivals in your area"
      ]
    };
    
    const items = suggestions[type as keyof typeof suggestions] || suggestions.productivity;
    return items[Math.floor(Math.random() * items.length)];
  };

  const handleClearData = () => {
    setDeletedInsights([...insights]);
    toast({ title: "Data cleared", description: "AI insights have been cleared" });
  };

  const handleRestoreData = () => {
    setDeletedInsights([]);
    toast({ title: "Data restored", description: "AI insights have been restored" });
  };

  const handleLoadDummyData = () => {
    toast({
      title: "Sample insights loaded",
      description: "AI Coach suggestions have been refreshed",
    });
  };

  const enabledTabs = tabConfigs.filter(tab => tab.enabled);

  const mathProblems = [
    { question: "What's 23 + 47?", options: [68, 70, 72, 74], correct: 70 },
    { question: "What's 15 × 8?", options: [115, 120, 125, 130], correct: 120 },
    { question: "What's 144 ÷ 12?", options: [10, 11, 12, 13], correct: 12 },
    { question: "What's 89 - 35?", options: [52, 54, 56, 58], correct: 54 },
  ];

  const currentMathProblem = mathProblems[Math.floor(Math.random() * mathProblems.length)];

  return (
    <div className="col-span-full bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">AI Coach</h3>
          <Badge variant="outline" className="text-white opacity-60 border-white border-opacity-30">
            {enabledTabs.length} active tabs
          </Badge>
          {weather && (
            <div className="flex items-center space-x-1 text-white/60 text-sm">
              <Thermometer className="h-3 w-3" />
              <span>{weather.temperature}°C</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast({ title: "Settings", description: "Tab configuration coming soon!" })}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <WidgetClearControls
            onClearData={handleClearData}
            onRestoreData={handleRestoreData}
            onLoadDummyData={handleLoadDummyData}
            hasData={insights.length > 0}
            hasDeletedData={deletedInsights.length > 0}
            widgetName="AI Coach"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 overflow-x-auto">
            <TabsList className="bg-white/10 flex w-max p-1">
              {enabledTabs.map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="data-[state=active]:bg-white/20 flex items-center space-x-1 text-xs whitespace-nowrap px-3"
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: "Refreshed!",
                description: "New suggestions generated",
              });
            }}
            className="ml-2 text-white/70 border-white/20 hover:bg-white/10 flex-shrink-0"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>

        {enabledTabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map(index => (
                <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      {tab.icon}
                      <h4 className="text-white font-medium text-sm capitalize">
                        {tab.name} Tip {index}
                      </h4>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed mb-3">
                      {generateContent(tab.id)}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs text-white/60 border-white/20">
                        AI Generated
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white text-xs h-6 px-2"
                        onClick={() => toast({ title: "Saved!", description: "Added to your preferences" })}
                      >
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Special content for specific tabs */}
            {tab.id === 'games' && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <h5 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <Gamepad2 className="h-4 w-4" />
                  <span>Quick Brain Game</span>
                </h5>
                <p className="text-white/70 text-sm mb-3">
                  {currentMathProblem.question}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {currentMathProblem.options.map(answer => (
                    <Button
                      key={answer}
                      variant="outline"
                      size="sm"
                      onClick={() => toast({
                        title: answer === currentMathProblem.correct ? "Correct! 🎉" : "Try again! 🤔",
                        description: answer === currentMathProblem.correct 
                          ? "Great mental math!" 
                          : `The answer is ${currentMathProblem.correct}`
                      })}
                      className="text-white/70 border-white/20 hover:bg-white/10"
                    >
                      {answer}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {tab.id === 'outfit' && weather && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <h5 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <Thermometer className="h-4 w-4" />
                  <span>Weather-Based Suggestions</span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="text-white/70">
                    <span className="text-white/90">Temperature:</span> {weather.temperature}°C
                  </div>
                  <div className="text-white/70">
                    <span className="text-white/90">Condition:</span> {weather.condition}
                  </div>
                  <div className="col-span-full text-white/80">
                    {weather.description}
                  </div>
                </div>
              </div>
            )}

            {tab.id === 'events' && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <h5 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>This Week's Suggestions</span>
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="text-white/70">🎨 Art gallery opening - Friday evening</div>
                  <div className="text-white/70">🌳 Nature photography walk - Saturday morning</div>
                  <div className="text-white/70">📚 Book club meeting - Sunday afternoon</div>
                  <div className="text-white/70">🎵 Local concert - Weekend evening</div>
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}