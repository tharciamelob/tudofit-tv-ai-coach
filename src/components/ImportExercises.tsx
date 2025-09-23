import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Check, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExerciseCSVRow {
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

export const ImportExercises = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<ExerciseCSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; errors: number } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setCsvData([]);
      setValidationErrors([]);
      setImportResults(null);
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive"
      });
    }
  };

  const parseCsv = (csvText: string): ExerciseCSVRow[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const expectedHeaders = ['slug', 'name', 'muscle_group', 'equipment', 'difficulty', 'preview_path', 'video_path', 'tags', 'duration_seconds'];
    
    if (!expectedHeaders.every(header => headers.includes(header))) {
      throw new Error(`CSV deve conter as colunas: ${expectedHeaders.join(', ')}`);
    }
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row as ExerciseCSVRow;
      });
  };

  const validateCsv = async () => {
    if (!file) return;

    setIsValidating(true);
    setValidationErrors([]);

    try {
      const csvText = await file.text();
      const data = parseCsv(csvText);
      setCsvData(data);

      const errors: string[] = [];
      const slugs = new Set();

      // Check for duplicate slugs in CSV
      data.forEach((row, index) => {
        if (!row.slug) {
          errors.push(`Linha ${index + 2}: Slug obrigatório`);
        } else if (slugs.has(row.slug)) {
          errors.push(`Linha ${index + 2}: Slug duplicado "${row.slug}"`);
        } else {
          slugs.add(row.slug);
        }

        if (!row.name) {
          errors.push(`Linha ${index + 2}: Nome obrigatório`);
        }

        if (row.difficulty && !['beginner', 'intermediate', 'advanced'].includes(row.difficulty)) {
          errors.push(`Linha ${index + 2}: Dificuldade deve ser beginner, intermediate ou advanced`);
        }

        if (row.duration_seconds && isNaN(Number(row.duration_seconds))) {
          errors.push(`Linha ${index + 2}: Duration_seconds deve ser um número`);
        }
      });

      // Check for existing slugs in database
      if (data.length > 0) {
        const existingSlugs = data.map(row => row.slug);
        const { data: existingExercises, error } = await supabase
          .from('exercises')
          .select('slug')
          .in('slug', existingSlugs);

        if (error) throw error;

        existingExercises?.forEach(existing => {
          errors.push(`Slug "${existing.slug}" já existe no banco de dados`);
        });
      }

      setValidationErrors(errors);

      if (errors.length === 0) {
        toast({
          title: "Validação concluída",
          description: `${data.length} exercícios validados com sucesso!`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao validar CSV';
      setValidationErrors([errorMessage]);
    } finally {
      setIsValidating(false);
    }
  };

  const importExercises = async () => {
    if (csvData.length === 0 || validationErrors.length > 0) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      let success = 0;
      let errors = 0;

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        try {
          const exerciseData = {
            slug: row.slug,
            name: row.name,
            muscle_group: row.muscle_group || null,
            equipment: row.equipment || null,
            difficulty: row.difficulty || null,
            preview_path: row.preview_path || null,
            video_path: row.video_path || null,
            tags: row.tags ? row.tags.split(';').map(t => t.trim()) : null,
            duration_seconds: row.duration_seconds ? parseInt(row.duration_seconds) : null,
          };

          const { error } = await supabase
            .from('exercises')
            .upsert(exerciseData);

          if (error) throw error;
          success++;
        } catch (error) {
          console.error(`Erro na linha ${i + 2}:`, error);
          errors++;
        }

        setImportProgress(((i + 1) / csvData.length) * 100);
      }

      setImportResults({ success, errors });
      
      toast({
        title: "Importação concluída",
        description: `${success} exercícios importados com sucesso${errors > 0 ? `, ${errors} erros` : ''}!`,
      });
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `slug,name,muscle_group,equipment,difficulty,preview_path,video_path,tags,duration_seconds
agachamento-livre,Agachamento Livre,pernas,sem-equipamento,beginner,previews/agachamento-livre.mp4,workouts/agachamento-livre.mp4,pernas;glúteos;iniciante,120
flexao-bracos,Flexão de Braços,peito,sem-equipamento,beginner,previews/flexao-bracos.mp4,workouts/flexao-bracos.mp4,peito;tríceps;core,90`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-exercicios.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Faça upload de um arquivo CSV com os exercícios para importar em lote.
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Baixar Modelo
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="csv-file">Arquivo CSV</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-1"
          />
        </div>

        {file && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Arquivo selecionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={validateCsv} 
            disabled={!file || isValidating}
            variant="outline"
          >
            {isValidating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Validar CSV
          </Button>

          <Button 
            onClick={importExercises}
            disabled={csvData.length === 0 || validationErrors.length > 0 || isImporting}
          >
            {isImporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Importar Exercícios
          </Button>
        </div>

        {isImporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importando exercícios...</span>
              <span>{Math.round(importProgress)}%</span>
            </div>
            <Progress value={importProgress} className="w-full" />
          </div>
        )}

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold">Erros encontrados:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {csvData.length > 0 && validationErrors.length === 0 && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              CSV validado com sucesso! {csvData.length} exercícios prontos para importação.
            </AlertDescription>
          </Alert>
        )}

        {importResults && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Importação concluída: {importResults.success} sucessos, {importResults.errors} erros.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};