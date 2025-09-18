import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Send, Loader2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UnifiedMealInputProps {
  onSubmit: (data: { text?: string; photo?: File; mealType: string }) => void;
  loading?: boolean;
  placeholder?: string;
}

export const UnifiedMealInput = ({ 
  onSubmit, 
  loading = false, 
  placeholder = "Descreva sua refeição ou tire uma foto..." 
}: UnifiedMealInputProps) => {
  const [text, setText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mealType, setMealType] = useState('lanche');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mealTypes = [
    { value: 'cafe_da_manha', label: 'Café da manhã' },
    { value: 'almoco', label: 'Almoço' },
    { value: 'lanche', label: 'Lanche' },
    { value: 'jantar', label: 'Jantar' },
    { value: 'ceia', label: 'Ceia' }
  ];

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!text.trim() && !selectedPhoto) return;

    onSubmit({
      text: text.trim() || undefined,
      photo: selectedPhoto || undefined,
      mealType
    });

    // Reset form
    setText('');
    removePhoto();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20 border-white/10">
      <CardContent className="p-4">
        {/* Meal Type Selection */}
        <div className="mb-4">
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger className="w-full bg-background/50 border-white/20">
              <SelectValue placeholder="Tipo de refeição" />
            </SelectTrigger>
            <SelectContent>
              {mealTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Photo Preview */}
        {previewUrl && (
          <div className="mb-4 relative">
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted border border-white/20">
              <img 
                src={previewUrl} 
                alt="Preview da refeição" 
                className="w-full h-full object-contain bg-muted"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-red-500/80 hover:bg-red-500"
                onClick={removePhoto}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Foto selecionada para análise
            </p>
          </div>
        )}

        {/* Text Input */}
        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="min-h-[80px] bg-background/50 border-white/20 resize-none"
            disabled={loading}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-background/50 border-white/20 hover:bg-background/70"
              >
                <Camera className="h-4 w-4" />
              </Button>
              
              {selectedPhoto && (
                <span className="text-xs text-muted-foreground">
                  Foto selecionada
                </span>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={(!text.trim() && !selectedPhoto) || loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Analisar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};