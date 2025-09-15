import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWaterTracking } from '@/hooks/useWaterTracking';
import { Droplets } from 'lucide-react';

interface WaterTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WaterTrackingModal = ({ open, onOpenChange }: WaterTrackingModalProps) => {
  const [amount, setAmount] = useState(250);
  const { addWater, loading } = useWaterTracking();

  const handleSubmit = async () => {
    await addWater(amount);
    onOpenChange(false);
    setAmount(250);
  };

  const quickAmounts = [200, 250, 300, 500];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Registrar Hidratação
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};