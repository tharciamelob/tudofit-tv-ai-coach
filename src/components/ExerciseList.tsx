import React, { useState } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditExerciseForm {
  id?: string;
  slug: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  preview_path: string;
  video_path: string;
  tags: string;
  duration_seconds: string;
}

export const ExerciseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { exercises, loading, error, refresh } = useExercises({ search: searchQuery });
  const [editingExercise, setEditingExercise] = useState<EditExerciseForm | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleEdit = (exercise: any) => {
    setEditingExercise({
      id: exercise.id,
      slug: exercise.slug,
      name: exercise.name,
      muscle_group: exercise.muscle_group || '',
      equipment: exercise.equipment || '',
      difficulty: exercise.difficulty || '',
      preview_path: exercise.preview_path || '',
      video_path: exercise.video_path || '',
      tags: exercise.tags ? exercise.tags.join(';') : '',
      duration_seconds: exercise.duration_seconds?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingExercise({
      slug: '',
      name: '',
      muscle_group: '',
      equipment: '',
      difficulty: 'beginner',
      preview_path: '',
      video_path: '',
      tags: '',
      duration_seconds: '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingExercise) return;

    setIsSaving(true);
    try {
      const exerciseData = {
        slug: editingExercise.slug,
        name: editingExercise.name,
        muscle_group: editingExercise.muscle_group || null,
        equipment: editingExercise.equipment || null,
        difficulty: editingExercise.difficulty || null,
        preview_path: editingExercise.preview_path || null,
        video_path: editingExercise.video_path || null,
        tags: editingExercise.tags ? editingExercise.tags.split(';').map(t => t.trim()) : null,
        duration_seconds: editingExercise.duration_seconds ? parseInt(editingExercise.duration_seconds) : null,
      };

      let error;
      if (editingExercise.id) {
        // Update existing
        const result = await supabase
          .from('exercises')
          .update(exerciseData)
          .eq('id', editingExercise.id);
        error = result.error;
      } else {
        // Create new
        const result = await supabase
          .from('exercises')
          .insert(exerciseData);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Exercício ${editingExercise.id ? 'atualizado' : 'criado'} com sucesso!`,
      });

      setIsDialogOpen(false);
      setEditingExercise(null);
      refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao salvar exercício',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o exercício "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Exercício excluído com sucesso!",
      });

      refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro ao excluir exercício',
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar exercícios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Exercício
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExercise?.id ? 'Editar Exercício' : 'Novo Exercício'}
              </DialogTitle>
            </DialogHeader>
            
            {editingExercise && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={editingExercise.slug}
                    onChange={(e) => setEditingExercise({...editingExercise, slug: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={editingExercise.name}
                    onChange={(e) => setEditingExercise({...editingExercise, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="muscle_group">Grupo Muscular</Label>
                  <Select value={editingExercise.muscle_group} onValueChange={(value) => 
                    setEditingExercise({...editingExercise, muscle_group: value})}>
                    <SelectTrigger>
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
                </div>
                
                <div>
                  <Label htmlFor="equipment">Equipamento</Label>
                  <Select value={editingExercise.equipment} onValueChange={(value) => 
                    setEditingExercise({...editingExercise, equipment: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-</SelectItem>
                      <SelectItem value="sem-equipamento">Sem equipamento</SelectItem>
                      <SelectItem value="halteres">Halteres</SelectItem>
                      <SelectItem value="barra">Barra</SelectItem>
                      <SelectItem value="elástico">Elástico</SelectItem>
                      <SelectItem value="kettlebell">Kettlebell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select value={editingExercise.difficulty} onValueChange={(value) => 
                    setEditingExercise({...editingExercise, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="duration">Duração (segundos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={editingExercise.duration_seconds}
                    onChange={(e) => setEditingExercise({...editingExercise, duration_seconds: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="preview_path">Preview Path</Label>
                  <Input
                    id="preview_path"
                    value={editingExercise.preview_path}
                    onChange={(e) => setEditingExercise({...editingExercise, preview_path: e.target.value})}
                    placeholder="previews/exercicio.mp4"
                  />
                </div>
                
                <div>
                  <Label htmlFor="video_path">Video Path</Label>
                  <Input
                    id="video_path"
                    value={editingExercise.video_path}
                    onChange={(e) => setEditingExercise({...editingExercise, video_path: e.target.value})}
                    placeholder="workouts/exercicio.mp4"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="tags">Tags (separadas por ;)</Label>
                  <Textarea
                    id="tags"
                    value={editingExercise.tags}
                    onChange={(e) => setEditingExercise({...editingExercise, tags: e.target.value})}
                    placeholder="pernas;glúteos;iniciante"
                    rows={3}
                  />
                </div>
                
                <div className="col-span-2 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          Erro ao carregar exercícios: {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Grupo Muscular</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium">{exercise.name}</TableCell>
                  <TableCell className="font-mono text-sm">{exercise.slug}</TableCell>
                  <TableCell>
                    {exercise.muscle_group && (
                      <Badge variant="outline">{exercise.muscle_group}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {exercise.equipment && (
                      <Badge variant="outline">{exercise.equipment}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {exercise.difficulty && (
                      <Badge className={`${getDifficultyColor(exercise.difficulty)} text-white`}>
                        {exercise.difficulty}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {exercise.duration_seconds ? `${Math.floor(exercise.duration_seconds / 60)}:${(exercise.duration_seconds % 60).toString().padStart(2, '0')}` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(exercise)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(exercise.id, exercise.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && exercises.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum exercício encontrado.</p>
        </div>
      )}
    </div>
  );
};