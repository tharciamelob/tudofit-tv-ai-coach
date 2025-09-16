import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSleepTracking } from '@/hooks/useSleepTracking';
import { Moon, Target } from 'lucide-react';

interface SleepTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SleepTrackingModal = ({ open, onOpenChange }: SleepTrackingModalProps) => {
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState(5);
  const [goal, setGoal] = useState(8);
  const { addSleep, updateSleepGoal, sleepGoal, loading } = useSleepTracking();

  // Atualizar a meta quando o modal abrir
  useEffect(() => {
    if (open && sleepGoal) {
      setGoal(sleepGoal);
    }
  }, [open, sleepGoal]);

  const handleSubmit = async () => {
    if (!bedtime || !wakeTime) return;

    // Converter para ISO string com data de hoje
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const bedtimeISO = `${yesterday}T${bedtime}:00`;
    const wakeTimeISO = `${today}T${wakeTime}:00`;

    await addSleep({
      bedtime: bedtimeISO,
      wakeTime: wakeTimeISO,
      quality
    });
    
    onOpenChange(false);
    setBedtime('');
    setWakeTime('');
    setQuality(5);
  };

  const handleGoalSubmit = async () => {
    if (goal < 1 || goal > 12) return;

    await updateSleepGoal(goal);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-purple-500" />
            Sono
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">Registrar Sono</TabsTrigger>
            <TabsTrigger value="goal">Definir Meta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register" className="space-y-4 mt-4">
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
                disabled={loading || !bedtime || !wakeTime}
                className="flex-1"
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="goal" className="space-y-4 mt-4">
            <div className="text-center mb-4">
              <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Meta de Sono</h3>
              <p className="text-sm text-muted-foreground">Defina sua meta diária de sono</p>
            </div>

            <div>
              <Label htmlFor="sleepGoal">Meta de horas por noite</Label>
              <Input
                id="sleepGoal"
                type="number"
                min="1"
                max="12"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Recomendado: 7-9 horas por noite
              </p>
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
                onClick={handleGoalSubmit}
                disabled={loading || goal < 1 || goal > 12}
                className="flex-1"
              >
                {loading ? 'Salvando...' : 'Salvar Meta'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};