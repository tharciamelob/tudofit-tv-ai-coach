import HeroSection from "@/components/HeroSection";
import Header from "@/components/Header";
import { lazy, Suspense } from "react";

const CategoriaCarrossel = lazy(() => import('@/components/CategoriaCarrossel'));

const CATEGORIAS = [
  { slug: 'series-para-emagrecer-rapido', title: 'Séries para emagrecer rápido' },
  { slug: 'crossfit', title: 'Crossfit' },
  { slug: 'series-de-academia-iniciantes', title: 'Séries de academia - iniciantes' },
  { slug: 'series-de-academia-condicionamento', title: 'Séries de academia - condicionamento' },
  { slug: 'series-de-academia-fisioculturismo', title: 'Séries de academia - fisioculturismo' },
  { slug: 'series-para-ganho-de-massa-muscular', title: 'Séries para ganho de massa muscular' },
  { slug: 'treinos-em-casa-sem-equipamento', title: 'Treinos em casa - sem equipamento' },
  { slug: 'treino-de-pilates-sem-equipamentos', title: 'Treino de pilates - sem equipamentos' },
  { slug: 'funcional-de-15-minutos', title: 'Funcional de 15 minutos' },
  { slug: 'calistenia', title: 'Calistenia' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <main className="container mx-auto px-4 py-6">
        {CATEGORIAS.map(c => (
          <Suspense key={c.slug} fallback={<div>Carregando...</div>}>
            <CategoriaCarrossel title={c.title} slug={c.slug} />
          </Suspense>
        ))}
      </main>
    </div>
  );
}