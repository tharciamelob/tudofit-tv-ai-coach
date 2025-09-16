import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { 
  Droplets, 
  Moon, 
  Footprints, 
  Utensils,
  Dumbbell,
  Calendar,
  TrendingUp,
  Target
} from 'lucide-react';

const MonthlyProgressCard = () => {
  const { stats, loading, monthName, getProgressPercentage } = useMonthlyStats();

  if (loading) {
    return (
      <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Progresso Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentMonth = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  const progressData = [
    {
      icon: Droplets,
      title: 'Hidratação',
      value: `${stats.waterIntake.total}L`,
      subtitle: `${stats.waterIntake.daysWithGoal} dias com meta`,
      progress: getProgressPercentage(stats.waterIntake.daysWithGoal, currentMonth),
      color: 'text-blue-500',
      bgColor: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Moon,
      title: 'Sono',
      value: `${stats.sleep.avgHours}h`,
      subtitle: `${stats.sleep.daysWithGoal} noites com 8h+`,
      progress: getProgressPercentage(stats.sleep.daysWithGoal, currentMonth),
      color: 'text-purple-500',
      bgColor: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Footprints,
      title: 'Caminhadas',
      value: `${stats.walking.totalDistance}km`,
      subtitle: `${stats.walking.totalSessions} sessões`,
      progress: getProgressPercentage(stats.walking.totalSessions, 20), // Target: 20 sessions/month
      color: 'text-green-500',
      bgColor: 'from-green-500 to-emerald-600'
    },
    {
      icon: Utensils,
      title: 'Alimentação',
      value: `${stats.foodDiary.activeDays} dias`,
      subtitle: `${stats.foodDiary.totalEntries} registros`,
      progress: getProgressPercentage(stats.foodDiary.activeDays, currentMonth),
      color: 'text-orange-500',
      bgColor: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Progresso Mensal
          </CardTitle>
          <Badge variant="outline" className="capitalize">
            {monthName}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          Dia {currentMonth} de {daysInMonth}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {progressData.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`bg-gradient-to-br ${item.bgColor} rounded-lg w-8 h-8 flex items-center justify-center mr-3`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.progress}%</p>
                </div>
              </div>
              <Progress 
                value={item.progress} 
                className="h-2"
              />
            </div>
          );
        })}

        {/* Monthly Summary */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Target className="h-4 w-4 mr-1" />
              Resumo do mês:
            </div>
            <div className="text-right">
              <p className="font-medium">
                {Math.round((
                  getProgressPercentage(stats.waterIntake.daysWithGoal, currentMonth) +
                  getProgressPercentage(stats.sleep.daysWithGoal, currentMonth) +
                  getProgressPercentage(stats.walking.totalSessions, 20) +
                  getProgressPercentage(stats.foodDiary.activeDays, currentMonth)
                ) / 4)}% das metas
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.walking.totalCalories > 0 && `${stats.walking.totalCalories} calorias queimadas`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyProgressCard;