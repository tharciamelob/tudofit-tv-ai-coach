import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { WaterTrackingModal } from "@/components/WaterTrackingModal";
import { SleepTrackingModal } from "@/components/SleepTrackingModal";
import { useWaterTracking } from "@/hooks/useWaterTracking";
import { useSleepTracking } from "@/hooks/useSleepTracking";
import { useAuth } from "@/contexts/AuthContext";
import { Droplets, Moon, Plus, TrendingUp, Trash2 } from "lucide-react";

export default function Monitoring() {
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [sleepModalOpen, setSleepModalOpen] = useState(false);
  const [selectedEditDate, setSelectedEditDate] = useState<Date | null>(null);
  const { user } = useAuth();
  const { todayWater, dailyGoal, progress, weeklyData: waterWeekly, deleteAllWaterForDate } = useWaterTracking();
  const { todaySleep, sleepGoal, progress: sleepProgress, deleteSleepEntry, weeklyData: sleepWeekly, deleteSleepByDate, formatSleepDuration } = useSleepTracking();

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 pt-20 pb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Faça login para acessar o Monitoramento</h1>
            <p className="text-muted-foreground">Você precisa estar logado para acompanhar sua hidratação e sono.</p>
          </div>
        </main>
      </div>
    );
  }

  // formatSleepDuration is now handled by the useSleepTracking hook

  const getWaterAnalysis = (progress: number) => {
    if (progress >= 100) {
      return <p className="text-sm text-green-500 font-medium">✅ Excelente! Meta atingida!</p>;
    } else if (progress >= 80) {
      return <p className="text-sm text-blue-500 font-medium">🎯 Quase lá! Continue bebendo água.</p>;
    } else if (progress >= 50) {
      return <p className="text-sm text-yellow-500 font-medium">⚠️ Metade do caminho. Mantenha o ritmo!</p>;
    } else {
      return <p className="text-sm text-red-500 font-medium">💧 Beba mais água! Você precisa se hidratar.</p>;
    }
  };

  const getSleepAnalysis = (sleepData: any, progress: number) => {
    const quality = sleepData.sleep_quality;
    
    let message = "";
    let color = "";
    
    if (progress >= 100 && quality >= 4) {
      message = "😴 Sono perfeito! Meta atingida com boa qualidade.";
      color = "text-green-500";
    } else if (progress >= 80 && quality >= 3) {
      message = "🌙 Bom sono! Quase na meta ideal.";
      color = "text-blue-500";
    } else if (progress < 70) {
      message = "⏰ Durma mais! Você precisa atingir sua meta.";
      color = "text-red-500";
    } else if (quality < 3) {
      message = "💤 Qualidade baixa. Revise sua rotina noturna.";
      color = "text-orange-500";
    } else {
      message = "🛌 Sono adequado. Continue assim!";
      color = "text-yellow-500";
    }
    
    return <p className={`text-sm font-medium ${color} mt-2`}>{message}</p>;
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Monitoramento</h1>
          <p className="text-muted-foreground">Acompanhe sua hidratação e qualidade do sono para uma vida mais saudável</p>
        </div>

        {/* Cards de acompanhamento diário */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Hidratação */}
          <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Hidratação
                </CardTitle>
                <CardDescription>Meta diária de água</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setWaterModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{(todayWater / 1000).toFixed(1)}L</span>
                  <span className="text-muted-foreground">de {(dailyGoal / 1000).toFixed(1)}L</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Você está {Math.round(progress)}% do caminho para sua meta diária!
                  </p>
                  {getWaterAnalysis(progress)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualidade do Sono */}
          <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Moon className="h-5 w-5 text-purple-500" />
                  Qualidade do Sono
                </CardTitle>
                <CardDescription>Meta: {sleepGoal}h por noite</CardDescription>
              </div>
              <div className="flex gap-2">
                {todaySleep && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 text-red-500 hover:text-red-600" 
                    onClick={deleteSleepEntry}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" className="gap-2" onClick={() => setSleepModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Registrar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySleep ? (
                  <>
                     <div className="flex justify-between items-center">
                       <span className="text-2xl font-bold">
                         {formatSleepDuration(todaySleep.sleep_duration?.toString() || '')}
                       </span>
                       <span className="text-muted-foreground">de {sleepGoal}h</span>
                     </div>
                     <Progress value={sleepProgress} className="h-2" />
                    <div className="flex justify-between items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star} 
                            className={star <= (todaySleep.sleep_quality || 0) ? "text-yellow-400" : "text-gray-300"}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(sleepProgress)}% da meta
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Dormiu às: {new Date(todaySleep.bedtime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p>Acordou às: {new Date(todaySleep.wake_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {getSleepAnalysis(todaySleep, sleepProgress)}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Nenhum registro de sono hoje</p>
                    <p className="text-sm text-muted-foreground">Registre seu sono para acompanhar sua qualidade</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progresso Semanal */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Hidratação Semanal */}
          <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progresso Semanal - Hidratação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {waterWeekly.map((item) => (
                  <div key={item.date} className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-md" onClick={() => {
                    setSelectedEditDate(new Date(item.date));
                    setWaterModalOpen(true);
                  }}>
                    <span className="w-8 text-sm font-medium">{item.day}</span>
                    <Progress value={item.progress} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-12">{item.progress}%</span>
                    {item.total > 0 && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAllWaterForDate(item.date);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-blue-500 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEditDate(new Date(item.date));
                        setWaterModalOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sono Semanal */}
          <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progresso Semanal - Sono
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 {sleepWeekly.map((item) => (
                   <div key={item.date} className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-md" onClick={() => {
                     setSelectedEditDate(new Date(item.date));
                     setSleepModalOpen(true);
                   }}>
                     <span className="w-8 text-sm font-medium">{item.day}</span>
                     <div className="flex-1 flex items-center gap-3">
                       <Progress value={item.progress} className="flex-1 h-2" />
                       <span className="text-sm text-muted-foreground w-16">{item.hours}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="flex">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <span 
                             key={star} 
                             className={star <= item.quality ? "text-yellow-400" : "text-gray-300"}
                           >
                             ★
                           </span>
                         ))}
                       </div>
                       {item.data && (
                         <Button 
                           size="sm" 
                           variant="ghost" 
                           className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" 
                           onClick={(e) => {
                             e.stopPropagation();
                             deleteSleepByDate(item.date);
                           }}
                         >
                           <Trash2 className="h-3 w-3" />
                         </Button>
                       )}
                       <Button
                         size="sm"
                         variant="ghost"
                         className="h-6 w-6 p-0 text-purple-500 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                         onClick={(e) => {
                           e.stopPropagation();
                           setSelectedEditDate(new Date(item.date));
                           setSleepModalOpen(true);
                         }}
                       >
                         <Plus className="h-3 w-3" />
                       </Button>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Semanal */}
        <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle>Resumo da Semana</CardTitle>
            <CardDescription>Seus principais indicadores de saúde</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{(todayWater / 1000).toFixed(1)}L</div>
                <p className="text-sm text-muted-foreground">Água consumida hoje</p>
              </div>
               <div className="text-center">
                 <div className="text-2xl font-bold text-purple-500">
                   {todaySleep ? formatSleepDuration(todaySleep.sleep_duration?.toString() || '') : "0h 0m"}
                 </div>
                 <p className="text-sm text-muted-foreground">Sono registrado hoje</p>
               </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{Math.round(progress)}%</div>
                <p className="text-sm text-muted-foreground">Meta de hidratação hoje</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {todaySleep ? todaySleep.sleep_quality : 0}★
                </div>
                <p className="text-sm text-muted-foreground">Qualidade do sono hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <WaterTrackingModal 
          open={waterModalOpen} 
          onOpenChange={(open) => {
            setWaterModalOpen(open);
            if (!open) {
              // Reset selected date when closing
              setSelectedEditDate(null);
            }
          }}
          initialDate={selectedEditDate || undefined}
        />
        <SleepTrackingModal 
          open={sleepModalOpen} 
          onOpenChange={(open) => {
            setSleepModalOpen(open);
            if (!open) {
              // Reset selected date when closing
              setSelectedEditDate(null);
            }
          }}
          initialDate={selectedEditDate || undefined}
        />
      </main>
    </div>
  );
}