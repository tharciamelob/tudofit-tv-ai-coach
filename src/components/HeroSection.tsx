import { Play, Plus, Star, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroWorkout from "@/assets/hero-workout.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroWorkout})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent z-10" />
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-3xl pt-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transforme seu{" "}
            <span className="text-primary">corpo</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
            Séries de treinos profissionais, cardápios personalizados e 
            acompanhamento completo da sua evolução.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold">
              <Play className="mr-2 h-5 w-5" fill="currentColor" />
              Começar Agora
            </Button>
            <Button variant="outline" className="border-foreground/30 bg-background/20 hover:bg-background/40 text-foreground px-8 py-3 text-lg font-semibold backdrop-blur-sm">
              <Plus className="mr-2 h-5 w-5" />
              Minha Lista
            </Button>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-foreground font-medium">4.8/5</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-foreground" />
              <span className="text-foreground font-medium">50k+ usuários</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-foreground" />
              <span className="text-foreground font-medium">Acesso ilimitado</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;