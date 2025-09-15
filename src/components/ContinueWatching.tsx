import { Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContinueWatchingItem {
  id: string;
  title: string;
  episode: string;
  progress: number;
  duration: string;
  thumbnail: string;
}

const ContinueWatching = () => {
  const continueItems: ContinueWatchingItem[] = [
    {
      id: "1",
      title: "Treino HIIT Iniciante",
      episode: "Episódio 3 de 8",
      progress: 65,
      duration: "12 min",
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop"
    },
    {
      id: "2", 
      title: "Yoga para Flexibilidade",
      episode: "Episódio 2 de 6",
      progress: 35,
      duration: "25 min",
      thumbnail: "https://images.unsplash.com/photo-1506629905607-675aa8d3e2bb?w=400&h=225&fit=crop"
    },
    {
      id: "3",
      title: "Força e Resistência",
      episode: "Episódio 1 de 10",
      progress: 20,
      duration: "30 min", 
      thumbnail: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=225&fit=crop"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">Continue Assistindo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {continueItems.map((item) => (
          <div
            key={item.id}
            className="group relative bg-gradient-to-b from-black via-black to-slate-800 border border-white/10 shadow-xl rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button variant="ghost" size="icon" className="bg-primary/20 hover:bg-primary/30 text-primary backdrop-blur-sm">
                  <Play className="h-8 w-8" fill="currentColor" />
                </Button>
              </div>
              
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/30">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                {item.episode}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.progress}% completo</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{item.duration}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContinueWatching;