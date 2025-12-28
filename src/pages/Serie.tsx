'use client';
import React, { useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchSeriesDetails, type SeriesCard } from '@/hooks/useCategoryExercises';
import { ExerciseImage } from '@/components/ExerciseImage';
import { cn } from '@/lib/utils';

export default function SeriePage() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [series, setSeries] = React.useState<SeriesCard | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const featuredRef = useRef<HTMLDivElement>(null);

  const slug = params?.slug as string;

  const handleBack = () => {
    // Verifica se veio de dentro da app pelo location.key
    const canGoBack = location.key !== 'default' && window.history.length > 1;
    
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  React.useEffect(() => {
    if (!slug) return;

    let alive = true;
    setLoading(true);
    fetchSeriesDetails(slug)
      .then((data) => { if (alive) setSeries(data); })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando série...</div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-destructive mb-4">
          {error || 'Série não encontrada'}
        </div>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const selectedExercise = series.exercises?.[selectedIndex] || series.exercises?.[0];

  const handleSelectExercise = (index: number) => {
    setSelectedIndex(index);
    // Scroll suave até o destaque
    featuredRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={handleBack} 
          variant="ghost" 
          className="mb-6 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Exercício em Destaque */}
        <div ref={featuredRef} className="mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Mídia principal - visualização técnica */}
            <div className="relative w-full max-h-[60vh] min-h-[300px] rounded-lg overflow-hidden bg-black shadow-xl flex items-center justify-center">
              <ExerciseImage
                src={selectedExercise?.media_url || series.cover_url}
                alt={selectedExercise?.name ?? selectedExercise?.slug ?? series.name ?? series.slug}
                className="max-w-full max-h-[60vh] w-auto h-auto object-contain"
              />
              
              {/* Badge do exercício atual */}
              {selectedExercise && (
                <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-foreground text-sm px-3 py-1 rounded-full font-medium">
                  Exercício {selectedIndex + 1} de {series.exercises?.length}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{series.name ?? series.slug}</p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {selectedExercise?.name ?? selectedExercise?.slug ?? series.name ?? series.slug}
                </h1>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {series.description ?? 'Série de exercícios para seu treino.'}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{series.exercises?.length || 0}</span>
                  <span>exercícios</span>
                </div>
                {series.exercises && series.exercises.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      ~{Math.round((series.exercises.length * 45) / 60)}min
                    </span>
                    <span>duração estimada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Exercícios */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Exercícios da Série</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {series.exercises?.map((exercise, index) => (
              <div 
                key={exercise.slug}
                onClick={() => handleSelectExercise(index)}
                className={cn(
                  "bg-card rounded-lg overflow-hidden border-2 transition-all duration-300 group cursor-pointer",
                  selectedIndex === index 
                    ? "border-primary ring-2 ring-primary/30 scale-[1.02]" 
                    : "border-border/50 hover:border-border"
                )}
              >
                <div className="relative aspect-video bg-muted">
                  <ExerciseImage
                    src={exercise.media_url}
                    alt={exercise.name ?? exercise.slug}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Número do exercício */}
                  <div className={cn(
                    "absolute top-2 left-2 backdrop-blur-sm text-white text-xs px-2 py-1 rounded font-medium",
                    selectedIndex === index ? "bg-primary" : "bg-black/70"
                  )}>
                    {index + 1}
                  </div>
                  
                  {/* Play button overlay */}
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                    selectedIndex === index ? "opacity-100 bg-black/30" : "opacity-0 group-hover:opacity-100 bg-black/20"
                  )}>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className={cn(
                    "font-medium line-clamp-2 text-sm transition-colors",
                    selectedIndex === index ? "text-primary" : "text-foreground group-hover:text-primary"
                  )}>
                    {exercise.name ?? exercise.slug}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}