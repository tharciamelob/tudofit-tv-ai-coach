import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWaterTracking } from '@/hooks/useWaterTracking';
import { Droplets, Target } from 'lucide-react';

interface WaterTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WaterTrackingModal = ({ open, onOpenChange }: WaterTrackingModalProps) => {
  const [amount, setAmount] = useState(250);
  const [goalAmount, setGoalAmount] = useState(2000);
  const { addWater, updateDailyGoal, loading, dailyGoal } = useWaterTracking();

  const handleSubmit = async () => {
    await addWater(amount);
    onOpenChange(false);
    setAmount(250);
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