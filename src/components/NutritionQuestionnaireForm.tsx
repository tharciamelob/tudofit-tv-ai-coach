import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useNutritionGeneration } from '@/hooks/useNutritionGeneration';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const foodPreferences = [
  'Vegetariano',
  'Vegano',
  'Low carb',
  'Proteína alta',
  'Sem glúten',
  'Sem lactose',
  'Mediterrânea',
  'Flexível'
];

const commonAllergies = [
  'Amendoim',
  'Nozes',
  'Leite',
  'Ovos',
  'Peixe',
  'Frutos do mar',
  'Soja',
  'Glúten'
];

export const NutritionQuestionnaireForm = ({ onComplete }: { onComplete: (plan: any) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nutrition_goal: '',
    meals_per_day: 4,
    food_preferences: [] as string[],
    food_restrictions: [] as string[],
    allergies: [] as string[]
  });
  
  const { generateNutrition, loading } = useNutritionGeneration();
  const { user } = useAuth();

  const handleArrayChange = (item: string, checked: boolean, field: 'food_preferences' | 'food_restrictions' | 'allergies') => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], item]
        : prev[field].filter(i => i !== item)
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const plan = await generateNutrition({
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
        <CardTitle>Questionário Nutri IA - Etapa {step}/4</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Qual é o seu objetivo nutricional?</Label>
              <Select value={formData.nutrition_goal} onValueChange={(value) => setFormData(prev => ({ ...prev, nutrition_goal: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perder_peso">Perder peso</SelectItem>
                  <SelectItem value="ganhar_massa">Ganhar massa muscular</SelectItem>
                  <SelectItem value="manter_peso">Manter peso atual</SelectItem>
                  <SelectItem value="saude_geral">Melhorar saúde geral</SelectItem>
                  <SelectItem value="performance">Melhorar performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantas refeições por dia você prefere?</Label>
              <Select value={formData.meals_per_day.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, meals_per_day: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 refeições</SelectItem>
                  <SelectItem value="4">4 refeições</SelectItem>
                  <SelectItem value="5">5 refeições</SelectItem>
                  <SelectItem value="6">6 refeições</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <Label>Quais são suas preferências alimentares?</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {foodPreferences.map((preference) => (
                <div key={preference} className="flex items-center space-x-2">
                  <Checkbox
                    id={preference}
                    checked={formData.food_preferences.includes(preference)}
                    onCheckedChange={(checked) => handleArrayChange(preference, checked as boolean, 'food_preferences')}
                  />
                  <Label htmlFor={preference} className="text-sm">{preference}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <Label>Possui alguma restrição alimentar específica?</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {foodPreferences.map((restriction) => (
                <div key={restriction} className="flex items-center space-x-2">
                  <Checkbox
                    id={`restriction-${restriction}`}
                    checked={formData.food_restrictions.includes(restriction)}
                    onCheckedChange={(checked) => handleArrayChange(restriction, checked as boolean, 'food_restrictions')}
                  />
                  <Label htmlFor={`restriction-${restriction}`} className="text-sm">{restriction}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <Label>Possui alguma alergia alimentar?</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {commonAllergies.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={allergy}
                    checked={formData.allergies.includes(allergy)}
                    onCheckedChange={(checked) => handleArrayChange(allergy, checked as boolean, 'allergies')}
                  />
                  <Label htmlFor={allergy} className="text-sm">{allergy}</Label>
                </div>
              ))}
            </div>
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
              disabled={step === 1 && !formData.nutrition_goal}
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
                'Gerar Plano Nutricional'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};