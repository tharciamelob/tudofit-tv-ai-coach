import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const TestOpenAI = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testOpenAI = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Testando OpenAI API...');
      const { data, error } = await supabase.functions.invoke('test-openai', {
        body: {}
      });

      if (error) {
        console.error('Erro ao chamar função de teste:', error);
        setResult({ 
          success: false, 
          error: error.message,
          details: 'Erro ao invocar função de teste'
        });
      } else {
        console.log('Resultado do teste:', data);
        setResult(data);
      }
    } catch (err: any) {
      console.error('Erro no teste:', err);
      setResult({ 
        success: false, 
        error: err.message,
        details: 'Erro inesperado no teste'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8 bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Teste de Diagnóstico OpenAI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Este teste vai verificar se a chave da OpenAI está configurada corretamente.
        </p>
        
        <Button 
          onClick={testOpenAI} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testando...' : 'Testar Configuração OpenAI'}
        </Button>
        
        {result && (
          <div className={`p-4 rounded-lg ${
            result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-semibold">
                {result.success ? 'Teste Passou!' : 'Teste Falhou'}
              </span>
            </div>
            
            <div className="text-sm space-y-2">
              {result.message && (
                <p className="text-foreground">{result.message}</p>
              )}
              
              {result.error && (
                <div>
                  <p className="font-medium text-red-400">Erro:</p>
                  <p className="text-red-300">{result.error}</p>
                </div>
              )}
              
              {result.details && (
                <div>
                  <p className="font-medium text-muted-foreground">Detalhes:</p>
                  <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                    {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.availableKeys && (
                <div>
                  <p className="font-medium text-muted-foreground">Chaves disponíveis:</p>
                  <p className="text-xs">{result.availableKeys.join(', ') || 'Nenhuma'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};