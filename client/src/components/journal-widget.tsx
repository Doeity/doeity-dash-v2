import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BookOpen, TrendingUp, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subDays, addDays } from "date-fns";
import WidgetClearControls from "@/components/widget-clear-controls";

interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  content: string;
  mood: number; // 1-5 scale
  gratitude: string[];
  highlights: string;
  challenges: string;
  createdAt: string;
}

export default function JournalWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [journalContent, setJournalContent] = useState("");
  const [mood, setMood] = useState(3);
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [highlights, setHighlights] = useState("");
  const [challenges, setChallenges] = useState("");
  const [deletedEntries, setDeletedEntries] = useState<JournalEntry[]>([]);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const currentEntry = entries.find(entry => entry.date === dateStr);

  useEffect(() => {
    if (currentEntry) {
      setJournalContent(currentEntry.content);
      setMood(currentEntry.mood);
      setGratitude(currentEntry.gratitude.length >= 3 ? currentEntry.gratitude : ["", "", ""]);
      setHighlights(currentEntry.highlights);
      setChallenges(currentEntry.challenges);
    } else {
      setJournalContent("");
      setMood(3);
      setGratitude(["", "", ""]);
      setHighlights("");
      setChallenges("");
    }
  }, [currentEntry]);

  const createEntryMutation = useMutation({
    mutationFn: (data: Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>) => 
      apiRequest("POST", "/api/journal-entries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<JournalEntry>) => 
      apiRequest("PATCH", `/api/journal-entries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/journal-entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
    },
  });

  const saveEntry = () => {
    const entryData = {
      date: dateStr,
      content: journalContent,
      mood,
      gratitude: gratitude.filter(g => g.trim()),
      highlights,
      challenges,
    };

    if (currentEntry) {
      updateEntryMutation.mutate({ id: currentEntry.id, ...entryData });
    } else {
      createEntryMutation.mutate(entryData);
    }
  };

  const handleClearData = () => {
    setDeletedEntries([...entries]);
    entries.forEach(entry => {
      deleteEntryMutation.mutate(entry.id);
    });
  };

  const handleRestoreData = () => {
    deletedEntries.forEach(entry => {
      createEntryMutation.mutate({
        date: entry.date,
        content: entry.content,
        mood: entry.mood,
        gratitude: entry.gratitude,
        highlights: entry.highlights,
        challenges: entry.challenges,
      });
    });
    setDeletedEntries([]);
  };

  const handleLoadDummyData = () => {
    const dummyEntries = [
      {
        date: format(new Date(), 'yyyy-MM-dd'),
        content: "Today was a productive day. I completed several important tasks and felt a sense of accomplishment.",
        mood: 4,
        gratitude: ["Good health", "Supportive family", "Beautiful weather"],
        highlights: "Finished the project presentation",
        challenges: "Time management with multiple deadlines",
      },
      {
        date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        content: "Reflecting on yesterday's experiences and planning for tomorrow.",
        mood: 3,
        gratitude: ["Learning opportunities", "Peaceful evening", "Good friends"],
        highlights: "Had a great conversation with a friend",
        challenges: "Dealing with unexpected changes",
      }
    ];

    dummyEntries.forEach(entry => {
      createEntryMutation.mutate(entry);
    });
  };

  const moodEmojis = ["😢", "😕", "😐", "😊", "😄"];
  const moodLabels = ["Very Low", "Low", "Neutral", "Good", "Excellent"];

  const getStreakCount = () => {
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let currentDate = new Date();
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Daily Journal</h3>
          <span className="text-xs text-white opacity-60 bg-white bg-opacity-20 px-2 py-1 rounded-full">
            {getStreakCount()} day streak
          </span>
        </div>
        <WidgetClearControls
          onClearData={handleClearData}
          onRestoreData={handleRestoreData}
          onLoadDummyData={handleLoadDummyData}
          hasData={entries.length > 0}
          hasDeletedData={deletedEntries.length > 0}
          widgetName="Journal"
        />
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentDate(subDays(currentDate, 1))}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-white text-center">
          <div className="font-medium">{format(currentDate, 'EEEE')}</div>
          <div className="text-sm opacity-70">{format(currentDate, 'MMM d, yyyy')}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          disabled={format(currentDate, 'yyyy-MM-dd') >= format(new Date(), 'yyyy-MM-dd')}
          className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="entry" className="data-[state=active]:bg-white/20">Entry</TabsTrigger>
          <TabsTrigger value="mood" className="data-[state=active]:bg-white/20">Mood</TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-white/20">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-4">
          <Textarea
            placeholder="How was your day? What are you thinking about?"
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            className="w-full h-32 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-1 focus:ring-zen-sage transition-all duration-300 resize-none"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm opacity-80 mb-2 block">Highlights</label>
              <Textarea
                placeholder="What went well today?"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                className="w-full h-20 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-1 focus:ring-zen-sage transition-all duration-300 resize-none"
              />
            </div>
            <div>
              <label className="text-white text-sm opacity-80 mb-2 block">Challenges</label>
              <Textarea
                placeholder="What was difficult?"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                className="w-full h-20 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-1 focus:ring-zen-sage transition-all duration-300 resize-none"
              />
            </div>
          </div>
          
          <Button
            onClick={saveEntry}
            className="w-full bg-zen-sage hover:bg-zen-sage/80 text-white"
            disabled={!journalContent.trim()}
          >
            Save Entry
          </Button>
        </TabsContent>

        <TabsContent value="mood" className="space-y-4">
          <div>
            <label className="text-white text-sm opacity-80 mb-3 block">How are you feeling today?</label>
            <div className="flex items-center justify-between mb-4">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setMood(index + 1)}
                  className={`text-2xl p-2 rounded-lg transition-all duration-200 ${
                    mood === index + 1 
                      ? 'bg-white/20 scale-110' 
                      : 'hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="text-center text-white text-sm opacity-70">
              {moodLabels[mood - 1]}
            </div>
          </div>

          <div>
            <label className="text-white text-sm opacity-80 mb-3 block">Three things I'm grateful for:</label>
            <div className="space-y-2">
              {gratitude.map((item, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Gratitude ${index + 1}...`}
                  value={item}
                  onChange={(e) => {
                    const newGratitude = [...gratitude];
                    newGratitude[index] = e.target.value;
                    setGratitude(newGratitude);
                  }}
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-1 focus:ring-zen-sage transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="text-white text-sm opacity-80 mb-1">Average Mood</div>
                <div className="text-2xl text-white">
                  {entries.length > 0 
                    ? (entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length).toFixed(1)
                    : "0.0"
                  }
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="text-white text-sm opacity-80 mb-1">Total Entries</div>
                <div className="text-2xl text-white">{entries.length}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-white text-sm opacity-70">
            <p className="mb-2">Recent mood trends:</p>
            <div className="flex space-x-1">
              {entries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 7)
                .map((entry, index) => (
                  <div
                    key={entry.id}
                    className="text-lg"
                    title={`${entry.date}: ${moodLabels[entry.mood - 1]}`}
                  >
                    {moodEmojis[entry.mood - 1]}
                  </div>
                ))
              }
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}