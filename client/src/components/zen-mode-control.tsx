import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface ZenModeControlProps {
  onZenModeToggle: (enabled: boolean) => void;
}

export default function ZenModeControl({ onZenModeToggle }: ZenModeControlProps) {
  const [isZenMode, setIsZenMode] = useState(false);

  const toggleZenMode = () => {
    const newZenMode = !isZenMode;
    setIsZenMode(newZenMode);
    onZenModeToggle(newZenMode);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleZenMode}
      className={`text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300 ${
        isZenMode ? 'bg-zen-sage bg-opacity-30' : ''
      }`}
      title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
    >
      {isZenMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  );
}