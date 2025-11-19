import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Zap, PlayCircle } from 'lucide-react';
import { useExercises, ExerciseFilters } from '@/hooks/useExercises';
import { useSignedUrls } from '@/hooks/useSignedUrls';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ExerciseImage } from '@/components/ExerciseImage';

interface ExerciseGridProps {
  filters?: ExerciseFilters;
  showLoadMore?: boolean;
  maxItems?: number;
}

export const ExerciseGrid: React.FC<ExerciseGridProps> = ({ 
  filters = {},
  showLoadMore = true,
  maxItems 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { exercises, loading, error, hasMore, loadMore } = useExercises(filters);
  const [loadingMore, setLoadingMore] = useState(false);

  const displayedExercises = maxItems ? exercises.slice(0, maxItems) : exercises;
  
  // Prepare items for signed URLs
  const urlItems = displayedExercises.map(exercise => ({
    bucket: 'previews',
    path: exercise.preview_path
  }));

  const { urls: previewUrls, loading: urlsLoading } = useSignedUrls(urlItems, 60);

  // Show loading if auth or data is loading
  if (authLoading || loading) {
    return <div className="text-center py-8">Carregando exercícios...</div>;
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <div className="text-center py-8">Você precisa estar logado para ver os exercícios.</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Erro: {error}</div>;
  }

  const handleLoadMore = async () => {
    if (!loadingMore && hasMore && showLoadMore) {
      setLoadingMore(true);
      await loadMore();
      setLoadingMore(false);
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500 text-white';
      case 'intermediate': return 'bg-yellow-500 text-white';
      case 'advanced': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedExercises.map((exercise, index) => {
          const previewUrl = previewUrls[index];
          
          return (
            <Card key={exercise.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
                  <ExerciseImage
                    src={previewUrl}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                    isVideo={true}
                    autoPlay={true}
                    loop={true}
                    muted={true}
                    playsInline={true}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{exercise.name}</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {exercise.difficulty && (
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty === 'beginner' ? 'Iniciante' : 
                         exercise.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                      </Badge>
                    )}
                    {exercise.muscle_group && (
                      <Badge variant="outline">{exercise.muscle_group}</Badge>
                    )}
                    {exercise.equipment && (
                      <Badge variant="outline">{exercise.equipment}</Badge>
                    )}
                  </div>

                  {exercise.duration_seconds && (
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(exercise.duration_seconds)}
                    </div>
                  )}

                  {exercise.tags && exercise.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {exercise.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {exercise.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{exercise.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link to={`/exercicio/${exercise.slug}`}>
                    <Zap className="w-4 h-4 mr-2" />
                    Ver Exercício
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {loadingMore && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      )}

      {showLoadMore && hasMore && !maxItems && (
        <div className="text-center">
          <Button 
            onClick={handleLoadMore} 
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore ? 'Carregando...' : 'Carregar Mais'}
          </Button>
        </div>
      )}

      {!loading && exercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum exercício encontrado.</p>
        </div>
      )}
    </div>
  );
};