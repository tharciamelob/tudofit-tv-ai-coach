import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSleepTracking } from '@/hooks/useSleepTracking';
import { Target } from 'lucide-react';

interface SleepGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoal: number;
}

export const SleepGoalModal = ({ open, onOpenChange, currentGoal }: SleepGoalModalProps) => {
  const [goal, setGoal] = useState(currentGoal);
  const { updateSleepGoal, loading } = useSleepTracking();

  const handleSubmit = async () => {
    if (goal < 1 || goal > 12) return;

    await updateSleepGoal(goal);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Meta de Sono
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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
              onClick={handleSubmit}
              disabled={loading || goal < 1 || goal > 12}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar Meta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};