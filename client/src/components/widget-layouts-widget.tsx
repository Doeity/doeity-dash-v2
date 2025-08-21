import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, Save, Download, Upload, Grid, List, Columns, Eye, Edit, Trash2, Star } from "lucide-react";
import WidgetClearControls from "@/components/widget-clear-controls";
import { useToast } from "@/hooks/use-toast";

interface WidgetLayout {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isFavorite: boolean;
  layout: {
    gridCols: number;
    widgets: Array<{
      id: string;
      name: string;
      position: { row: number; col: number };
      size: { width: number; height: number };
      isVisible: boolean;
    }>;
  };
  createdAt: string;
  lastUsed?: string;
}

const DEFAULT_LAYOUTS: WidgetLayout[] = [
  {
    id: 'productivity-focus',
    name: 'Productivity Focus',
    description: 'Optimized for work and task management',
    isDefault: true,
    isFavorite: false,
    layout: {
      gridCols: 3,
      widgets: [
        { id: 'clock', name: 'Clock', position: { row: 0, col: 0 }, size: { width: 1, height: 1 }, isVisible: true },
        { id: 'tasks', name: 'Tasks', position: { row: 0, col: 1 }, size: { width: 1, height: 2 }, isVisible: true },
        { id: 'schedule', name: 'Schedule', position: { row: 0, col: 2 }, size: { width: 1, height: 2 }, isVisible: true },
        { id: 'pomodoro', name: 'Pomodoro', position: { row: 1, col: 0 }, size: { width: 1, height: 1 }, isVisible: true },
        { id: 'notes', name: 'Quick Notes', position: { row: 2, col: 0 }, size: { width: 3, height: 1 }, isVisible: true },
        { id: 'time-blocking', name: 'Time Blocking', position: { row: 3, col: 0 }, size: { width: 3, height: 2 }, isVisible: true },
      ],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wellness-mindful',
    name: 'Wellness & Mindful',
    description: 'Focused on health, habits, and mindfulness',
    isDefault: true,
    isFavorite: false,
    layout: {
      gridCols: 3,
      widgets: [
        { id: 'quote', name: 'Daily Quote', position: { row: 0, col: 0 }, size: { width: 2, height: 1 }, isVisible: true },
        { id: 'weather', name: 'Weather', position: { row: 0, col: 2 }, size: { width: 1, height: 1 }, isVisible: true },
        { id: 'habits', name: 'Habits', position: { row: 1, col: 0 }, size: { width: 1, height: 2 }, isVisible: true },
        { id: 'journal', name: 'Journal', position: { row: 1, col: 1 }, size: { width: 2, height: 2 }, isVisible: true },
        { id: 'photo', name: 'Daily Photo', position: { row: 3, col: 0 }, size: { width: 1, height: 1 }, isVisible: true },
        { id: 'meditation', name: 'Meditation', position: { row: 3, col: 1 }, size: { width: 1, height: 1 }, isVisible: true },
        { id: 'gratitude', name: 'Gratitude', position: { row: 3, col: 2 }, size: { width: 1, height: 1 }, isVisible: true },
      ],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comprehensive-all',
    name: 'Comprehensive View',
    description: 'All widgets in a balanced layout',
    isDefault: true,
    isFavorite: true,
    layout: {
      gridCols: 4,
      widgets: [
        { id: 'greeting', name: 'Personal Greeting', position: { row: 0, col: 0 }, size: { width: 2, height: 1 }, isVisible: true },
        { id: 'clock', name: 'Clock', position: { row: 0, col: 2 }, size: { width: 1, height: 1 }, isVisible: true },
        { id: 'weather', name: 'Weather', position: { row: 0, col: 3 }, size: { width: 1, height: 1 }, isVisible: true },
        { id: 'quote', name: 'Daily Quote', position: { row: 1, col: 0 }, size: { width: 4, height: 1 }, isVisible: true },
        { id: 'focus', name: 'Daily Focus', position: { row: 2, col: 0 }, size: { width: 2, height: 1 }, isVisible: true },
        { id: 'tasks', name: 'Tasks', position: { row: 2, col: 2 }, size: { width: 1, height: 2 }, isVisible: true },
        { id: 'habits', name: 'Habits', position: { row: 2, col: 3 }, size: { width: 1, height: 2 }, isVisible: true },
        { id: 'schedule', name: 'Schedule', position: { row: 3, col: 0 }, size: { width: 2, height: 1 }, isVisible: true },
        { id: 'notes', name: 'Quick Notes', position: { row: 4, col: 0 }, size: { width: 4, height: 1 }, isVisible: true },
        { id: 'ai-coach', name: 'AI Coach', position: { row: 5, col: 0 }, size: { width: 4, height: 2 }, isVisible: true },
      ],
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'minimal-clean',
    name: 'Minimal & Clean',
    description: 'Essential widgets only',
    isDefault: true,
    isFavorite: false,
    layout: {
      gridCols: 2,
      widgets: [
        { id: 'greeting', name: 'Personal Greeting', position: { row: 0, col: 0 }, size: { width: 1, height: 1 }, isVisible: true },
        { id: 'clock', name: 'Clock', position: { row: 0, col: 1 }, size: { width: 1, height: 1 }, isVisible: true },
        { id: 'quote', name: 'Daily Quote', position: { row: 1, col: 0 }, size: { width: 2, height: 1 }, isVisible: true },
        { id: 'focus', name: 'Daily Focus', position: { row: 2, col: 0 }, size: { width: 2, height: 1 }, isVisible: true },
        { id: 'tasks', name: 'Tasks', position: { row: 3, col: 0 }, size: { width: 1, height: 2 }, isVisible: true },
        { id: 'notes', name: 'Quick Notes', position: { row: 3, col: 1 }, size: { width: 1, height: 2 }, isVisible: true },
      ],
    },
    createdAt: new Date().toISOString(),
  },
];

export default function WidgetLayoutsWidget() {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState("");
  const [newLayoutDescription, setNewLayoutDescription] = useState("");
  const [importData, setImportData] = useState("");
  const [deletedLayouts, setDeletedLayouts] = useState<WidgetLayout[]>([]);
  const { toast } = useToast();

  const { data: layouts = DEFAULT_LAYOUTS } = useQuery<WidgetLayout[]>({
    queryKey: ["/api/widget-layouts"],
    initialData: DEFAULT_LAYOUTS,
  });

  const { data: currentLayout } = useQuery<string>({
    queryKey: ["/api/current-layout"],
    initialData: 'comprehensive-all',
  });

  const saveLayoutMutation = useMutation({
    mutationFn: (data: Omit<WidgetLayout, 'id' | 'createdAt'>) => 
      apiRequest("POST", "/api/widget-layouts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/widget-layouts"] });
      setShowSaveDialog(false);
      setNewLayoutName("");
      setNewLayoutDescription("");
      toast({ title: "Layout saved!", description: "Your custom layout has been saved." });
    },
  });

  const applyLayoutMutation = useMutation({
    mutationFn: (layoutId: string) => 
      apiRequest("POST", "/api/apply-layout", { layoutId }),
    onSuccess: (data, layoutId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/current-layout"] });
      const layout = layouts.find(l => l.id === layoutId);
      toast({ 
        title: "Layout applied!", 
        description: `Switched to ${layout?.name || 'selected layout'}` 
      });
    },
  });

  const deleteLayoutMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/widget-layouts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/widget-layouts"] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) => 
      apiRequest("PATCH", `/api/widget-layouts/${id}`, { isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/widget-layouts"] });
    },
  });

  const getCurrentLayoutData = () => {
    // In a real app, this would capture the current widget positions and visibility
    return {
      gridCols: 3,
      widgets: [
        { id: 'greeting', name: 'Personal Greeting', position: { row: 0, col: 0 }, size: { width: 2, height: 1 }, isVisible: true },
        { id: 'clock', name: 'Clock', position: { row: 0, col: 2 }, size: { width: 1, height: 1 }, isVisible: true },
        // ... other widgets
      ],
    };
  };

  const handleSaveCurrentLayout = () => {
    if (!newLayoutName.trim()) {
      toast({ title: "Name required", description: "Please enter a name for your layout.", variant: "destructive" });
      return;
    }

    saveLayoutMutation.mutate({
      name: newLayoutName.trim(),
      description: newLayoutDescription.trim() || undefined,
      isDefault: false,
      isFavorite: false,
      layout: getCurrentLayoutData(),
    });
  };

  const handleImportLayout = () => {
    try {
      const parsed = JSON.parse(importData);
      saveLayoutMutation.mutate({
        name: parsed.name || 'Imported Layout',
        description: parsed.description,
        isDefault: false,
        isFavorite: false,
        layout: parsed.layout,
      });
      setShowImportDialog(false);
      setImportData("");
    } catch (error) {
      toast({ title: "Import failed", description: "Invalid layout data format.", variant: "destructive" });
    }
  };

  const handleExportLayout = (layout: WidgetLayout) => {
    const exportData = {
      name: layout.name,
      description: layout.description,
      layout: layout.layout,
    };
    
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    toast({ title: "Layout copied!", description: "Layout data copied to clipboard." });
  };

  const getLayoutIcon = (layout: WidgetLayout) => {
    if (layout.layout.gridCols === 2) return <Columns className="h-4 w-4" />;
    if (layout.layout.gridCols === 4) return <Grid className="h-4 w-4" />;
    return <Layout className="h-4 w-4" />;
  };

  const handleClearData = () => {
    setDeletedLayouts(layouts.filter(l => !l.isDefault));
    layouts.filter(l => !l.isDefault).forEach(layout => {
      deleteLayoutMutation.mutate(layout.id);
    });
  };

  const handleRestoreData = () => {
    deletedLayouts.forEach(layout => {
      saveLayoutMutation.mutate({
        name: layout.name,
        description: layout.description,
        isDefault: false,
        isFavorite: layout.isFavorite,
        layout: layout.layout,
      });
    });
    setDeletedLayouts([]);
  };

  const handleLoadDummyData = () => {
    const dummyLayouts = [
      {
        name: "Mobile Optimized",
        description: "Single column layout for mobile devices",
        isDefault: false,
        isFavorite: false,
        layout: {
          gridCols: 1,
          widgets: [
            { id: 'clock', name: 'Clock', position: { row: 0, col: 0 }, size: { width: 1, height: 1 }, isVisible: true },
            { id: 'weather', name: 'Weather', position: { row: 1, col: 0 }, size: { width: 1, height: 1 }, isVisible: true },
            { id: 'tasks', name: 'Tasks', position: { row: 2, col: 0 }, size: { width: 1, height: 2 }, isVisible: true },
          ],
        },
      },
      {
        name: "Dashboard Pro",
        description: "Advanced layout with all premium widgets",
        isDefault: false,
        isFavorite: true,
        layout: {
          gridCols: 4,
          widgets: [
            { id: 'analytics', name: 'Analytics', position: { row: 0, col: 0 }, size: { width: 2, height: 2 }, isVisible: true },
            { id: 'charts', name: 'Performance Charts', position: { row: 0, col: 2 }, size: { width: 2, height: 2 }, isVisible: true },
          ],
        },
      }
    ];

    dummyLayouts.forEach(layout => {
      saveLayoutMutation.mutate(layout);
    });
  };

  const favoriteLayouts = layouts.filter(l => l.isFavorite);
  const customLayouts = layouts.filter(l => !l.isDefault);

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center space-x-2">
          <Layout className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Widget Layouts</h3>
          <Badge variant="outline" className="text-white opacity-60 border-white border-opacity-30">
            {layouts.length} saved
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Save className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Save Current Layout</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Layout name"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Input
                  placeholder="Description (optional)"
                  value={newLayoutDescription}
                  onChange={(e) => setNewLayoutDescription(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button onClick={handleSaveCurrentLayout} className="w-full bg-zen-sage hover:bg-zen-sage/80 text-white">
                  Save Layout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <WidgetClearControls
            onClearData={handleClearData}
            onRestoreData={handleRestoreData}
            onLoadDummyData={handleLoadDummyData}
            hasData={customLayouts.length > 0}
            hasDeletedData={deletedLayouts.length > 0}
            widgetName="Widget Layouts"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-white/20">All Layouts</TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-white/20">Favorites</TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-white/20">Manage</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2 max-h-60 overflow-y-auto">
          {layouts.map(layout => (
            <Card 
              key={layout.id} 
              className={`bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer ${
                currentLayout === layout.id ? 'ring-2 ring-zen-sage/50' : ''
              }`}
              onClick={() => applyLayoutMutation.mutate(layout.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getLayoutIcon(layout)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium text-sm">{layout.name}</h4>
                        {layout.isDefault && (
                          <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                            Default
                          </Badge>
                        )}
                        {currentLayout === layout.id && (
                          <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-white/60">
                        <span>{layout.layout.widgets.length} widgets</span>
                        <span>•</span>
                        <span>{layout.layout.gridCols} columns</span>
                        {layout.description && (
                          <>
                            <span>•</span>
                            <span>{layout.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMutation.mutate({ id: layout.id, isFavorite: !layout.isFavorite });
                      }}
                      className={`h-6 w-6 p-0 ${
                        layout.isFavorite 
                          ? 'text-yellow-400 hover:text-yellow-300' 
                          : 'text-white/60 hover:text-yellow-400'
                      }`}
                    >
                      <Star className={`h-3 w-3 ${layout.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportLayout(layout);
                      }}
                      className="text-white/60 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {!layout.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLayoutMutation.mutate(layout.id);
                        }}
                        className="text-white/60 hover:text-red-400 hover:bg-white/10 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-2">
          {favoriteLayouts.length > 0 ? (
            favoriteLayouts.map(layout => (
              <Card key={layout.id} className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm">{layout.name}</span>
                    </div>
                    <Button
                      onClick={() => applyLayoutMutation.mutate(layout.id)}
                      size="sm"
                      className="bg-zen-sage hover:bg-zen-sage/80 text-white"
                    >
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-white opacity-40 mx-auto mb-3" />
              <p className="text-white opacity-60 text-sm">
                No favorite layouts yet.
              </p>
              <p className="text-white opacity-40 text-xs mt-1">
                Star layouts to add them to favorites.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Upload className="h-8 w-8 text-white/60 mx-auto mb-2" />
                    <h4 className="text-white font-medium text-sm">Import Layout</h4>
                    <p className="text-xs text-white/50">From JSON data</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Import Layout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <textarea
                    placeholder="Paste layout JSON data here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full h-32 bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder:text-white/50 resize-none"
                  />
                  <Button onClick={handleImportLayout} className="w-full bg-zen-sage hover:bg-zen-sage/80 text-white">
                    Import Layout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-white/60 mx-auto mb-2" />
                <h4 className="text-white font-medium text-sm">Preview Mode</h4>
                <p className="text-xs text-white/50">Coming soon</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-white/50 text-xs">
            <p>Layouts are automatically saved to your browser's local storage.</p>
            <p className="mt-1">Export layouts to share them or backup your configurations.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}