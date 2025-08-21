import { useQuery } from "@tanstack/react-query";
import { Globe, Clock, Eye } from "lucide-react";
import type { WebsiteUsage } from "@shared/schema";

export default function WebsiteUsageWidget() {
  const today = new Date().toISOString().split('T')[0];

  const { data: usage = [], isLoading } = useQuery<WebsiteUsage[]>({
    queryKey: [`/api/website-usage?date=${today}`],
  });

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-white bg-opacity-20 rounded flex-1 mr-4"></div>
                <div className="h-4 bg-white bg-opacity-20 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalTime = usage.reduce((sum, site) => sum + site.timeSpentMinutes, 0);
  const totalVisits = usage.reduce((sum, site) => sum + site.visitCount, 0);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'text-green-300';
      case 'social': return 'text-blue-300';
      case 'entertainment': return 'text-purple-300';
      case 'education': return 'text-yellow-300';
      default: return 'text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return '💼';
      case 'social': return '👥';
      case 'entertainment': return '🎬';
      case 'education': return '📚';
      default: return '🌐';
    }
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Today's History</h3>
        </div>
        <div className="text-white opacity-60 text-sm">
          {formatTime(totalTime)}
        </div>
      </div>

      {usage.length === 0 ? (
        <p className="text-white opacity-60 text-sm">No browsing activity today.</p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-white opacity-70 flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(totalTime)}</span>
              </span>
              <span className="text-white opacity-70 flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{totalVisits} visits</span>
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-40 overflow-y-auto">
            {usage.map((site) => {
              const percentage = totalTime > 0 ? (site.timeSpentMinutes / totalTime) * 100 : 0;
              return (
                <div key={site.id} className="flex items-center space-x-3">
                  <span className="text-sm">{getCategoryIcon(site.category)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white opacity-90 text-sm truncate">{site.domain}</span>
                      <span className="text-white opacity-60 text-xs">
                        {formatTime(site.timeSpentMinutes)}
                      </span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${getCategoryColor(site.category)} bg-current`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-white opacity-50 text-xs">
                    {site.visitCount}×
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}