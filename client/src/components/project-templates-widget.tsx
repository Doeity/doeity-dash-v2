import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus, Briefcase, Code, BookOpen, Heart, Rocket, Search, Plus } from "lucide-react";
import WidgetClearControls from "@/components/widget-clear-controls";
import { useToast } from "@/hooks/use-toast";

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tasks: string[];
  timeline: string;
  tags: string[];
  isDefault?: boolean;
}

interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  templateId?: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  createdAt: string;
}

const DEFAULT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "web-app",
    name: "Web Application",
    description: "Full-stack web application development project",
    category: "Development",
    icon: "💻",
    tasks: [
      "Set up development environment",
      "Design user interface mockups",
      "Create database schema",
      "Implement frontend components",
      "Build backend API",
      "Write tests",
      "Deploy to production",
      "Document features and usage"
    ],
    timeline: "6-12 weeks",
    tags: ["web", "frontend", "backend", "database"],
    isDefault: true
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    description: "Cross-platform mobile application development",
    category: "Development",
    icon: "📱",
    tasks: [
      "Market research and planning",
      "UI/UX design and prototyping",
      "Set up development framework",
      "Implement core features",
      "Integrate APIs and services",
      "Test on multiple devices",
      "Prepare app store listings",
      "Launch and marketing"
    ],
    timeline: "8-16 weeks",
    tags: ["mobile", "ios", "android", "react-native"],
    isDefault: true
  },
  {
    id: "content-creation",
    name: "Content Creation",
    description: "Blog, video, or podcast content creation project",
    category: "Creative",
    icon: "🎨",
    tasks: [
      "Define content strategy",
      "Research target audience",
      "Create content calendar",
      "Write/record initial content",
      "Design visual assets",
      "Set up distribution channels",
      "Launch content series",
      "Analyze performance metrics"
    ],
    timeline: "4-8 weeks",
    tags: ["content", "writing", "video", "social-media"],
    isDefault: true
  },
  {
    id: "business-launch",
    name: "Business Launch",
    description: "Complete business startup project template",
    category: "Business",
    icon: "🚀",
    tasks: [
      "Market research and validation",
      "Business plan development",
      "Legal structure and registration",
      "Branding and logo design",
      "Website and online presence",
      "Product/service development",
      "Marketing strategy",
      "Launch and customer acquisition"
    ],
    timeline: "12-24 weeks",
    tags: ["business", "startup", "marketing", "legal"],
    isDefault: true
  },
  {
    id: "learning-course",
    name: "Learning Course",
    description: "Structured learning project for acquiring new skills",
    category: "Education",
    icon: "📚",
    tasks: [
      "Define learning objectives",
      "Research learning resources",
      "Create study schedule",
      "Complete foundational modules",
      "Work on practice projects",
      "Join community/forums",
      "Take assessments/certifications",
      "Apply knowledge to real projects"
    ],
    timeline: "8-12 weeks",
    tags: ["learning", "skills", "certification", "practice"],
    isDefault: true
  },
  {
    id: "fitness-program",
    name: "Fitness Program",
    description: "Personal fitness and health improvement project",
    category: "Health",
    icon: "💪",
    tasks: [
      "Set fitness goals and metrics",
      "Design workout routine",
      "Plan nutrition strategy",
      "Set up tracking systems",
      "Begin regular workouts",
      "Monitor progress weekly",
      "Adjust program as needed",
      "Evaluate and set new goals"
    ],
    timeline: "12-16 weeks",
    tags: ["fitness", "health", "nutrition", "tracking"],
    isDefault: true
  }
];

export default function ProjectTemplatesWidget() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [deletedTemplates, setDeletedTemplates] = useState<ProjectTemplate[]>([]);
  const { toast } = useToast();

  const { data: templates = [] } = useQuery<ProjectTemplate[]>({
    queryKey: ["/api/project-templates"],
    initialData: DEFAULT_TEMPLATES,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: { name: string; description: string; templateId?: string }) => 
      apiRequest("POST", "/api/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created!",
        description: "Your new project has been created successfully.",
      });
      setNewProjectName("");
      setSelectedTemplate(null);
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: Omit<ProjectTemplate, 'id'>) => 
      apiRequest("POST", "/api/project-templates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-templates"] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/project-templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-templates"] });
    },
  });

  const categories = ["all", ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const createProjectFromTemplate = (template: ProjectTemplate) => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project.",
        variant: "destructive"
      });
      return;
    }

    createProjectMutation.mutate({
      name: newProjectName.trim(),
      description: template.description,
      templateId: template.id,
    });
  };

  const handleClearData = () => {
    setDeletedTemplates(templates.filter(t => !t.isDefault));
    templates.filter(t => !t.isDefault).forEach(template => {
      deleteTemplateMutation.mutate(template.id);
    });
  };

  const handleRestoreData = () => {
    deletedTemplates.forEach(template => {
      createTemplateMutation.mutate(template);
    });
    setDeletedTemplates([]);
  };

  const handleLoadDummyData = () => {
    const dummyTemplates = [
      {
        name: "E-commerce Store",
        description: "Complete online store with payment integration",
        category: "Development",
        icon: "🛒",
        tasks: ["Product catalog setup", "Payment gateway integration", "Order management", "Customer accounts"],
        timeline: "10-14 weeks",
        tags: ["ecommerce", "payment", "inventory"]
      },
      {
        name: "Podcast Launch",
        description: "Start and grow a successful podcast",
        category: "Creative",
        icon: "🎙️",
        tasks: ["Format planning", "Equipment setup", "Recording first episodes", "Distribution setup"],
        timeline: "6-8 weeks",
        tags: ["podcast", "audio", "content"]
      }
    ];

    dummyTemplates.forEach(template => {
      createTemplateMutation.mutate(template);
    });
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center space-x-2">
          <FolderPlus className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Project Templates</h3>
          <Badge variant="outline" className="text-white/70 border-white/30">
            {templates.length} templates
          </Badge>
        </div>
        <WidgetClearControls
          onClearData={handleClearData}
          onRestoreData={handleRestoreData}
          onLoadDummyData={handleLoadDummyData}
          hasData={templates.some(t => !t.isDefault)}
          hasDeletedData={deletedTemplates.length > 0}
          widgetName="Project Templates"
        />
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger value="browse" className="data-[state=active]:bg-white/20">Browse</TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-white/20">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 border-white/20 hover:bg-white/10"
                  }
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{template.icon}</span>
                        <h4 className="text-white font-medium">{template.name}</h4>
                        <Badge variant="outline" className="text-xs text-white/60 border-white/20">
                          {template.timeline}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/70 mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-white/10 text-white/60">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedTemplate(template)}
                      className="ml-2 bg-zen-sage hover:bg-zen-sage/80 text-white"
                    >
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Project Modal */}
          {selectedTemplate && (
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <span>{selectedTemplate.icon}</span>
                  <span>Create {selectedTemplate.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={() => createProjectFromTemplate(selectedTemplate)}
                    disabled={createProjectMutation.isPending}
                    className="flex-1 bg-zen-sage hover:bg-zen-sage/80 text-white"
                  >
                    Create Project
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                    className="text-white/70 border-white/20 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <div className="text-center text-white/70 text-sm">
            <p>Custom template creation coming soon!</p>
            <p>For now, you can use and customize the existing templates.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}