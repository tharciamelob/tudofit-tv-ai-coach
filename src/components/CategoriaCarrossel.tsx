'use client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { fetchSeriesCards, type SeriesCard } from '@/hooks/useCategoryExercises';

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

  return (
    <section className="my-8">
      <h2 className="text-2xl font-semibold mb-6 text-foreground">{title}</h2>
      {loading && <div className="text-muted-foreground">Carregando…</div>}
      {error && <div className="text-destructive">Erro: {error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="text-muted-foreground">Nenhuma série encontrada para esta categoria.</div>
      )}
      
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {items.map((series) => (
          <div
            key={series.slug}
            onClick={() => handleSeriesClick(series.slug)}
            className="flex-shrink-0 w-64 cursor-pointer group"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-black">
              {series.cover_url ? (
                <img
                  src={series.cover_url}
                  alt={series.name ?? series.slug}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <Play className="w-16 h-16 text-white/80" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1">
              {series.name ?? series.slug}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {series.description ?? 'Série de exercícios'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}