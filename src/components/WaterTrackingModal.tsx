import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useWaterTracking } from '@/hooks/useWaterTracking';
import { Droplets, Target, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface WaterTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
}

export const WaterTrackingModal = ({ open, onOpenChange, initialDate }: WaterTrackingModalProps) => {
  const [amount, setAmount] = useState(250);
  const [goalAmount, setGoalAmount] = useState(2000);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const { addWater, updateDailyGoal, loading, dailyGoal } = useWaterTracking();

  // Atualizar a data selecionada quando initialDate mudar
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate, open]);

  const handleSubmit = async () => {
    await addWater(amount, selectedDate.toISOString().split('T')[0]);
    onOpenChange(false);
    setAmount(250);
    setSelectedDate(new Date());
  };

  const handleGoalUpdate = async () => {
    await updateDailyGoal(goalAmount);
    onOpenChange(false);
  };

  const quickAmounts = [200, 250, 300, 500];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Hidratação
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Adicionar Água</TabsTrigger>
            <TabsTrigger value="goal">Definir Meta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4">
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
              <Label htmlFor="amount">Quantidade (ml)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                min="50"
                max="1000"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Quantidades rápidas</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount)}
                    className={amount === quickAmount ? 'bg-primary text-primary-foreground' : ''}
                  >
                    {quickAmount}ml
                  </Button>
                ))}
              </div>
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
                disabled={loading || amount <= 0}
                className="flex-1"
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="goal" className="space-y-4">
            <div>
              <Label htmlFor="goal">Meta diária (ml)</Label>
              <Input
                id="goal"
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(parseInt(e.target.value) || 2000)}
                min="1000"
                max="5000"
                step="250"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Meta atual: {dailyGoal}ml
              </p>
            </div>

            <div>
              <Label>Metas sugeridas</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[1500, 2000, 2500, 3000, 3500, 4000].map((suggestedGoal) => (
                  <Button
                    key={suggestedGoal}
                    variant="outline"
                    size="sm"
                    onClick={() => setGoalAmount(suggestedGoal)}
                    className={goalAmount === suggestedGoal ? 'bg-primary text-primary-foreground' : ''}
                  >
                    {suggestedGoal}ml
                  </Button>
                ))}
              </div>
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
                onClick={handleGoalUpdate}
                disabled={loading || goalAmount <= 0}
                className="flex-1"
              >
                <Target className="h-4 w-4 mr-2" />
                {loading ? 'Atualizando...' : 'Atualizar Meta'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};