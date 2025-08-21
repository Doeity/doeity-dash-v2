import { useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackgroundNavigationProps {
  onBackgroundChange: (background: string) => void;
  currentBackground: string;
}

const BACKGROUND_OPTIONS = [
  {
    name: "Mountain Lake",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Forest Path",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Ocean Waves",
    url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Desert Sunset",
    url: "https://images.unsplash.com/photo-1516947786822-67505e0d4b3d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Lavender Field",
    url: "https://images.unsplash.com/photo-1498307833015-e7b400441eb8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  },
  {
    name: "Northern Lights",
    url: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
  }
];

export default function BackgroundNavigation({ onBackgroundChange, currentBackground }: BackgroundNavigationProps) {
  const currentIndex = BACKGROUND_OPTIONS.findIndex(bg => bg.url === currentBackground);

  const handlePreviousBackground = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : BACKGROUND_OPTIONS.length - 1;
    onBackgroundChange(BACKGROUND_OPTIONS[newIndex].url);
  };

  const handleNextBackground = () => {
    const newIndex = currentIndex < BACKGROUND_OPTIONS.length - 1 ? currentIndex + 1 : 0;
    onBackgroundChange(BACKGROUND_OPTIONS[newIndex].url);
  };

  const handleRandomBackground = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * BACKGROUND_OPTIONS.length);
    } while (randomIndex === currentIndex && BACKGROUND_OPTIONS.length > 1);
    
    onBackgroundChange(BACKGROUND_OPTIONS[randomIndex].url);
  };

  const currentBackgroundName = BACKGROUND_OPTIONS[currentIndex]?.name || "Custom";

  return (
    <div className="fixed bottom-6 left-6 flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePreviousBackground}
        className="text-white/60 hover:text-white hover:bg-white/10"
        title="Previous Background"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="px-2 text-xs text-white/70 min-w-20 text-center">
        {currentBackgroundName}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRandomBackground}
        className="text-white/60 hover:text-white hover:bg-white/10"
        title="Random Background"
      >
        <Shuffle className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNextBackground}
        className="text-white/60 hover:text-white hover:bg-white/10"
        title="Next Background"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}