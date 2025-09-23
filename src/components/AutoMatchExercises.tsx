import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Search, Save, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileMatch {
  id: string;
  filename: string;
  bucket: 'previews' | 'workouts';
  suggestedSlug: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  duration_seconds: number;
  isMatched: boolean;
}

export const AutoMatchExercises = () => {
  const [previewFiles, setPreviewFiles] = useState<any[]>([]);
  const [workoutFiles, setWorkoutFiles] = useState<any[]>([]);
  const [matches, setMatches] = useState<FileMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const createSlugFromFilename = (filename: string): string => {
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const listFiles = async () => {
    setIsLoading(true);
    try {
      // List preview files
      const { data: previewData, error: previewError } = await supabase.storage
        .from('previews')
        .list();

      if (previewError) throw previewError;

      // List workout files
      const { data: workoutData, error: workoutError } = await supabase.storage
        .from('workouts')
        .list();

      if (workoutError) throw workoutError;

      setPreviewFiles(previewData || []);
      setWorkoutFiles(workoutData || []);

      // Create matches based on files
      const allFiles = [
        ...(previewData || []).map(f => ({ ...f, bucket: 'previews' as const })),
        ...(workoutData || []).map(f => ({ ...f, bucket: 'workouts' as const }))
      ];

      const fileMatches: FileMatch[] = allFiles
        .filter(file => file.name && !file.name.startsWith('.'))
        .map((file, index) => {
          const slug = createSlugFromFilename(file.name);
          return {
            id: `${file.bucket}-${index}`,
            filename: file.name,
            bucket: file.bucket,
            suggestedSlug: slug,
            name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            muscle_group: '',
            equipment: 'sem-equipamento',
            difficulty: 'beginner' as const,
            tags: [],
            duration_seconds: 60,
            isMatched: false
          };
        });

      setMatches(fileMatches);
      
      toast({
        title: "Arquivos carregados",
        description: `${fileMatches.length} arquivos encontrados nos buckets.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao listar arquivos',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMatch = (id: string, field: keyof FileMatch, value: any) => {
    setMatches(prev => prev.map(match => 
      match.id === id ? { ...match, [field]: value } : match
    ));
  };

  const removeMatch = (id: string) => {
    setMatches(prev => prev.filter(match => match.id !== id));
  };

  const addNewMatch = () => {
    const newMatch: FileMatch = {
      id: `custom-${Date.now()}`,
      filename: '',
      bucket: 'previews',
      suggestedSlug: '',
      name: '',
      muscle_group: '',
      equipment: 'sem-equipamento',
      difficulty: 'beginner',
      tags: [],
      duration_seconds: 60,
      isMatched: false
    };
    setMatches(prev => [...prev, newMatch]);
  };

  const generateExercises = async () => {
    setIsSaving(true);
    try {
      let success = 0;
      let errors = 0;

      for (const match of matches) {
        if (!match.suggestedSlug || !match.name) continue;

        try {
          const exerciseData = {
            slug: match.suggestedSlug,
            name: match.name,
            muscle_group: match.muscle_group || null,
            equipment: match.equipment || null,
            difficulty: match.difficulty || null,
            preview_path: match.bucket === 'previews' ? match.filename : null,
            video_path: match.bucket === 'workouts' ? match.filename : null,
            tags: match.tags.length > 0 ? match.tags : null,
            duration_seconds: match.duration_seconds || null,
          };

          const { error } = await supabase
            .from('exercises')
            .upsert(exerciseData);

          if (error) throw error;
          success++;
        } catch (error) {
          console.error(`Erro ao criar exercício ${match.suggestedSlug}:`, error);
          errors++;
        }
      }

      toast({
        title: "Exercícios gerados",
        description: `${success} exercícios criados com sucesso${errors > 0 ? `, ${errors} erros` : ''}!`,
      });

      if (success > 0) {
        setMatches([]);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao gerar exercícios',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Esta ferramenta lista arquivos dos buckets de mídia e sugere exercícios baseados nos nomes dos arquivos.
        </p>
        
        <Button onClick={listFiles} disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Listar Arquivos dos Buckets
        </Button>
      </div>

      {(previewFiles.length > 0 || workoutFiles.length > 0) && (
        <Alert>
          <AlertDescription>
            Encontrados: {previewFiles.length} arquivos de preview e {workoutFiles.length} arquivos de workout.
          </AlertDescription>
        </Alert>
      )}

      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Exercícios Sugeridos</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addNewMatch}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Manual
              </Button>
              <Button onClick={generateExercises} disabled={isSaving}>
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Gerar Exercícios
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Bucket</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Grupo Muscular</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead>Duração (s)</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-mono text-sm">
                      {match.filename || 'Manual'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={match.bucket === 'previews' ? 'default' : 'secondary'}>
                        {match.bucket}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={match.suggestedSlug}
                        onChange={(e) => updateMatch(match.id, 'suggestedSlug', e.target.value)}
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={match.name}
                        onChange={(e) => updateMatch(match.id, 'name', e.target.value)}
                        className="w-48"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={match.muscle_group}
                        onValueChange={(value) => updateMatch(match.id, 'muscle_group', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-</SelectItem>
                          <SelectItem value="pernas">Pernas</SelectItem>
                          <SelectItem value="peito">Peito</SelectItem>
                          <SelectItem value="costas">Costas</SelectItem>
                          <SelectItem value="ombros">Ombros</SelectItem>
                          <SelectItem value="core">Core</SelectItem>
                          <SelectItem value="glúteos">Glúteos</SelectItem>
                          <SelectItem value="full-body">Full Body</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={match.equipment}
                        onValueChange={(value) => updateMatch(match.id, 'equipment', value)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sem-equipamento">Sem equipamento</SelectItem>
                          <SelectItem value="halteres">Halteres</SelectItem>
                          <SelectItem value="barra">Barra</SelectItem>
                          <SelectItem value="elástico">Elástico</SelectItem>
                          <SelectItem value="kettlebell">Kettlebell</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={match.difficulty}
                        onValueChange={(value) => updateMatch(match.id, 'difficulty', value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Iniciante</SelectItem>
                          <SelectItem value="intermediate">Intermediário</SelectItem>
                          <SelectItem value="advanced">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={match.duration_seconds}
                        onChange={(e) => updateMatch(match.id, 'duration_seconds', parseInt(e.target.value))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMatch(match.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};