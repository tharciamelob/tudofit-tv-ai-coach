import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSleepTracking } from '@/hooks/useSleepTracking';
import { Moon, Target, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SleepTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
}

export const SleepTrackingModal = ({ open, onOpenChange, initialDate }: SleepTrackingModalProps) => {
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState(5);
  const [goal, setGoal] = useState(8);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const { addSleep, updateSleepGoal, sleepGoal, loading } = useSleepTracking();

  // Atualizar a meta quando o modal abrir
  useEffect(() => {
    if (open && sleepGoal) {
      setGoal(sleepGoal);
    }
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [open, sleepGoal, initialDate]);

  const handleSubmit = async () => {
    if (!bedtime || !wakeTime || !selectedDate) return;

    // Usar a data selecionada
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);
    const previousDateStr = previousDate.toISOString().split('T')[0];
    
    const bedtimeISO = `${previousDateStr}T${bedtime}:00`;
    const wakeTimeISO = `${selectedDateStr}T${wakeTime}:00`;

    await addSleep({
      bedtime: bedtimeISO,
      wakeTime: wakeTimeISO,
      quality,
      date: selectedDateStr
    });
    
    onOpenChange(false);
    setBedtime('');
    setWakeTime('');
    setQuality(5);
    setSelectedDate(new Date());
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
              <Label>Data do registro</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="bedtime">Horário que dormiu</Label>
              <Input
                id="bedtime"
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="waketime">Horário que acordou</Label>
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