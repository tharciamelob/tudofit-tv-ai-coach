import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WalkingMap } from './WalkingMap';
import { useWalkingTracker } from '@/hooks/useWalkingTracker';
import { 
  Play, 
  Square, 
  Pause, 
  MapPin, 
  Clock, 
  Route,
  Flame,
  Footprints,
  Timer
} from 'lucide-react';

export const WalkingTracker: React.FC = () => {
  const {
    isTracking,
    isLoading,
    currentPosition,
    elapsedTime,
    distance,
    pace,
    calories,
    route,
    isPaused,
    startTracking,
    stopTracking,
    pauseResumeTracking,
    formatTime,
    formatPace
  } = useWalkingTracker();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Controles principais */}
      <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {!isTracking ? (
              <>
                <div className="bg-gradient-to-br from-primary to-primary-glow rounded-full w-24 h-24 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white" fill="white" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Iniciar Nova Caminhada</h2>
                  <p className="text-muted-foreground mb-6">
                    Rastreamento GPS com métricas em tempo real
                  </p>
                  <Button 
                    size="lg" 
                    className="px-8 gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    onClick={startTracking}
                    disabled={isLoading}
                  >
                    <Play className="h-5 w-5" />
                    {isLoading ? 'Ativando GPS...' : 'Começar Agora'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <Badge 
                    variant="outline" 
                    className={`px-4 py-2 text-lg ${isPaused ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}
                  >
                    {isPaused ? 'PAUSADO' : 'EM ANDAMENTO'}
                  </Badge>
                </div>

                {/* Métricas em tempo real */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Timer className="h-5 w-5 text-blue-400 mr-1" />
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {formatTime(elapsedTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">Tempo</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Route className="h-5 w-5 text-green-400 mr-1" />
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {distance.toFixed(2)}km
                    </div>
                    <div className="text-sm text-muted-foreground">Distância</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Footprints className="h-5 w-5 text-purple-400 mr-1" />
                    </div>
                    <div className="text-2xl font-bold text-purple-400">
                      {formatPace(pace)}
                    </div>
                    <div className="text-sm text-muted-foreground">Ritmo /km</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Flame className="h-5 w-5 text-red-400 mr-1" />
                    </div>
                    <div className="text-2xl font-bold text-red-400">
                      {calories}
                    </div>
                    <div className="text-sm text-muted-foreground">Calorias</div>
                  </div>
                </div>

                {/* Controles de rastreamento */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={pauseResumeTracking}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-4 w-4" />
                        Retomar
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        Pausar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={stopTracking}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Square className="h-4 w-4" />
                    {isLoading ? 'Salvando...' : 'Finalizar'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mapa */}
      <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Mapa GPS
            {route.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {route.length} pontos
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden">
            <WalkingMap 
              currentPosition={currentPosition}
              route={route}
              isTracking={isTracking}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações GPS */}
      {currentPosition && (
        <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm">Detalhes GPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Latitude</div>
                <div className="font-mono">{currentPosition.latitude.toFixed(6)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Longitude</div>
                <div className="font-mono">{currentPosition.longitude.toFixed(6)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Precisão</div>
                <div>±{currentPosition.accuracy ? Math.round(currentPosition.accuracy) : '?'}m</div>
              </div>
              <div>
                <div className="text-muted-foreground">Última atualização</div>
                <div>{new Date(currentPosition.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};