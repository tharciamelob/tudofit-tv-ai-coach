// Hook desativado - funcionalidade substituída pelo novo sistema de Nutri IA
interface MonthlyStats {
  waterIntake: {
    total: number;
    daysWithGoal: number;
    avgDaily: number;
  };
  sleep: {
    avgHours: number;
    daysWithGoal: number;
    totalNights: number;
  };
  walking: {
    totalDistance: number;
    totalSessions: number;
    totalCalories: number;
  };
  foodDiary: {
    totalEntries: number;
    activeDays: number;
  };
  workouts: {
    totalWorkouts: number;
    activeDays: number;
  };
}

export const useMonthlyStats = () => {
  const stats: MonthlyStats = {
    waterIntake: { total: 0, daysWithGoal: 0, avgDaily: 0 },
    sleep: { avgHours: 0, daysWithGoal: 0, totalNights: 0 },
    walking: { totalDistance: 0, totalSessions: 0, totalCalories: 0 },
    foodDiary: { totalEntries: 0, activeDays: 0 },
    workouts: { totalWorkouts: 0, activeDays: 0 }
  };

  return {
    stats,
    loading: false,
    monthName: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    getProgressPercentage: (_current: number, _target: number) => 0,
    refetch: async () => {}
  };
};
