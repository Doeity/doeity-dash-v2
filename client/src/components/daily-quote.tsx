import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

interface Quote {
  text: string;
  author: string;
}

export default function DailyQuote() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  const { data: quote, isLoading, refetch } = useQuery<Quote>({
    queryKey: ["/api/quote", quoteIndex],
    staleTime: 5 * 60 * 1000, // 5 minutes for navigation
  });

  const handleNextQuote = () => {
    const newIndex = quoteIndex + 1;
    setQuoteIndex(newIndex);
    queryClient.invalidateQueries({ queryKey: ["/api/quote", newIndex] });
    refetch();
  };

  const handlePreviousQuote = () => {
    if (quoteIndex > 0) {
      const newIndex = quoteIndex - 1;
      setQuoteIndex(newIndex);
      queryClient.invalidateQueries({ queryKey: ["/api/quote", newIndex] });
      refetch();
    }
  };

  const handleRefreshQuote = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/quote", quoteIndex] });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="text-center mb-12 max-w-2xl">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-3"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Button variant="ghost" size="sm" disabled className="text-white/30">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled className="text-white/30">
            <RefreshCw className="h-4 w-4 animate-spin" />
          </Button>
          <Button variant="ghost" size="sm" disabled className="text-white/30">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center mb-12 max-w-2xl relative group">
        <blockquote className="text-lg md:text-xl font-light text-white opacity-90 italic leading-relaxed">
          "The present moment is the only time over which we have dominion."
        </blockquote>
        <cite className="block mt-3 text-sm text-white opacity-70">
          — Thich Nhat Hanh
        </cite>
        <div className="flex items-center justify-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button variant="ghost" size="sm" disabled className="text-white/30">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRefreshQuote} className="text-white/60 hover:text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNextQuote} className="text-white/60 hover:text-white hover:bg-white/10">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mb-12 max-w-2xl relative group">
      <blockquote className="text-lg md:text-xl font-light text-white opacity-90 italic leading-relaxed">
        "{quote.text}"
      </blockquote>
      <cite className="block mt-3 text-sm text-white opacity-70">
        — {quote.author}
      </cite>
      
      {/* Quote Navigation Controls */}
      <div className="flex items-center justify-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreviousQuote}
          disabled={quoteIndex === 0 || isLoading}
          className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefreshQuote}
          disabled={isLoading}
          className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextQuote}
          disabled={isLoading}
          className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
