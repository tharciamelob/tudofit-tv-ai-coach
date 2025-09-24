import React, { useState, useEffect } from 'react';
import { useExercises, ExerciseFilters } from '@/hooks/useExercises';
import { useSignedUrls } from '@/hooks/useSignedUrls';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExerciseCard = ({ exercise, previewUrl }: { exercise: any; previewUrl?: string }) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300" 
          onClick={() => navigate(`/exercicio/${exercise.slug}`)}>
      <div className="relative aspect-video bg-gray-100 overflow-hidden rounded-t-lg">
        {previewUrl ? (
          <video
            src={previewUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Video load error:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className={`${getDifficultyColor(exercise.difficulty)} text-white`}>
            {exercise.difficulty || 'N/A'}
          </Badge>
        </div>
        {exercise.duration_seconds && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.floor(exercise.duration_seconds / 60)}:{(exercise.duration_seconds % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{exercise.name}</h3>
        <div className="flex flex-wrap gap-2 mb-2 text-sm text-gray-600">
          {exercise.muscle_group && (
            <Badge variant="outline">{exercise.muscle_group}</Badge>
          )}
          {exercise.equipment && (
            <Badge variant="outline">{exercise.equipment}</Badge>
          )}
        </div>
        {exercise.tags && exercise.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {exercise.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
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
      </CardContent>
    </Card>
  );
};

const ExerciseExplorer = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: guardLoading } = useAuthGuard();
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { exercises, loading, error, hasMore, loadMore } = useExercises(filters);

  // Prepare signed URLs for all exercise previews
  const urlItems = exercises.map(exercise => ({
    bucket: 'previews',
    path: exercise.preview_path
  }));
  const { urls: previewUrls } = useSignedUrls(urlItems, 60);

  if (authLoading || guardLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado para explorar os exercícios.</p>
        </div>
      </div>
    );
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Explorar Exercícios</h1>
          
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar exercícios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex flex-wrap gap-4">
              <Select value={filters.muscle_group || ''} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, muscle_group: value || undefined }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Grupo Muscular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pernas">Pernas</SelectItem>
                  <SelectItem value="peito">Peito</SelectItem>
                  <SelectItem value="costas">Costas</SelectItem>
                  <SelectItem value="ombros">Ombros</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="glúteos">Glúteos</SelectItem>
                  <SelectItem value="full-body">Full Body</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.equipment || ''} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, equipment: value || undefined }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Equipamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="sem-equipamento">Sem equipamento</SelectItem>
                  <SelectItem value="halteres">Halteres</SelectItem>
                  <SelectItem value="barra">Barra</SelectItem>
                  <SelectItem value="elástico">Elástico</SelectItem>
                  <SelectItem value="kettlebell">Kettlebell</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.difficulty || ''} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, difficulty: value || undefined }))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>

          {/* Results */}
          {error && (
            <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-lg">
              Erro ao carregar exercícios: {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exercises.map((exercise, index) => (
              <ExerciseCard 
                key={exercise.id} 
                exercise={exercise} 
                previewUrl={previewUrls[index]}
              />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {hasMore && !loading && (
            <div className="flex justify-center mt-8">
              <Button onClick={loadMore} variant="outline">
                Carregar mais
              </Button>
            </div>
          )}

          {!loading && exercises.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum exercício encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseExplorer;