import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw, Heart, Share, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  photographer: string;
  source: string;
}

const CURATED_PHOTOS: Photo[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    title: "Serene Mountain Lake",
    description: "Crystal clear waters reflecting majestic peaks",
    photographer: "Nature Photography",
    source: "Unsplash"
  },
  {
    id: "2", 
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    title: "Enchanted Forest Path",
    description: "Sunlight filtering through ancient trees",
    photographer: "Adventure Lens",
    source: "Unsplash"
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    title: "Ocean Sunset",
    description: "Golden hour waves meeting the horizon",
    photographer: "Coastal Views",
    source: "Unsplash"
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1516947786822-67505e0d4b3d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    title: "Desert Landscape",
    description: "Vast sandy dunes under starlit sky",
    photographer: "Desert Explorer",
    source: "Unsplash"
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1498307833015-e7b400441eb8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    title: "Lavender Fields",
    description: "Purple blooms stretching to infinity",
    photographer: "Floral Dreams",
    source: "Unsplash"
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    title: "Northern Lights",
    description: "Aurora borealis dancing across the night sky",
    photographer: "Arctic Wonder",
    source: "Unsplash"
  },
  {
    id: "7",
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    title: "Tropical Paradise",
    description: "Palm trees swaying over turquoise waters",
    photographer: "Island Life",
    source: "Unsplash"
  },
  {
    id: "8",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
    title: "Mountain Vista",
    description: "Panoramic view from the summit",
    photographer: "Peak Moments",
    source: "Unsplash"
  }
];

export default function DailyPhotoWidget() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toast } = useToast();

  const currentPhoto = CURATED_PHOTOS[currentPhotoIndex];

  useEffect(() => {
    // Get daily photo based on current date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const dailyIndex = dayOfYear % CURATED_PHOTOS.length;
    setCurrentPhotoIndex(dailyIndex);
  }, []);

  const nextPhoto = () => {
    setImageLoaded(false);
    setCurrentPhotoIndex((prev) => (prev + 1) % CURATED_PHOTOS.length);
    setIsLiked(false);
  };

  const previousPhoto = () => {
    setImageLoaded(false);
    setCurrentPhotoIndex((prev) => (prev - 1 + CURATED_PHOTOS.length) % CURATED_PHOTOS.length);
    setIsLiked(false);
  };

  const randomPhoto = () => {
    setImageLoaded(false);
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * CURATED_PHOTOS.length);
    } while (randomIndex === currentPhotoIndex && CURATED_PHOTOS.length > 1);
    
    setCurrentPhotoIndex(randomIndex);
    setIsLiked(false);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Photo removed from your collection" : "Photo saved to your collection",
    });
  };

  const sharePhoto = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPhoto.title,
          text: currentPhoto.description,
          url: currentPhoto.url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(currentPhoto.url);
      toast({
        title: "Link copied!",
        description: "Photo URL copied to clipboard",
      });
    }
  };

  const downloadPhoto = () => {
    const link = document.createElement('a');
    link.href = currentPhoto.url;
    link.download = `${currentPhoto.title.replace(/\\s+/g, '-').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Photo is being downloaded",
    });
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Camera className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Daily Photo</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousPhoto}
            className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={randomPhoto}
            className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextPhoto}
            className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-black/20 border-white/10 overflow-hidden">
        <div className="relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-lg flex items-center justify-center">
              <Camera className="h-8 w-8 text-white/40" />
            </div>
          )}
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title}
            className={`w-full h-48 object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Photo Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h4 className="font-medium text-lg mb-1">{currentPhoto.title}</h4>
            <p className="text-sm opacity-80 mb-2">{currentPhoto.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-60">
                by {currentPhoto.photographer}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLike}
                  className={`h-8 w-8 p-0 transition-colors ${
                    isLiked 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={sharePhoto}
                  className="text-white/60 hover:text-white h-8 w-8 p-0"
                >
                  <Share className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadPhoto}
                  className="text-white/60 hover:text-white h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-3 text-center">
        <div className="flex justify-center space-x-1 mb-2">
          {CURATED_PHOTOS.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setImageLoaded(false);
                setCurrentPhotoIndex(index);
                setIsLiked(false);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentPhotoIndex 
                  ? 'bg-white' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-white/50">
          {currentPhotoIndex + 1} of {CURATED_PHOTOS.length}
        </p>
      </div>
    </div>
  );
}