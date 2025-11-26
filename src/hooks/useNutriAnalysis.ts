// Hook desativado - funcionalidade substituída pelo novo sistema de Nutri IA
interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionResult {
  ok: boolean;
  meal_type: string;
  foods: FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const useNutriAnalysis = () => {
  return {
    loading: false,
    result: null as NutritionResult | null,
    analyzeText: async (_text: string, _mealType?: string) => null,
    analyzePhoto: async (_photoFile: File, _mealType?: string) => null,
    saveToDiary: async (_nutritionData: any) => false,
    clearResult: () => {},
    setResult: (_result: any) => {}
  };
};
