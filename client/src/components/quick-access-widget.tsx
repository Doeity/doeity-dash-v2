import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, ExternalLink, Zap } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import type { QuickLink } from "@shared/schema";

export default function QuickAccessWidget() {
  const [newLink, setNewLink] = useState({ name: "", url: "", icon: "🔗" });
  const { showDummyData } = useSettings();

  const { data: allLinks = [], isLoading } = useQuery<QuickLink[]>({
    queryKey: ["/api/quick-links"],
  });

  // Filter out dummy data if setting is disabled
  const links = showDummyData ? allLinks : allLinks.filter(link => 
    !link.name.includes("Sample") && 
    !link.name.includes("Example") && 
    !link.id.includes("sample")
  );

  const createLinkMutation = useMutation({
    mutationFn: (data: { name: string; url: string; icon: string; order: number }) => 
      apiRequest("POST", "/api/quick-links", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quick-links"] });
      setNewLink({ name: "", url: "", icon: "🔗" });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/quick-links/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quick-links"] });
    },
  });

  const handleAddLink = () => {
    if (newLink.name.trim() && newLink.url.trim()) {
      let url = newLink.url.trim();
      // Add https:// if no protocol specified
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      createLinkMutation.mutate({
        name: newLink.name.trim(),
        url: url,
        icon: newLink.icon,
        order: links.length,
      });
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const deleteLink = (id: string) => {
    deleteLinkMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-white bg-opacity-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Quick Access</h3>
        </div>
      </div>
      
      {/* Links Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {links.map((link) => (
          <div key={link.id} className="relative group">
            <Button
              variant="ghost"
              className="w-full h-12 bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30 border border-white border-opacity-30 rounded-lg text-white transition-all duration-300 flex items-center justify-center space-x-2 p-2"
              onClick={() => handleLinkClick(link.url)}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-sm truncate">{link.name}</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 bg-opacity-80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={() => deleteLink(link.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* Add New Link Form */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Input 
            type="text" 
            placeholder="Name..." 
            className="flex-1 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-1 focus:ring-zen-sage transition-all duration-300"
            value={newLink.name}
            onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
          />
          <Input 
            type="text" 
            placeholder="🔗" 
            className="w-16 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-zen-sage transition-all duration-300"
            value={newLink.icon}
            onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Input 
            type="text" 
            placeholder="URL (e.g., gmail.com)" 
            className="flex-1 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-1 focus:ring-zen-sage transition-all duration-300"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            onKeyPress={(e) => e.key === "Enter" && handleAddLink()}
          />
          <Button 
            variant="ghost"
            size="sm"
            className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto"
            onClick={handleAddLink}
            disabled={createLinkMutation.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}