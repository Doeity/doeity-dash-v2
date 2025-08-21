import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Link, RefreshCw, Settings, AlertCircle, CheckCircle, Clock, ExternalLink } from "lucide-react";
import WidgetClearControls from "@/components/widget-clear-controls";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns";

interface CalendarConnection {
  id: string;
  provider: 'google' | 'outlook' | 'apple' | 'caldav';
  accountName: string;
  isConnected: boolean;
  lastSync?: string;
  syncStatus: 'connected' | 'error' | 'syncing' | 'disconnected';
  eventsCount: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  provider: string;
  calendarName: string;
  isAllDay: boolean;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export default function CalendarSyncWidget() {
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'outlook' | 'apple' | 'caldav'>('google');
  const [deletedConnections, setDeletedConnections] = useState<CalendarConnection[]>([]);
  const { toast } = useToast();

  const { data: connections = [], isLoading: connectionsLoading } = useQuery<CalendarConnection[]>({
    queryKey: ["/api/calendar-connections"],
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar-events"],
  });

  const connectCalendarMutation = useMutation({
    mutationFn: (data: { provider: string; accountName: string }) => 
      apiRequest("POST", "/api/calendar-connections", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-connections"] });
      setShowConnectionDialog(false);
      toast({ title: "Calendar connected!", description: "Your calendar is now syncing." });
    },
  });

  const syncCalendarMutation = useMutation({
    mutationFn: (connectionId: string) => 
      apiRequest("POST", `/api/calendar-connections/${connectionId}/sync`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
      toast({ title: "Sync complete!", description: "Your events have been updated." });
    },
  });

  const disconnectCalendarMutation = useMutation({
    mutationFn: (connectionId: string) => 
      apiRequest("DELETE", `/api/calendar-connections/${connectionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
    },
  });

  const handleConnect = () => {
    // In a real implementation, this would initiate OAuth flow
    const mockAccountName = selectedProvider === 'google' ? 'Gmail Account' : 
                           selectedProvider === 'outlook' ? 'Outlook Account' : 
                           selectedProvider === 'apple' ? 'iCloud Account' : 'CalDAV Server';
    
    connectCalendarMutation.mutate({
      provider: selectedProvider,
      accountName: mockAccountName,
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google': return '📅';
      case 'outlook': return '📧';
      case 'apple': return '🍎';
      case 'caldav': return '🔗';
      default: return '📅';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'syncing': return 'text-yellow-400';
      case 'disconnected': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const groupEventsByTime = (events: CalendarEvent[]) => {
    const today = events.filter(event => isToday(parseISO(event.startTime)));
    const tomorrow = events.filter(event => isTomorrow(parseISO(event.startTime)));
    const thisWeek = events.filter(event => 
      isThisWeek(parseISO(event.startTime)) && 
      !isToday(parseISO(event.startTime)) && 
      !isTomorrow(parseISO(event.startTime))
    );
    const later = events.filter(event => 
      !isThisWeek(parseISO(event.startTime))
    );

    return { today, tomorrow, thisWeek, later };
  };

  const handleClearData = () => {
    setDeletedConnections([...connections]);
    connections.forEach(connection => {
      disconnectCalendarMutation.mutate(connection.id);
    });
  };

  const handleRestoreData = () => {
    deletedConnections.forEach(connection => {
      connectCalendarMutation.mutate({
        provider: connection.provider,
        accountName: connection.accountName,
      });
    });
    setDeletedConnections([]);
  };

  const handleLoadDummyData = () => {
    const dummyConnections = [
      { provider: 'google', accountName: 'work@gmail.com' },
      { provider: 'outlook', accountName: 'personal@outlook.com' },
    ];

    dummyConnections.forEach(connection => {
      connectCalendarMutation.mutate(connection);
    });
  };

  if (connectionsLoading || eventsLoading) {
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

  const connectedCount = connections.filter(c => c.isConnected).length;
  const groupedEvents = groupEventsByTime(events.slice(0, 10)); // Show next 10 events

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Calendar Sync</h3>
          <Badge variant="outline" className="text-white opacity-60 border-white border-opacity-30">
            {connectedCount} connected
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Link className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Connect Calendar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {(['google', 'outlook', 'apple', 'caldav'] as const).map(provider => (
                    <Card 
                      key={provider}
                      className={`cursor-pointer transition-colors ${
                        selectedProvider === provider 
                          ? 'bg-white/20 border-white/40' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedProvider(provider)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{getProviderIcon(provider)}</div>
                        <div className="text-white text-sm capitalize">{provider}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button onClick={handleConnect} className="w-full bg-zen-sage hover:bg-zen-sage/80 text-white">
                  Connect {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <WidgetClearControls
            onClearData={handleClearData}
            onRestoreData={handleRestoreData}
            onLoadDummyData={handleLoadDummyData}
            hasData={connections.length > 0}
            hasDeletedData={deletedConnections.length > 0}
            widgetName="Calendar Sync"
          />
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger value="events" className="data-[state=active]:bg-white/20">Events</TabsTrigger>
          <TabsTrigger value="connections" className="data-[state=active]:bg-white/20">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-3 max-h-60 overflow-y-auto">
          {Object.entries(groupedEvents).map(([timeGroup, groupEvents]) => {
            if (groupEvents.length === 0) return null;
            
            return (
              <div key={timeGroup}>
                <h4 className="text-white/80 text-sm font-medium mb-2 capitalize">
                  {timeGroup === 'thisWeek' ? 'This Week' : timeGroup}
                </h4>
                <div className="space-y-2">
                  {groupEvents.map(event => (
                    <Card key={event.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="text-white font-medium text-sm mb-1">{event.title}</h5>
                            <div className="flex items-center space-x-2 text-xs text-white/60 mb-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {event.isAllDay 
                                  ? 'All day' 
                                  : `${format(parseISO(event.startTime), 'HH:mm')} - ${format(parseISO(event.endTime), 'HH:mm')}`
                                }
                              </span>
                              <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                                {event.calendarName}
                              </Badge>
                            </div>
                            {event.location && (
                              <p className="text-xs text-white/50">📍 {event.location}</p>
                            )}
                            {event.description && (
                              <p className="text-xs text-white/40 mt-1 line-clamp-2">{event.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-white opacity-40 mx-auto mb-3" />
              <p className="text-white opacity-60 text-sm">
                No upcoming events found.
              </p>
              <p className="text-white opacity-40 text-xs mt-1">
                Connect your calendar to see events here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="connections" className="space-y-3">
          {connections.map(connection => (
            <Card key={connection.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getProviderIcon(connection.provider)}</span>
                    <div>
                      <h4 className="text-white font-medium text-sm">{connection.accountName}</h4>
                      <div className="flex items-center space-x-2 text-xs text-white/60">
                        <span className={getStatusColor(connection.syncStatus)}>{getStatusIcon(connection.syncStatus)}</span>
                        <span className="capitalize">{connection.syncStatus}</span>
                        {connection.lastSync && (
                          <span>• Last sync: {format(parseISO(connection.lastSync), 'MMM d, HH:mm')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                      {connection.eventsCount} events
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => syncCalendarMutation.mutate(connection.id)}
                      disabled={connection.syncStatus === 'syncing'}
                      className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                    >
                      <RefreshCw className={`h-3 w-3 ${connection.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => disconnectCalendarMutation.mutate(connection.id)}
                      className="text-white/60 hover:text-red-400 hover:bg-white/10 h-6 w-6 p-0"
                    >
                      <AlertCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {connections.length === 0 && (
            <div className="text-center py-8">
              <Link className="h-12 w-12 text-white opacity-40 mx-auto mb-3" />
              <p className="text-white opacity-60 text-sm">
                No calendars connected yet.
              </p>
              <p className="text-white opacity-40 text-xs mt-1">
                Click the connect button to add your first calendar.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}