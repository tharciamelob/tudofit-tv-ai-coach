import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type InvalidExercise = {
  id: string;
  slug: string;
  name: string;
  media_url: string;
  subfolder: string;
  basename: string;
};

type RemappableExercise = {
  id: string;
  slug: string;
  basename: string;
  current_url: string;
  valid_url: string;
};

export default function MediaReport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_invalid: 0,
    can_be_remapped: 0,
    needs_upload: 0,
  });
  const [invalidExercises, setInvalidExercises] = useState<InvalidExercise[]>([]);
  const [remappableExercises, setRemappableExercises] = useState<RemappableExercise[]>([]);
  const [applyingFix, setApplyingFix] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all invalid exercises
      const { data: invalidData, error: invalidError } = await supabase
        .from('exercises')
        .select('id, slug, name, media_url')
        .eq('has_valid_media', false);

      if (invalidError) throw invalidError;

      const processed = (invalidData || []).map((ex) => {
        const url = ex.media_url || '';
        const parts = url.split('/');
        const basename = parts[parts.length - 1] || '';
        // Extract subfolder after gifstudofittv/
        const match = url.match(/\/gifstudofittv\/([^/]+)/);
        const subfolder = match ? match[1] : 'unknown';
        return {
          id: ex.id,
          slug: ex.slug,
          name: ex.name,
          media_url: url,
          subfolder,
          basename,
        };
      });

      setInvalidExercises(processed);

      // Fetch valid exercises to find matches
      const { data: validData, error: validError } = await supabase
        .from('exercises')
        .select('media_url')
        .eq('has_valid_media', true)
        .not('media_url', 'is', null);

      if (validError) throw validError;

      // Create basename -> valid URL map
      const validMap = new Map<string, string>();
      (validData || []).forEach((ex) => {
        const url = ex.media_url || '';
        const parts = url.split('/');
        const basename = parts[parts.length - 1] || '';
        if (basename && !validMap.has(basename)) {
          validMap.set(basename, url);
        }
      });

      // Find remappable exercises
      const remappable: RemappableExercise[] = [];
      const needsUploadSet = new Set<string>();

      processed.forEach((ex) => {
        const validUrl = validMap.get(ex.basename);
        if (validUrl) {
          remappable.push({
            id: ex.id,
            slug: ex.slug,
            basename: ex.basename,
            current_url: ex.media_url,
            valid_url: validUrl,
          });
        } else {
          needsUploadSet.add(ex.id);
        }
      });

      setRemappableExercises(remappable);
      setStats({
        total_invalid: processed.length,
        can_be_remapped: remappable.length,
        needs_upload: needsUploadSet.size,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvalidCSV = () => {
    const headers = ['id', 'slug', 'name', 'media_url', 'subfolder', 'basename', 'suggested_storage_path'];
    const rows = invalidExercises.map((ex) => [
      ex.id,
      ex.slug,
      `"${(ex.name || '').replace(/"/g, '""')}"`,
      ex.media_url,
      ex.subfolder,
      ex.basename,
      `workouts/gifstudofittv/${ex.basename}`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exercicios_midia_invalida_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: 'CSV baixado', description: `${invalidExercises.length} exercícios exportados` });
  };

  const downloadRemapSQL = () => {
    const statements = remappableExercises.map(
      (ex) =>
        `UPDATE exercises SET media_url = '${ex.valid_url}', has_valid_media = true WHERE id = '${ex.id}';`
    );
    const sql = `-- Remap ${remappableExercises.length} exercises to existing valid media URLs\n-- Generated on ${new Date().toISOString()}\n\nBEGIN;\n\n${statements.join('\n')}\n\nCOMMIT;\n`;

    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remap_media_urls_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: 'SQL baixado', description: `${remappableExercises.length} comandos UPDATE gerados` });
  };

  const downloadNeedsUploadCSV = () => {
    const needsUpload = invalidExercises.filter(
      (ex) => !remappableExercises.find((r) => r.id === ex.id)
    );
    const headers = ['id', 'slug', 'name', 'media_url', 'subfolder', 'basename', 'upload_path'];
    const rows = needsUpload.map((ex) => [
      ex.id,
      ex.slug,
      `"${(ex.name || '').replace(/"/g, '""')}"`,
      ex.media_url,
      ex.subfolder,
      ex.basename,
      `workouts/gifstudofittv/${ex.basename}`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exercicios_precisa_upload_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: 'CSV baixado', description: `${needsUpload.length} exercícios precisam upload` });
  };

  const applyRemapFix = async () => {
    if (!confirm(`Tem certeza que deseja atualizar ${remappableExercises.length} exercícios?`)) {
      return;
    }

    setApplyingFix(true);
    let fixed = 0;
    let errors = 0;

    try {
      // Process in batches of 50
      for (let i = 0; i < remappableExercises.length; i += 50) {
        const batch = remappableExercises.slice(i, i + 50);
        
        for (const ex of batch) {
          const { error } = await supabase
            .from('exercises')
            .update({ media_url: ex.valid_url, has_valid_media: true })
            .eq('id', ex.id);

          if (error) {
            console.error('Error updating', ex.id, error);
            errors++;
          } else {
            fixed++;
          }
        }
      }

      toast({
        title: 'Correção aplicada',
        description: `${fixed} exercícios corrigidos, ${errors} erros`,
        variant: errors > 0 ? 'destructive' : 'default',
      });

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error applying fix:', error);
      toast({
        title: 'Erro ao aplicar correção',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setApplyingFix(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold mb-2 text-foreground">Relatório de Mídia</h1>
        <p className="text-muted-foreground mb-8">
          Análise de exercícios com mídia inválida e opções de correção
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-destructive/10 border-destructive/30">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-destructive">{stats.total_invalid}</div>
                  <div className="text-sm text-muted-foreground">Exercícios com mídia inválida</div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-yellow-500">{stats.can_be_remapped}</div>
                  <div className="text-sm text-muted-foreground">
                    Podem ser corrigidos (arquivo existe em outra pasta)
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-500/10 border-orange-500/30">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-500">{stats.needs_upload}</div>
                  <div className="text-sm text-muted-foreground">
                    Precisam upload de arquivo
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    CSV - Todos os Inválidos
                  </CardTitle>
                  <CardDescription>
                    Lista completa dos {stats.total_invalid} exercícios com mídia quebrada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={downloadInvalidCSV} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar CSV Completo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    Correção Automática ({stats.can_be_remapped})
                  </CardTitle>
                  <CardDescription>
                    Exercícios cujo arquivo existe em outra pasta do bucket
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={downloadRemapSQL} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar SQL de UPDATE
                  </Button>
                  <Button
                    onClick={applyRemapFix}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={applyingFix || stats.can_be_remapped === 0}
                  >
                    {applyingFix ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Aplicar Correção Agora
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    CSV - Precisa Upload ({stats.needs_upload})
                  </CardTitle>
                  <CardDescription>
                    Exercícios que precisam de upload manual do arquivo GIF
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={downloadNeedsUploadCSV} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar CSV para Upload
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximos Passos</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>1. Clique em "Aplicar Correção Agora" para corrigir {stats.can_be_remapped} exercícios automaticamente</p>
                  <p>2. Baixe o CSV de upload para os {stats.needs_upload} restantes</p>
                  <p>3. Faça upload dos GIFs faltantes no bucket "workouts"</p>
                  <p>4. Execute UPDATE para atualizar os media_url</p>
                </CardContent>
              </Card>
            </div>

            {/* Sample of remappable */}
            {remappableExercises.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amostra de Correções Automáticas</CardTitle>
                  <CardDescription>
                    Mostrando primeiros 10 de {remappableExercises.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2">Slug</th>
                          <th className="text-left p-2">Basename</th>
                          <th className="text-left p-2">URL Válida</th>
                        </tr>
                      </thead>
                      <tbody>
                        {remappableExercises.slice(0, 10).map((ex) => (
                          <tr key={ex.id} className="border-b border-border/50">
                            <td className="p-2 font-mono text-xs">{ex.slug}</td>
                            <td className="p-2 font-mono text-xs">{ex.basename}</td>
                            <td className="p-2 font-mono text-xs truncate max-w-xs">
                              {ex.valid_url.replace('https://czbepdrjixrqrxeyfagc.supabase.co/storage/v1/object/public/', '')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
