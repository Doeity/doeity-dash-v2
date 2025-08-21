import { useQuery } from "@tanstack/react-query";
import { BookOpen, Lightbulb } from "lucide-react";
import type { DailyBook } from "@shared/schema";

export default function DailyBookWidget() {
  const today = new Date().toISOString().split('T')[0];

  const { data: book, isLoading } = useQuery<DailyBook>({
    queryKey: [`/api/daily-book?date=${today}`],
  });

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="flex space-x-4 mb-4">
            <div className="w-16 h-24 bg-white bg-opacity-20 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-white bg-opacity-20 rounded mb-2"></div>
              <div className="h-3 bg-white bg-opacity-20 rounded mb-2"></div>
              <div className="h-3 bg-white bg-opacity-20 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-white bg-opacity-20 rounded"></div>
            <div className="h-3 bg-white bg-opacity-20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Today's Book</h3>
        </div>
        <p className="text-white opacity-60 text-sm">No book recommendation for today.</p>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="h-5 w-5 text-white opacity-80" />
        <h3 className="text-white font-medium text-lg">Today's Book</h3>
      </div>

      <div className="flex space-x-4 mb-4">
        {book.coverUrl && (
          <div className="flex-shrink-0">
            <img 
              src={book.coverUrl} 
              alt={book.title}
              className="w-16 h-24 object-cover rounded-lg shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-base mb-1 truncate">{book.title}</h4>
          <p className="text-white opacity-70 text-sm mb-2">by {book.author}</p>
          <span className="inline-block px-2 py-1 text-xs bg-white bg-opacity-20 text-white rounded-full">
            {book.genre}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-white opacity-80 text-sm leading-relaxed line-clamp-3">
            {book.summary}
          </p>
        </div>

        <div className="border-t border-white border-opacity-20 pt-3">
          <div className="flex items-start space-x-2">
            <Lightbulb className="h-4 w-4 text-yellow-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-200 text-xs font-medium mb-1">Key Takeaway</p>
              <p className="text-white opacity-80 text-sm leading-relaxed">
                {book.keyTakeaway}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}