import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, MapPin } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  location: string;
  high: number;
  low: number;
  icon: string;
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Location access denied");
        }
      );
    } else {
      setLocationError("Geolocation not supported");
    }
  }, []);

  const { data: weather, isLoading, error } = useQuery<WeatherData>({
    queryKey: location ? [`/api/weather?lat=${location.lat}&lon=${location.lon}`] : ["weather-disabled"],
    enabled: !!location,
    retry: false,
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun className="text-yellow-300 text-3xl w-8 h-8" />;
      case "clouds":
        return <Cloud className="text-gray-300 text-3xl w-8 h-8" />;
      case "rain":
        return <CloudRain className="text-blue-300 text-3xl w-8 h-8" />;
      case "snow":
        return <CloudSnow className="text-white text-3xl w-8 h-8" />;
      case "wind":
        return <Wind className="text-gray-300 text-3xl w-8 h-8" />;
      default:
        return <Sun className="text-yellow-300 text-3xl w-8 h-8" />;
    }
  };

  if (locationError) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
        <div className="text-center">
          <MapPin className="mx-auto mb-2 h-8 w-8 text-white opacity-60" />
          <div className="text-sm text-white opacity-70">
            Enable location access for weather
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="text-center animate-pulse">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full mx-auto mb-3"></div>
          <div className="h-8 bg-white bg-opacity-20 rounded mb-2"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded mb-2"></div>
          <div className="h-3 bg-white bg-opacity-20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
        <div className="text-center">
          <Cloud className="mx-auto mb-2 h-8 w-8 text-white opacity-60" />
          <div className="text-sm text-white opacity-70">
            Weather unavailable
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          {getWeatherIcon(weather?.condition || "clear")}
          <div className="ml-3">
            <div className="text-2xl font-light text-white">
              {weather?.temperature}°
            </div>
            <div className="text-sm text-white opacity-70 capitalize">
              {weather?.condition}
            </div>
          </div>
        </div>
        <div className="text-sm text-white opacity-80 mb-2">
          {weather?.location}
        </div>
        <div className="flex justify-between text-xs text-white opacity-60">
          <span>High: {weather?.high}°</span>
          <span>Low: {weather?.low}°</span>
        </div>
        <div className="mt-3 text-xs text-white opacity-60 capitalize">
          {weather?.description}
        </div>
      </div>
    </div>
  );
}
