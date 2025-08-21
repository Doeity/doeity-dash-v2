import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, Play, Pause, Volume2, VolumeX } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ambientSounds = [
  { id: 'rain', name: 'Rain', emoji: '🌧️', url: 'https://www.soundjay.com/misc/sounds/rain-01.wav' },
  { id: 'forest', name: 'Forest', emoji: '🌲', url: 'https://www.soundjay.com/nature/sounds/forest-01.wav' },
  { id: 'ocean', name: 'Ocean Waves', emoji: '🌊', url: 'https://www.soundjay.com/nature/sounds/ocean-01.wav' },
  { id: 'cafe', name: 'Coffee Shop', emoji: '☕', url: 'https://www.soundjay.com/misc/sounds/cafe-01.wav' },
  { id: 'whitenoise', name: 'White Noise', emoji: '⚪', url: 'https://www.soundjay.com/misc/sounds/whitenoise-01.wav' },
];

export default function FocusMusicControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const handleSoundSelect = (soundId: string) => {
    if (selectedSound === soundId && isPlaying) {
      setIsPlaying(false);
    } else {
      setSelectedSound(soundId);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const currentSound = ambientSounds.find(sound => sound.id === selectedSound);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300"
        >
          <Music className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 text-white">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Focus Music</h4>
            {selectedSound && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1"
                >
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
              </div>
            )}
          </div>

          {/* Currently Playing */}
          {selectedSound && (
            <div className="p-3 bg-white bg-opacity-10 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{currentSound?.emoji}</span>
                <span className="text-sm">{currentSound?.name}</span>
                {isPlaying && (
                  <div className="flex space-x-0.5">
                    <div className="w-1 h-3 bg-zen-sage animate-pulse rounded-full"></div>
                    <div className="w-1 h-3 bg-zen-sage animate-pulse rounded-full delay-75"></div>
                    <div className="w-1 h-3 bg-zen-sage animate-pulse rounded-full delay-150"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ambient Sounds */}
          <div>
            <h5 className="text-sm font-medium mb-2 opacity-80">Ambient Sounds</h5>
            <div className="grid grid-cols-2 gap-2">
              {ambientSounds.map((sound) => (
                <Button
                  key={sound.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSoundSelect(sound.id)}
                  className={`text-white hover:bg-white hover:bg-opacity-20 justify-start h-auto p-2 ${
                    selectedSound === sound.id ? 'bg-white bg-opacity-20' : ''
                  }`}
                >
                  <span className="mr-2">{sound.emoji}</span>
                  <span className="text-xs">{sound.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          {selectedSound && (
            <div>
              <h5 className="text-sm font-medium mb-2 opacity-80">Volume</h5>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  if (newVolume > 0) setIsMuted(false);
                }}
                className="w-full h-2 bg-white bg-opacity-20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          {/* Spotify Integration Note */}
          <div className="border-t border-white border-opacity-20 pt-3">
            <p className="text-xs opacity-70">
              🎵 Spotify integration coming soon! Connect your account for personalized focus playlists.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}