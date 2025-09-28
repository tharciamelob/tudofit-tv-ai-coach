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
        <Button onClick={() => navigate(-1)} variant="outline">
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
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              {series.cover_url ? (
                <img
                  src={series.cover_url}
                  alt={series.name ?? series.slug}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <Play className="w-24 h-24 text-white/80" />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {series.name ?? series.slug}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {series.description ?? 'Série de exercícios para seu treino.'}
              </p>
              <div className="text-sm text-muted-foreground">
                {series.exercises?.length || 0} exercícios
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Exercícios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {series.exercises?.map((exercise, index) => (
              <div key={exercise.slug} className="card-netflix rounded-lg p-4">
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
                  {exercise.media_url ? (
                    <img
                      src={exercise.media_url}
                      alt={exercise.name ?? exercise.slug}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Play className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">
                    Exercício {index + 1}
                  </div>
                  <h3 className="font-medium text-foreground line-clamp-2">
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