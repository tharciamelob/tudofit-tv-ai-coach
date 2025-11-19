import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchCategoryExercises, CategoryExercise } from "@/hooks/useCategoryExercises";
import { Link } from "react-router-dom";
import { ExerciseImage } from '@/components/ExerciseImage';

interface CategoryCarouselProps {
  categorySlug: string;
  title: string;
}

const CategoryCarousel = ({ categorySlug, title }: CategoryCarouselProps) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    if (categorySlug) {
      fetchCategoryExercises(categorySlug, 24, 0)
        .then((data) => { 
          if (active) setExercises(data); 
        })
        .catch((e) => { 
          if (active) setError(e.message); 
        })
        .finally(() => { 
          if (active) setLoading(false); 
        });
    }
    
    return () => { 
      active = false; 
    };
  }, [categorySlug]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 320; // Width of one card plus gap
    const newScrollLeft = scrollRef.current.scrollLeft + 
      (direction === "left" ? -scrollAmount : scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth"
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'iniciante':
      case 'beginner':
        return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'intermediario':
      case 'intermediate':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
      case 'avançado':
      case 'advanced':
        return 'bg-red-500/20 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins} min`;
  };

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground">{title}</h2>
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="min-w-[300px] h-[200px] bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground">{title}</h2>
        <p className="text-red-500">Erro ao carregar exercícios: {error}</p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground">{title}</h2>
        <p className="text-muted-foreground">Nenhum exercício encontrado para esta categoria.</p>
      </div>
    );
  }

  return (
    <div className="group relative mb-12">
      <h2 className="text-2xl font-bold mb-6 text-foreground">{title}</h2>
      
      <div className="relative">
        {/* Navigation Buttons */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="carousel-nav left-2"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="carousel-nav right-2"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={handleScroll}
        >
          {exercises.map((exercise) => (
            <Card key={exercise.slug} className="min-w-[300px] group/card hover:shadow-lg transition-shadow">
              <div className="relative overflow-hidden rounded-t-lg">
                <ExerciseImage
                  src={exercise.media_url}
                  alt={exercise.name ?? 'Exercício'}
                  className="w-full h-40 object-cover group-hover/card:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {exercise.level && (
                    <Badge className={getDifficultyColor(exercise.level)}>
                      {exercise.level}
                    </Badge>
                  )}
                  {exercise.modality && (
                    <Badge variant="secondary">{exercise.modality}</Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{exercise.name}</h3>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {exercise.equipment && (
                    <Badge variant="outline" className="text-xs">{exercise.equipment}</Badge>
                  )}
                  {exercise.primary_muscle && (
                    <Badge variant="outline" className="text-xs">{exercise.primary_muscle}</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  {exercise.duration_seconds && (
                    <span>{formatDuration(exercise.duration_seconds)}</span>
                  )}
                  {exercise.sets && exercise.reps && (
                    <span>{exercise.sets}x{exercise.reps}</span>
                  )}
                </div>
                
                <Link to={`/exercicio/${exercise.slug}`}>
                  <Button className="w-full">
                    Ver Exercício
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryCarousel;