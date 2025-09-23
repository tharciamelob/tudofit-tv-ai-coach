import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExercise } from '@/hooks/useExercises';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Clock, Target, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ExerciseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { exercise, loading, error } = useExercise(slug || '');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const getMediaUrls = async () => {
      if (exercise) {
        if (exercise.video_path) {
          const { data } = await supabase.storage
            .from('workouts')
            .getPublicUrl(exercise.video_path);
          setVideoUrl(data.publicUrl);
        }
        
        if (exercise.preview_path) {
          const { data } = await supabase.storage
            .from('previews')
            .getPublicUrl(exercise.preview_path);
          setPreviewUrl(data.publicUrl);
        }
      }
    };
    getMediaUrls();
  }, [exercise]);

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Exercício não encontrado</h2>
          <p className="text-gray-600 mb-6">{error || 'O exercício solicitado não existe.'}</p>
          <Button onClick={() => navigate('/exercicios')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos exercícios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/exercicios')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos exercícios
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Player */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-cover"
                      poster={previewUrl || undefined}
                    >
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  ) : previewUrl ? (
                    <video
                      src={previewUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exercise Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4">{exercise.name}</h1>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {exercise.difficulty && (
                  <Badge className={`${getDifficultyColor(exercise.difficulty)} text-white`}>
                    {exercise.difficulty === 'beginner' ? 'Iniciante' : 
                     exercise.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Exercise Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exercise.muscle_group && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Grupo Muscular
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="font-semibold capitalize">{exercise.muscle_group}</p>
                  </CardContent>
                </Card>
              )}

              {exercise.equipment && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Dumbbell className="h-4 w-4 mr-2" />
                      Equipamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="font-semibold capitalize">{exercise.equipment}</p>
                  </CardContent>
                </Card>
              )}

              {exercise.duration_seconds && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Duração
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="font-semibold">{formatDuration(exercise.duration_seconds)}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tags */}
            {exercise.tags && exercise.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {exercise.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;