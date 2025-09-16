import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSleepTracking } from '@/hooks/useSleepTracking';
import { Moon } from 'lucide-react';

interface SleepTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SleepTrackingModal = ({ open, onOpenChange }: SleepTrackingModalProps) => {
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState(5);
  const { addSleep, loading } = useSleepTracking();

  const handleSubmit = async () => {
    if (!bedtime || !wakeTime) return;

    // Funcionalidade removida - inserção manual no Supabase
    alert('Para registrar sono, insira os dados manualmente na tabela sleep_tracking do Supabase');
    
    onOpenChange(false);
    setBedtime('');
    setWakeTime('');
    setQuality(5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-purple-500" />
            Registrar Sono
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="bedtime">Horário que dormiu (ontem)</Label>
            <Input
              id="bedtime"
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="waketime">Horário que acordou (hoje)</Label>
            <Input
              id="waketime"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Qualidade do sono (1-10)</Label>
            <Select value={quality.toString()} onValueChange={(value) => setQuality(parseInt(value))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num <= 3 ? '(Ruim)' : num <= 6 ? '(Regular)' : num <= 8 ? '(Bom)' : '(Excelente)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!bedtime || !wakeTime}
              className="flex-1"
            >
              Ver no Supabase
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};