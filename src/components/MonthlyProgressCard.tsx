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
  Calendar,
  TrendingUp,
  Target
} from 'lucide-react';

const MonthlyProgressCard = () => {
  const { stats, loading, monthName } = useMonthlyStats();

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

  // Format water total in liters
  const waterTotalLiters = (stats.waterIntake.total / 1000).toFixed(1);

  const progressData = [
    {
      icon: Droplets,
      title: 'Hidratação',
      value: `${waterTotalLiters}L`,
      subtitle: `${stats.waterIntake.daysWithGoal} dias com meta batida`,
      progress: stats.waterIntake.progressPercent,
      color: 'text-blue-500',
      bgColor: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Moon,
      title: 'Sono',
      value: `${stats.sleep.avgHours}h média`,
      subtitle: `${stats.sleep.totalNights} noites registradas`,
      progress: stats.sleep.progressPercent,
      color: 'text-purple-500',
      bgColor: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Footprints,
      title: 'Caminhadas',
      value: `${stats.walking.totalDistance}km`,
      subtitle: `${stats.walking.totalSessions} sessões`,
      progress: stats.walking.progressPercent,
      color: 'text-green-500',
      bgColor: 'from-green-500 to-emerald-600'
    },
    {
      icon: Utensils,
      title: 'Alimentação',
      value: `${stats.foodDiary.activeDays} dias`,
      subtitle: `${stats.foodDiary.totalEntries} registros`,
      progress: 0, // No food tracking data yet
      color: 'text-orange-500',
      bgColor: 'from-orange-500 to-red-600'
    }
  ];

  // Calculate average progress (only from metrics with data)
  const activeMetrics = [
    stats.waterIntake.progressPercent,
    stats.sleep.progressPercent,
    stats.walking.progressPercent,
  ].filter(p => p > 0 || stats.waterIntake.total > 0 || stats.sleep.totalNights > 0 || stats.walking.totalSessions > 0);
  
  const avgProgress = activeMetrics.length > 0 
    ? Math.round(activeMetrics.reduce((a, b) => a + b, 0) / Math.max(activeMetrics.length, 1))
    : 0;

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
                {avgProgress}% das metas
              </p>
              {stats.walking.totalCalories > 0 && (
                <p className="text-xs text-muted-foreground">
                  {stats.walking.totalCalories} calorias queimadas
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyProgressCard;
