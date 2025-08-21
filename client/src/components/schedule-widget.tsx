import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, X, Clock, Settings, RefreshCw, Link, CheckCircle, AlertCircle } from "lucide-react";
import WidgetClearControls from "@/components/widget-clear-controls";
import { useToast } from "@/hooks/use-toast";
import type { ScheduleEvent } from "@shared/schema";

interface CalendarConnection {
  id: string;
  type: 'google' | 'outlook' | 'apple' | 'caldav';
  name: string;
  email?: string;
  isConnected: boolean;
  lastSync?: string;
  syncEnabled: boolean;
}

export default function ScheduleWidget() {
  const [newEvent, setNewEvent] = useState({ title: "", time: "" });
  const [showCalendarSync, setShowCalendarSync] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [deletedEvents, setDeletedEvents] = useState<ScheduleEvent[]>([]);
  const [connections, setConnections] = useState<CalendarConnection[]>([
    {
      id: 'google-1',
      type: 'google',
      name: 'Google Calendar',
      email: 'user@gmail.com',
      isConnected: false,
      syncEnabled: true,
    },
    {
      id: 'outlook-1',
      type: 'outlook',
      name: 'Outlook Calendar',
      email: 'user@outlook.com',
      isConnected: false,
      syncEnabled: true,
    },
    {
      id: 'apple-1',
      type: 'apple',
      name: 'Apple Calendar',
      isConnected: false,
      syncEnabled: true,
    },
  ]);
  const { toast } = useToast();
  
  const today = new Date().toISOString().split('T')[0];

  const { data: events = [], isLoading } = useQuery<ScheduleEvent[]>({
    queryKey: [`/api/schedule?date=${today}`],
  });

  const createEventMutation = useMutation({
    mutationFn: (data: { title: string; time: string; date: string }) => 
      apiRequest("POST", "/api/schedule", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/schedule?date=${today}`] });
      setNewEvent({ title: "", time: "" });
      setShowEventDialog(false);
      toast({ title: "Event added", description: "Your event has been added to the schedule" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ScheduleEvent> }) => 
      apiRequest("PATCH", `/api/schedule/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/schedule?date=${today}`] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/schedule/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/schedule?date=${today}`] });
    },
  });

  const handleAddEvent = () => {
    if (newEvent.title.trim() && newEvent.time.trim()) {
      createEventMutation.mutate({
        title: newEvent.title.trim(),
        time: newEvent.time.trim(),
        date: today,
      });
    }
  };

  const toggleEventCompletion = (event: ScheduleEvent) => {
    updateEventMutation.mutate({
      id: event.id,
      updates: { completed: !event.completed },
    });
  };

  const deleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    if (eventToDelete) {
      setDeletedEvents(prev => [...prev, eventToDelete]);
    }
    deleteEventMutation.mutate(id);
  };

  const handleConnectCalendar = (connectionId: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, isConnected: !conn.isConnected, lastSync: new Date().toISOString() }
        : conn
    ));
    
    const connection = connections.find(c => c.id === connectionId);
    toast({
      title: connection?.isConnected ? "Calendar disconnected" : "Calendar connected!",
      description: connection?.isConnected 
        ? "Calendar sync has been disabled"
        : `Successfully connected to ${connection?.name}`,
    });
  };

  const handleSyncNow = () => {
    const connectedCalendars = connections.filter(c => c.isConnected);
    if (connectedCalendars.length === 0) {
      toast({
        title: "No calendars connected",
        description: "Connect a calendar first to enable sync",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Syncing calendars...",
      description: `Syncing with ${connectedCalendars.length} connected calendar(s)`,
    });

    // Simulate sync delay
    setTimeout(() => {
      setConnections(prev => prev.map(conn => 
        conn.isConnected 
          ? { ...conn, lastSync: new Date().toISOString() }
          : conn
      ));
      
      toast({
        title: "Sync complete!",
        description: "Your calendars have been synchronized",
      });
    }, 2000);
  };

  const handleClearData = () => {
    setDeletedEvents([...events]);
    events.forEach(event => {
      deleteEventMutation.mutate(event.id);
    });
  };

  const handleRestoreData = () => {
    deletedEvents.forEach(event => {
      createEventMutation.mutate({
        title: event.title,
        time: event.time,
        date: event.date,
      });
    });
    setDeletedEvents([]);
  };

  const handleLoadDummyData = () => {
    const dummyEvents = [
      { title: "Morning standup", time: "09:00", date: today },
      { title: "Project review", time: "14:00", date: today },
      { title: "Gym workout", time: "18:00", date: today },
    ];

    dummyEvents.forEach(event => {
      createEventMutation.mutate(event);
    });
  };

  const completedCount = events.filter(event => event.completed).length;
  const connectedCount = connections.filter(c => c.isConnected).length;

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-white bg-opacity-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Today's Schedule</h3>
          <Badge variant="outline" className="text-white opacity-60 border-white border-opacity-30">
            {completedCount}/{events.length}
          </Badge>
          {connectedCount > 0 && (
            <Badge variant="outline" className="text-green-400 border-green-400/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              {connectedCount} synced
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showCalendarSync} onOpenChange={setShowCalendarSync}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Link className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Calendar Sync</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="connect" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger value="connect" className="data-[state=active]:bg-white/20">Connect</TabsTrigger>
                  <TabsTrigger value="sync" className="data-[state=active]:bg-white/20">Sync</TabsTrigger>
                </TabsList>
                
                <TabsContent value="connect" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {connections.map(connection => (
                      <Card key={connection.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${connection.isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
                              <div>
                                <div className="text-white font-medium text-sm">{connection.name}</div>
                                {connection.email && (
                                  <div className="text-white/60 text-xs">{connection.email}</div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant={connection.isConnected ? "destructive" : "default"}
                              size="sm"
                              onClick={() => handleConnectCalendar(connection.id)}
                              className="text-xs"
                            >
                              {connection.isConnected ? "Disconnect" : "Connect"}
                            </Button>
                          </div>
                          {connection.lastSync && connection.isConnected && (
                            <div className="mt-2 text-xs text-white/60">
                              Last sync: {new Date(connection.lastSync).toLocaleTimeString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="sync" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <Button
                      onClick={handleSyncNow}
                      className="w-full bg-zen-sage hover:bg-zen-sage/80 text-white"
                      disabled={connectedCount === 0}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                    
                    <div className="space-y-2">
                      <h4 className="text-white font-medium text-sm">Sync Status</h4>
                      {connections.filter(c => c.isConnected).map(connection => (
                        <div key={connection.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/80">{connection.name}</span>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            <span className="text-green-400 text-xs">Active</span>
                          </div>
                        </div>
                      ))}
                      
                      {connectedCount === 0 && (
                        <div className="flex items-center space-x-2 text-sm text-white/60">
                          <AlertCircle className="h-4 w-4" />
                          <span>No calendars connected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
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
                <DialogTitle className="text-white">Add New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
                <Button onClick={handleAddEvent} className="w-full bg-zen-sage hover:bg-zen-sage/80 text-white">
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <WidgetClearControls
            onClearData={handleClearData}
            onRestoreData={handleRestoreData}
            onLoadDummyData={handleLoadDummyData}
            hasData={events.length > 0}
            hasDeletedData={deletedEvents.length > 0}
            widgetName="Schedule"
          />
        </div>
      </div>

      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="flex items-center space-x-3 group">
            <Checkbox
              checked={event.completed}
              onCheckedChange={() => toggleEventCompletion(event)}
              className="w-4 h-4 border-white border-opacity-50 data-[state=checked]:bg-zen-sage data-[state=checked]:border-zen-sage"
            />
            <div className="flex-1">
              <div className={`text-sm ${
                event.completed 
                  ? "text-white opacity-60 line-through" 
                  : "text-white opacity-90"
              }`}>
                {event.title}
              </div>
              <div className="flex items-center space-x-2 text-xs text-white opacity-60">
                <Clock className="h-3 w-3" />
                <span>{event.time}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 text-white hover:text-red-400 transition-all duration-300 p-1 h-auto"
              onClick={() => deleteEvent(event.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-white opacity-40 mx-auto mb-3" />
            <p className="text-white opacity-60 text-sm">
              No events scheduled for today
            </p>
            <p className="text-white opacity-40 text-xs mt-1">
              Click + to add your first event
            </p>
          </div>
        )}
      </div>

      {connectedCount > 0 && (
        <div className="pt-3 border-t border-white/20">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Synced with {connectedCount} calendar(s)</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSyncNow}
              className="text-white/60 hover:text-white h-6 px-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}