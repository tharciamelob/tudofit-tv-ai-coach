'use client';
import React from 'react';
import { fetchCategoryExercises } from '@/hooks/useCategoryExercises';

type Props = { title: string; slug: string };

export default function CategoriaCarrossel({ title, slug }: Props) {
  const [items, setItems] = React.useState<Awaited<ReturnType<typeof fetchCategoryExercises>>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchCategoryExercises(slug, 24, 0)
      .then((d) => { if (alive) setItems(d); })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  return (
    <section className="my-6">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {loading && <p>Carregando…</p>}
      {error && <p className="text-red-600">Erro: {error}</p>}
      {!loading && !error && items.length === 0 && <p>Nenhum exercício encontrado para esta categoria.</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((ex) => (
          <div key={ex.slug} className="rounded-xl shadow p-2">
            {ex.media_url ? (
              <img src={ex.media_url} alt={ex.name ?? ex.slug} className="w-full h-40 object-cover rounded-lg" loading="lazy" />
            ) : <div className="w-full h-40 bg-gray-100 rounded-lg" />}
            <div className="mt-2 text-sm font-medium line-clamp-2">{ex.name ?? ex.slug}</div>
          </div>
        ))}
      </div>
    </section>
  );
}