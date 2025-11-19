'use client';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchSeriesDetails, type SeriesCard } from '@/hooks/useCategoryExercises';

export default function SeriePage() {
  const params = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = React.useState<SeriesCard | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const slug = params?.slug as string;

  const handleBack = () => {
    if (window.history.length > 1) {
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

        <div className="mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-xl">
              {series.cover_url ? (
                <img
                  src={series.cover_url}
                  alt={series.name ?? series.slug}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Play className="w-24 h-24 text-white/90 drop-shadow-lg" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                {series.name ?? series.slug}
              </h1>
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
              
              {/* Botão de início */}
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-3 rounded-md"
                >
                  <Play className="w-5 h-5 mr-2 fill-black" />
                  Iniciar Treino
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Exercícios da Série</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {series.exercises?.map((exercise, index) => (
              <div 
                key={exercise.slug} 
                className="bg-card rounded-lg overflow-hidden border border-border/50 hover:border-border transition-all duration-300 group cursor-pointer"
              >
                <div className="relative aspect-video bg-muted">
                  {exercise.media_url ? (
                    <img
                      src={exercise.media_url}
                      alt={exercise.name ?? exercise.slug}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <Play className="w-12 h-12 text-muted-foreground/60" />
                    </div>
                  )}
                  
                  {/* Número do exercício */}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {exercise.name ?? exercise.slug}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Exercício {index + 1} de {series.exercises?.length}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}