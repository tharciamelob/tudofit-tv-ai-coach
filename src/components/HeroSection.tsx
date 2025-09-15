import { Play, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent z-10" />
      
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/30 to-background opacity-80" />
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-2xl">
          <div className="flex items-center space-x-2 mb-4 animate-slide-in">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">#1 App de Fitness no Brasil</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in">
            Transforme seu corpo com treinos e cardápios{" "}
            <span className="text-primary">guiados por IA</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in">
            Tudo em um só lugar: treinos personalizados, nutrição inteligente, 
            monitoramento completo e muito mais. Sua jornada fitness começa aqui.
          </p>

          {/* Promo Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 animate-glow">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                LANÇAMENTO
              </div>
              <div>
                <p className="text-lg font-semibold text-primary">
                  R$ 9,99 no primeiro mês
                </p>
                <p className="text-sm text-muted-foreground">
                  De R$ 99,99 por apenas R$ 9,99. Experimente tudo sem limites!
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-in">
            <Button className="btn-hero group">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Começar agora
            </Button>
            <Button variant="outline" className="border-border hover:bg-secondary/50">
              <Clock className="mr-2 h-4 w-4" />
              Ver demonstração
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-8 mt-8 text-sm text-muted-foreground">
            <div>
              <span className="text-2xl font-bold text-foreground">500+</span>
              <p>Treinos disponíveis</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">50k+</span>
             <p>Usuários ativos</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">98%</span>
              <p>Satisfação</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;