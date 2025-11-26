// Hook desativado - funcionalidade substituída pelo novo sistema de Nutri IA
export const useFoodDiary = () => {
  return {
    todayMeals: [],
    loading: false,
    addMeal: async (_mealData: any) => null,
    deleteMeal: async (_mealId: string) => {},
    fetchTodayMeals: async () => {},
    calculateDailyTotals: () => ({ calories: 0, protein: 0, carbs: 0, fat: 0 }),
    getMealsByType: (_mealType: string) => [],
  };
};
