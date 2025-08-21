import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Plus, Calendar, Target, Edit, Trash2, Play, Pause } from "lucide-react";
import WidgetClearControls from "@/components/widget-clear-controls";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, addMinutes, isWithinInterval, startOfDay, endOfDay } from "date-fns";

interface TimeBlock {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  category: string;
  color: string;
  isCompleted: boolean;
  isActive: boolean; // Currently running
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
}

const CATEGORY_COLORS = {
  'Deep Work': 'bg-blue-500',
  'Meetings': 'bg-green-500',
  'Learning': 'bg-purple-500',
  'Creative': 'bg-pink-500',
  'Admin': 'bg-yellow-500',
  'Break': 'bg-gray-500',
  'Exercise': 'bg-red-500',
  'Personal': 'bg-indigo-500',
};

export default function TimeBlockingWidget() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [deletedBlocks, setDeletedBlocks] = useState<TimeBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newBlock, setNewBlock] = useState({
    title: "",
    description: "",
    startTime: format(new Date(), 'HH:mm'),
    duration: 60,
    category: "Deep Work",
  });
  const { toast } = useToast();

  const { data: timeBlocks = [], isLoading } = useQuery<TimeBlock[]>({
    queryKey: ["/api/time-blocks", selectedDate],
  });

  const createBlockMutation = useMutation({
    mutationFn: (data: Omit<TimeBlock, 'id' | 'userId' | 'createdAt'>) => 
      apiRequest("POST", "/api/time-blocks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
      setShowAddDialog(false);
      setNewBlock({
        title: "",
        description: "",
        startTime: format(new Date(), 'HH:mm'),
        duration: 60,
        category: "Deep Work",
      });
      toast({ title: "Time block created!", description: "Your focus session has been scheduled." });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TimeBlock> }) => 
      apiRequest("PATCH", `/api/time-blocks/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
      setEditingBlock(null);
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/time-blocks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks"] });
    },
  });

  const handleAddBlock = () => {
    if (!newBlock.title.trim()) {
      toast({ title: "Title required", description: "Please enter a title for your time block.", variant: "destructive" });
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${newBlock.startTime}:00`);
    const endDateTime = addMinutes(startDateTime, newBlock.duration);

    createBlockMutation.mutate({
      title: newBlock.title.trim(),
      description: newBlock.description,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      category: newBlock.category,
      color: CATEGORY_COLORS[newBlock.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500',
      isCompleted: false,
      isActive: false,
    });
  };

  const startBlock = (block: TimeBlock) => {
    updateBlockMutation.mutate({
      id: block.id,
      updates: { 
        isActive: true, 
        actualStartTime: new Date().toISOString() 
      },
    });
    toast({ title: "Timer started!", description: `Started working on "${block.title}"` });
  };

  const stopBlock = (block: TimeBlock) => {
    updateBlockMutation.mutate({
      id: block.id,
      updates: { 
        isActive: false, 
        actualEndTime: new Date().toISOString(),
        isCompleted: true
      },
    });
    toast({ title: "Great work!", description: `Completed "${block.title}"` });
  };

  const getBlockDuration = (block: TimeBlock) => {
    const start = parseISO(block.startTime);
    const end = parseISO(block.endTime);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const isCurrentBlock = (block: TimeBlock) => {
    const now = new Date();
    const start = parseISO(block.startTime);
    const end = parseISO(block.endTime);
    return isWithinInterval(now, { start, end });
  };

  const sortedBlocks = timeBlocks
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleClearData = () => {
    setDeletedBlocks([...timeBlocks]);
    timeBlocks.forEach(block => {
      deleteBlockMutation.mutate(block.id);
    });
  };

  const handleRestoreData = () => {
    deletedBlocks.forEach(block => {
      createBlockMutation.mutate({
        title: block.title,
        description: block.description,
        startTime: block.startTime,
        endTime: block.endTime,
        category: block.category,
        color: block.color,
        isCompleted: false,
        isActive: false,
      });
    });
    setDeletedBlocks([]);
  };

  const handleLoadDummyData = () => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    
    const dummyBlocks = [
      {
        title: "Deep Work Session",
        description: "Focus on the main project tasks",
        startTime: new Date(`${today}T09:00:00`).toISOString(),
        endTime: new Date(`${today}T11:00:00`).toISOString(),
        category: "Deep Work",
        color: CATEGORY_COLORS["Deep Work"],
        isCompleted: false,
        isActive: false,
      },
      {
        title: "Team Standup",
        description: "Daily sync with the team",
        startTime: new Date(`${today}T11:30:00`).toISOString(),
        endTime: new Date(`${today}T12:00:00`).toISOString(),
        category: "Meetings",
        color: CATEGORY_COLORS["Meetings"],
        isCompleted: false,
        isActive: false,
      },
      {
        title: "Learning Time",
        description: "Study new technologies",
        startTime: new Date(`${today}T14:00:00`).toISOString(),
        endTime: new Date(`${today}T15:30:00`).toISOString(),
        category: "Learning",
        color: CATEGORY_COLORS["Learning"],
        isCompleted: false,
        isActive: false,
      }
    ];

    dummyBlocks.forEach(block => {
      createBlockMutation.mutate(block);
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white bg-opacity-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedCount = timeBlocks.filter(block => block.isCompleted).length;
  const activeBlock = timeBlocks.find(block => block.isActive);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Time Blocking</h3>
          <Badge variant="outline" className="text-white opacity-60 border-white border-opacity-30">
            {completedCount}/{timeBlocks.length} completed
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
          />
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Schedule Time Block</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="What will you focus on?"
                  value={newBlock.title}
                  onChange={(e) => setNewBlock(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newBlock.description}
                  onChange={(e) => setNewBlock(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-white text-sm opacity-80 mb-2 block">Start Time</label>
                    <Input
                      type="time"
                      value={newBlock.startTime}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, startTime: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm opacity-80 mb-2 block">Duration (min)</label>
                    <Input
                      type="number"
                      value={newBlock.duration}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm opacity-80 mb-2 block">Category</label>
                    <select
                      value={newBlock.category}
                      onChange={(e) => setNewBlock(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                    >
                      {Object.keys(CATEGORY_COLORS).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button onClick={handleAddBlock} className="w-full bg-zen-sage hover:bg-zen-sage/80 text-white">
                  Schedule Block
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <WidgetClearControls
            onClearData={handleClearData}
            onRestoreData={handleRestoreData}
            onLoadDummyData={handleLoadDummyData}
            hasData={timeBlocks.length > 0}
            hasDeletedData={deletedBlocks.length > 0}
            widgetName="Time Blocks"
          />
        </div>
      </div>

      {activeBlock && (
        <Card className="mb-4 bg-green-500/20 border-green-400/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Currently Active</h4>
                <p className="text-white/80 text-sm">{activeBlock.title}</p>
              </div>
              <Button
                onClick={() => stopBlock(activeBlock)}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <Pause className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {sortedBlocks.map((block) => {
          const isCurrent = isCurrentBlock(block);
          
          return (
            <Card key={block.id} className={`bg-white/5 border-white/10 hover:bg-white/10 transition-colors ${isCurrent ? 'ring-2 ring-yellow-400/50' : ''}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${block.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium text-sm">{block.title}</h4>
                        {block.isCompleted && (
                          <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                            Completed
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/30">
                            Now
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-white/60">
                        <span>{format(parseISO(block.startTime), 'HH:mm')}</span>
                        <span>-</span>
                        <span>{format(parseISO(block.endTime), 'HH:mm')}</span>
                        <span>({getBlockDuration(block)})</span>
                        <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                          {block.category}
                        </Badge>
                      </div>
                      {block.description && (
                        <p className="text-xs text-white/50 mt-1">{block.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!block.isActive && !block.isCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startBlock(block)}
                        className="text-white/60 hover:text-green-400 hover:bg-white/10 h-6 w-6 p-0"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBlock(block)}
                      className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBlockMutation.mutate(block.id)}
                      className="text-white/60 hover:text-red-400 hover:bg-white/10 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {timeBlocks.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-white opacity-40 mx-auto mb-3" />
            <p className="text-white opacity-60 text-sm">
              No time blocks scheduled for {format(parseISO(selectedDate + 'T00:00:00'), 'MMM d, yyyy')}.
            </p>
            <p className="text-white opacity-40 text-xs mt-1">
              Click the + button to schedule your first focus session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}