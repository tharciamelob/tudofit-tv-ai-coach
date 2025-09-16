import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDown, Info, X } from "lucide-react";
import { usePDFSuggestions } from "@/hooks/usePDFSuggestions";

interface PDFSuggestionCardProps {
  contentType: 'workout' | 'nutrition';
  content: any;
  onGeneratePDF: () => void;
  isGenerating: boolean;
}

export const PDFSuggestionCard = ({ 
  contentType, 
  content, 
  onGeneratePDF, 
  isGenerating 
}: PDFSuggestionCardProps) => {
  const [suggestion, setSuggestion] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { getSuggestion, isLoading } = usePDFSuggestions();

  useEffect(() => {
    const fetchSuggestion = async () => {
      if (content) {
        const result = await getSuggestion(contentType, content);
        setSuggestion(result);
      }
    };

    fetchSuggestion();
  }, [content, contentType, getSuggestion]);

  if (!suggestion || !suggestion.shouldSuggest || !isVisible) {
    return null;
  }

  return (
    <Alert className="mb-6 border-primary/20 bg-primary/5">
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">💡 Sugestão da IA</p>
          <p className="text-sm text-muted-foreground">{suggestion.suggestion}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            onClick={onGeneratePDF}
            disabled={isGenerating}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            {isGenerating ? "Gerando..." : "Gerar PDF"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};