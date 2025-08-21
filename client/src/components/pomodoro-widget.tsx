import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";

type PomodoroState = "idle" | "working" | "break" | "paused";

export default function PomodoroWidget() {
  const [state, setState] = useState<PomodoroState>("idle");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  
  const workDuration = 25 * 60; // 25 minutes
  const breakDuration = 5 * 60; // 5 minutes
  const longBreakDuration = 15 * 60; // 15 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state === "working" || state === "break") {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            if (isBreak) {
              // Break finished, start new work session
              setState("idle");
              setIsBreak(false);
              setTimeLeft(workDuration);
            } else {
              // Work session finished
              const newSessionCount = sessions + 1;
              setSessions(newSessionCount);
              setIsBreak(true);
              setState("idle");
              
              // Every 4th session gets a long break
              const breakTime = newSessionCount % 4 === 0 ? longBreakDuration : breakDuration;
              setTimeLeft(breakTime);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state, isBreak, sessions, workDuration, breakDuration, longBreakDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentDuration = () => {
    if (isBreak) {
      return sessions % 4 === 0 ? longBreakDuration : breakDuration;
    }
    return workDuration;
  };

  const getProgress = () => {
    const total = getCurrentDuration();
    return ((total - timeLeft) / total) * 100;
  };

  const handleStart = () => {
    if (state === "idle") {
      setState(isBreak ? "break" : "working");
    } else if (state === "paused") {
      setState(isBreak ? "break" : "working");
    } else {
      setState("paused");
    }
  };

  const handleReset = () => {
    setState("idle");
    setIsBreak(false);
    setTimeLeft(workDuration);
  };

  const getStateText = () => {
    if (state === "idle" && isBreak) {
      return sessions % 4 === 0 ? "Long Break Ready" : "Break Ready";
    }
    if (state === "working") return "Focus Time";
    if (state === "break") return sessions % 4 === 0 ? "Long Break" : "Break Time";
    if (state === "paused") return "Paused";
    return "Ready to Focus";
  };

  const getStateColor = () => {
    if (isBreak) return "text-zen-blue";
    return "text-zen-sage";
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Pomodoro</h3>
        </div>
        <div className="text-white opacity-60 text-sm">
          Session {sessions + 1}
        </div>
      </div>

      <div className="text-center mb-6">
        <div className={`text-3xl font-light text-white mb-2 ${getStateColor()}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm text-white opacity-70 mb-4">
          {getStateText()}
        </div>
        
        <Progress 
          value={getProgress()} 
          className="h-2 bg-white bg-opacity-20"
        />
      </div>

      <div className="flex items-center justify-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-zen-sage transition-colors duration-300 flex items-center space-x-2"
          onClick={handleStart}
        >
          {state === "working" || state === "break" ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span className="text-sm">
            {state === "working" || state === "break" ? "Pause" : "Start"}
          </span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-zen-blue transition-colors duration-300 flex items-center space-x-2"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-sm">Reset</span>
        </Button>
      </div>

      <div className="mt-4 text-center">
        <div className="text-xs text-white opacity-50">
          {sessions > 0 && `${sessions} session${sessions > 1 ? 's' : ''} completed`}
        </div>
      </div>
    </div>
  );
}