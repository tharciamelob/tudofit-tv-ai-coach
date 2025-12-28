'use client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { fetchSeriesCards, type SeriesCard } from '@/hooks/useCategoryExercises';
import { ExerciseImage } from '@/components/ExerciseImage';
import HorizontalCarousel from '@/components/HorizontalCarousel';

type Props = { title: string; slug: string };

export default function CategoriaCarrossel({ title, slug }: Props) {
  const [items, setItems] = React.useState<SeriesCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchSeriesCards(slug, 24, 0)
      .then((d) => { if (alive) setItems(d); })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  const handleSeriesClick = (seriesSlug: string) => {
    navigate(`/serie/${seriesSlug}`);
  };

  // Não renderizar se não há séries para a categoria
  if (!loading && !error && items.length === 0) {
    return null;
  }

  // Loading skeleton
  if (loading) {
    return (
      <HorizontalCarousel title={title}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-64 animate-pulse">
            <div className="aspect-video rounded-lg bg-muted mb-3" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted/70 rounded w-3/4" />
          </div>
        ))}
      </HorizontalCarousel>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="my-8">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">{title}</h2>
        <div className="text-destructive">Erro: {error}</div>
      </section>
    );
  }

  return (
    <HorizontalCarousel title={title}>
      {items.map((series) => (
        <div
          key={series.slug}
          onClick={() => handleSeriesClick(series.slug)}
          className="flex-shrink-0 w-64 cursor-pointer group"
        >
          <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-black shadow-lg">
            <ExerciseImage
              src={series.cover_url}
              alt={series.name ?? series.slug}
              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </div>
          <div className="px-1">
            <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {series.name ?? series.slug}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {series.description ?? 'Série de exercícios'}
            </p>
            <div className="text-xs text-muted-foreground/70">
              {series.exercises?.length || 0} exercícios
            </div>
          </div>
        </div>
      ))}
    </HorizontalCarousel>
  );
}
