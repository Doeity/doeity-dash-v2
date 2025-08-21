import { useState, useEffect } from "react";

export default function TimeDisplay() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="text-center mb-8">
      <div className="text-6xl md:text-7xl font-light text-white mb-2">
        {formatTime(time)}
      </div>
      <div className="text-lg md:text-xl font-light text-white opacity-80">
        {formatDate(time)}
      </div>
    </div>
  );
}
