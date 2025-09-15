import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useWorkoutGeneration } from '@/hooks/useWorkoutGeneration';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const equipmentOptions = [
  'Halteres',
  'Barras',
  'Kettlebells',
  'Elásticos',
  'Barra fixa',
  'Banco',
  'Esteira',
  'Bicicleta ergométrica',
  'Apenas peso corporal'
];

export const PersonalQuestionnaireForm = ({ onComplete }: { onComplete: (plan: any) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fitness_goal: '',
    fitness_level: '',
    available_time: 30,
    weekly_frequency: 3,
    available_equipment: [] as string[],
    physical_restrictions: ''
  });
  
  const { generateWorkout, loading } = useWorkoutGeneration();
  const { user } = useAuth();

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      available_equipment: checked
        ? [...prev.available_equipment, equipment]
        : prev.available_equipment.filter(e => e !== equipment)
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const plan = await generateWorkout({
      ...formData,
      user_id: user.id
    });
    
    if (plan) {
      onComplete(plan);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Questionário Personal IA - Etapa {step}/4</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fitness_goal">Qual é o seu objetivo principal?</Label>
              <Select value={formData.fitness_goal} onValueChange={(value) => setFormData(prev => ({ ...prev, fitness_goal: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perder_peso">Perder peso</SelectItem>
                  <SelectItem value="ganhar_massa">Ganhar massa muscular</SelectItem>
                  <SelectItem value="tonificar">Tonificar o corpo</SelectItem>
                  <SelectItem value="resistencia">Melhorar resistência</SelectItem>
                  <SelectItem value="saude_geral">Saúde geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="fitness_level">Qual é o seu nível de condicionamento?</Label>
              <Select value={formData.fitness_level} onValueChange={(value) => setFormData(prev => ({ ...prev, fitness_level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="available_time">Tempo disponível por treino (minutos)</Label>
              <Input
                type="number"
                value={formData.available_time}
                onChange={(e) => setFormData(prev => ({ ...prev, available_time: parseInt(e.target.value) }))}
                min="15"
                max="120"
              />
            </div>
            
            <div>
              <Label htmlFor="weekly_frequency">Quantas vezes por semana pode treinar?</Label>
              <Select value={formData.weekly_frequency.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, weekly_frequency: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x por semana</SelectItem>
                  <SelectItem value="3">3x por semana</SelectItem>
                  <SelectItem value="4">4x por semana</SelectItem>
                  <SelectItem value="5">5x por semana</SelectItem>
                  <SelectItem value="6">6x por semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <Label>Que equipamentos você tem disponível?</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {equipmentOptions.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment}
                    checked={formData.available_equipment.includes(equipment)}
                    onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                  />
                  <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <Label htmlFor="restrictions">Possui alguma restrição física ou lesão? (opcional)</Label>
            <Textarea
              value={formData.physical_restrictions}
              onChange={(e) => setFormData(prev => ({ ...prev, physical_restrictions: e.target.value }))}
              placeholder="Descreva qualquer limitação física que devemos considerar..."
              className="mt-2"
            />
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Voltar
            </Button>
          )}
          
          {step < 4 ? (
            <Button 
              onClick={nextStep} 
              disabled={
                (step === 1 && (!formData.fitness_goal || !formData.fitness_level)) ||
                (step === 2 && (!formData.available_time || !formData.weekly_frequency))
              }
              className="ml-auto"
            >
              Próximo
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="ml-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Treino'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};