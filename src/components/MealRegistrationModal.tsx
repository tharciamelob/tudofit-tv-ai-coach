import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Plus, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFoodDiary } from "@/hooks/useFoodDiary";

interface MealRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const MealRegistrationModal: React.FC<MealRegistrationModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [mealType, setMealType] = useState<string>('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [currentFood, setCurrentFood] = useState<Partial<FoodItem>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addMeal, loading } = useFoodDiary();
  const { toast } = useToast();

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      toast({
        title: "Foto capturada!",
        description: "Foto do prato adicionada com sucesso."
      });
    }
  };

  const addFoodItem = () => {
    if (!currentFood.name || !currentFood.quantity) {
      toast({
        title: "Dados incompletos",
        description: "Nome e quantidade são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newFood: FoodItem = {
      name: currentFood.name!,
      quantity: currentFood.quantity!,
      unit: currentFood.unit || 'g',
      calories: currentFood.calories || 0,
      protein: currentFood.protein || 0,
      carbs: currentFood.carbs || 0,
      fat: currentFood.fat || 0,
    };

    setFoodItems([...foodItems, newFood]);
    setCurrentFood({});
  };

  const removeFoodItem = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    return foodItems.reduce(
      (totals, food) => ({
        calories: totals.calories + (food.calories * food.quantity / 100),
        protein: totals.protein + (food.protein * food.quantity / 100),
        carbs: totals.carbs + (food.carbs * food.quantity / 100),
        fat: totals.fat + (food.fat * food.quantity / 100),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!mealType || foodItems.length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Selecione o tipo de refeição e adicione pelo menos um alimento.",
        variant: "destructive"
      });
      return;
    }

    try {
      const totals = calculateTotals();
      
      await addMeal({
        meal_type: mealType,
        food_name: foodItems.map(f => f.name).join(', '),
        quantity: foodItems.reduce((sum, f) => sum + f.quantity, 0),
        unit: 'g',
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
      });

      // Reset form
      setMealType('');
      setFoodItems([]);
      setCurrentFood({});
      setPhoto(null);
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl">Registrar Refeição</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tipo de Refeição */}
          <div>
            <Label htmlFor="mealType">Tipo de Refeição</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de refeição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cafe-da-manha">Café da Manhã</SelectItem>
                <SelectItem value="lanche-manha">Lanche da Manhã</SelectItem>
                <SelectItem value="almoco">Almoço</SelectItem>
                <SelectItem value="lanche-tarde">Lanche da Tarde</SelectItem>
                <SelectItem value="jantar">Jantar</SelectItem>
                <SelectItem value="ceia">Ceia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Adicionar Manualmente</TabsTrigger>
              <TabsTrigger value="photo">Foto do Prato</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Adicionar Alimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="foodName">Nome do Alimento</Label>
                      <Input
                        id="foodName"
                        placeholder="Ex: Peito de frango"
                        value={currentFood.name || ''}
                        onChange={(e) => setCurrentFood({...currentFood, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantidade</Label>
                      <div className="flex gap-2">
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="100"
                          value={currentFood.quantity || ''}
                          onChange={(e) => setCurrentFood({...currentFood, quantity: Number(e.target.value)})}
                        />
                        <Select 
                          value={currentFood.unit || 'g'} 
                          onValueChange={(value) => setCurrentFood({...currentFood, unit: value})}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="unidade">un</SelectItem>
                            <SelectItem value="colher">col</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="calories">Calorias (per 100g)</Label>
                      <Input
                        id="calories"
                        type="number"
                        placeholder="0"
                        value={currentFood.calories || ''}
                        onChange={(e) => setCurrentFood({...currentFood, calories: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Proteína (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={currentFood.protein || ''}
                        onChange={(e) => setCurrentFood({...currentFood, protein: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carboidrato (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={currentFood.carbs || ''}
                        onChange={(e) => setCurrentFood({...currentFood, carbs: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">Gordura (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={currentFood.fat || ''}
                        onChange={(e) => setCurrentFood({...currentFood, fat: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <Button onClick={addFoodItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Alimento
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photo" className="space-y-4">
              <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Foto do Prato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    {photo ? (
                      <div className="relative">
                        <img 
                          src={URL.createObjectURL(photo)} 
                          alt="Foto da refeição" 
                          className="max-w-full h-48 object-cover rounded-lg mx-auto"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setPhoto(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-8">
                        <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                          Tire uma foto da sua refeição
                        </p>
                        <Button onClick={() => fileInputRef.current?.click()}>
                          <Camera className="h-4 w-4 mr-2" />
                          Capturar Foto
                        </Button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handlePhotoCapture}
                  />

                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      placeholder="Adicione observações sobre a refeição..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Lista de Alimentos Adicionados */}
          {foodItems.length > 0 && (
            <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
              <CardHeader>
                <CardTitle>Alimentos Adicionados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {foodItems.map((food, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {food.quantity}{food.unit} • {Math.round(food.calories * food.quantity / 100)} kcal
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFoodItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Totais */}
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-semibold mb-2">Total da Refeição</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg">{Math.round(totals.calories)}</div>
                      <div className="text-muted-foreground">kcal</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{Math.round(totals.protein * 10) / 10}g</div>
                      <div className="text-muted-foreground">Proteína</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{Math.round(totals.carbs * 10) / 10}g</div>
                      <div className="text-muted-foreground">Carboidrato</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{Math.round(totals.fat * 10) / 10}g</div>
                      <div className="text-muted-foreground">Gordura</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !mealType || foodItems.length === 0}
              className="flex-1"
            >
              {loading ? "Salvando..." : "Registrar Refeição"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};