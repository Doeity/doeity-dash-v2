import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";

export default function MainFocus() {
  const [localFocus, setLocalFocus] = useState("");

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { dailyFocus: string }) => 
      apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  useEffect(() => {
    if ((settings as any)?.dailyFocus !== undefined) {
      setLocalFocus((settings as any).dailyFocus);
    }
  }, [(settings as any)?.dailyFocus]);

  const handleFocusChange = (value: string) => {
    setLocalFocus(value);
    // Debounce the API call
    const timer = setTimeout(() => {
      updateSettingsMutation.mutate({ dailyFocus: value });
    }, 500);

    return () => clearTimeout(timer);
  };

  return (
    <div className="w-full max-w-md mb-8">
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
        <label className="block text-white text-sm font-medium mb-3 opacity-90">
          What is your main focus for today?
        </label>
        <Input 
          type="text" 
          placeholder="Enter your daily focus..." 
          className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-3 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-zen-sage focus:border-transparent transition-all duration-300"
          value={localFocus}
          onChange={(e) => handleFocusChange(e.target.value)}
        />
      </div>
    </div>
  );
}
