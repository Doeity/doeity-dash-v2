import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Plus, Edit, Trash2, CheckCircle, Circle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project, ProjectMilestone, InsertProject, InsertProjectMilestone } from "@shared/schema";

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const STATUS_COLORS = {
  active: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export function ProjectTrackerWidget() {
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: milestones = [] } = useQuery<ProjectMilestone[]>({
    queryKey: ["/api/project-milestones"],
  });

  const createProject = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowAddProject(false);
      setEditingProject(null);
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Project> & { id: string }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditingProject(null);
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (data: InsertProjectMilestone) => {
      const response = await fetch("/api/project-milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create milestone");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-milestones"] });
      setShowAddMilestone(false);
      setEditingMilestone(null);
    },
  });

  const toggleMilestone = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const response = await fetch(`/api/project-milestones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : null 
        }),
      });
      if (!response.ok) throw new Error("Failed to update milestone");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-milestones"] });
    },
  });

  const handleProjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const projectData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
      status: formData.get("status") as string,
      priority: formData.get("priority") as string,
      startDate: formData.get("startDate") as string,
      deadline: formData.get("deadline") as string,
      progress: parseInt(formData.get("progress") as string) || 0,
      tags: formData.get("tags") as string || "",
      userId: "default-user",
    };

    if (editingProject) {
      updateProject.mutate({ id: editingProject.id, ...projectData });
    } else {
      createProject.mutate(projectData);
    }
  };

  const handleMilestoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const milestoneData = {
      projectId: selectedProject!,
      title: formData.get("title") as string,
      description: formData.get("description") as string || "",
      dueDate: formData.get("dueDate") as string,
      order: parseInt(formData.get("order") as string) || 0,
    };

    createMilestone.mutate(milestoneData);
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const projectMilestones = selectedProject 
    ? milestones.filter(m => m.projectId === selectedProject)
    : [];

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <FolderOpen className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Project Tracker</h3>
        </div>
        <div className="flex gap-1">
          <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? "Edit Project" : "Add Project"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    name="name"
                    defaultValue={editingProject?.name}
                    placeholder="Project name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    name="description"
                    defaultValue={editingProject?.description}
                    placeholder="Project description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingProject?.status || "active"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" defaultValue={editingProject?.priority || "medium"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      name="startDate"
                      type="date"
                      defaultValue={editingProject?.startDate}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      name="deadline"
                      type="date"
                      defaultValue={editingProject?.deadline}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingProject?.progress || 0}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    name="tags"
                    defaultValue={editingProject?.tags}
                    placeholder="web, frontend, react"
                  />
                </div>
                <Button type="submit" disabled={createProject.isPending || updateProject.isPending}>
                  {editingProject ? "Update" : "Create"} Project
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="milestones" className="text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Milestones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-3">
            {activeProjects.length === 0 ? (
              <p className="text-sm text-white opacity-60 italic text-center py-4">
                No active projects
              </p>
            ) : (
              activeProjects.slice(0, 3).map(project => (
                <div key={project.id} className="p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-white">{project.name}</h4>
                    <div className="flex gap-1">
                      <Badge className={`text-xs ${PRIORITY_COLORS[project.priority as keyof typeof PRIORITY_COLORS]}`}>
                        {project.priority}
                      </Badge>
                      <Badge className={`text-xs ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}`}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-white opacity-70">
                    <span>{project.progress}% complete</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-white border-white border-opacity-30 hover:bg-white hover:bg-opacity-20"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    View Milestones
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="milestones" className="space-y-3">
            {!selectedProject ? (
              <div className="text-center py-4">
                <p className="text-sm text-white opacity-60">Select a project to view milestones</p>
                <Select onValueChange={setSelectedProject}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-white">
                    {projects.find(p => p.id === selectedProject)?.name} Milestones
                  </h4>
                  <Dialog open={showAddMilestone} onOpenChange={setShowAddMilestone}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Milestone</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleMilestoneSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Milestone Title</Label>
                          <Input
                            name="title"
                            placeholder="Milestone title"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            name="description"
                            placeholder="Milestone description"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            name="dueDate"
                            type="date"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="order">Order</Label>
                          <Input
                            name="order"
                            type="number"
                            min="0"
                            defaultValue="0"
                          />
                        </div>
                        <Button type="submit" disabled={createMilestone.isPending}>
                          Add Milestone
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {projectMilestones.length === 0 ? (
                  <p className="text-sm text-white opacity-60 italic text-center py-4">
                    No milestones added
                  </p>
                ) : (
                  projectMilestones
                    .sort((a, b) => a.order - b.order)
                    .map(milestone => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-3 p-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg"
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleMilestone.mutate({
                            id: milestone.id,
                            isCompleted: !milestone.isCompleted
                          })}
                        >
                          {milestone.isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-white opacity-40" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${milestone.isCompleted ? 'line-through text-white opacity-50' : 'text-white'}`}>
                            {milestone.title}
                          </p>
                          <p className="text-xs text-white opacity-70">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}