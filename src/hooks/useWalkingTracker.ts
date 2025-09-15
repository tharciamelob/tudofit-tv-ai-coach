import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Position {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

interface WalkingSession {
  id?: string;
  startTime: number;
  endTime?: number;
  distance: number;
  duration: number;
  calories: number;
  averagePace: number;
  route: Position[];
}

export const useWalkingTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<WalkingSession | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState(0);
  const [calories, setCalories] = useState(0);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const routeRef = useRef<Position[]>([]);
  const lastPositionRef = useRef<Position | null>(null);

  // Calcular distância entre dois pontos usando a fórmula de Haversine
  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calcular calorias estimadas (baseado em peso médio de 70kg)
  const calculateCalories = (distanceKm: number, timeMinutes: number): number => {
    const MET = 3.8; // METs para caminhada moderada
    const weightKg = 70; // Peso médio
    return Math.round((MET * weightKg * (timeMinutes / 60)));
  };

  // Iniciar rastreamento
  const startTracking = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para usar o rastreamento.",
        variant: "destructive",
      });
      return;
    }

    if (!navigator.geolocation) {
      toast({
        title: "GPS não disponível",
        description: "Seu dispositivo não suporta geolocalização.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Obter posição inicial
      const initialPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        });
      });

      const startPos: Position = {
        latitude: initialPosition.coords.latitude,
        longitude: initialPosition.coords.longitude,
        timestamp: Date.now(),
        accuracy: initialPosition.coords.accuracy
      };

      setCurrentPosition(startPos);
      lastPositionRef.current = startPos;
      routeRef.current = [startPos];
      
      const session: WalkingSession = {
        startTime: Date.now(),
        distance: 0,
        duration: 0,
        calories: 0,
        averagePace: 0,
        route: [startPos]
      };

      setCurrentSession(session);
      setIsTracking(true);
      setElapsedTime(0);
      setDistance(0);
      setPace(0);
      setCalories(0);

      // Iniciar rastreamento contínuo
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPos: Position = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            accuracy: position.coords.accuracy
          };

          setCurrentPosition(newPos);
          
          if (lastPositionRef.current) {
            const newDistance = calculateDistance(lastPositionRef.current, newPos);
            if (newDistance < 0.1 && position.coords.accuracy && position.coords.accuracy < 20) {
              setDistance(prev => {
                const total = prev + newDistance;
                routeRef.current.push(newPos);
                lastPositionRef.current = newPos;
                return total;
              });
            }
          }
        },
        (error) => {
          console.error('GPS Error:', error);
          toast({
            title: "Erro de GPS",
            description: "Erro ao obter localização. Verifique as permissões.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000
        }
      );

      // Iniciar cronômetro
      intervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          const timeMinutes = newTime / 60;
          
          // Atualizar métricas
          setCalories(calculateCalories(distance, timeMinutes));
          if (distance > 0 && timeMinutes > 0) {
            setPace(timeMinutes / distance); // minutos por km
          }
          
          return newTime;
        });
      }, 1000);

      toast({
        title: "Caminhada iniciada!",
        description: "GPS ativado. Sua caminhada está sendo rastreada.",
      });

    } catch (error) {
      console.error('Erro ao iniciar rastreamento:', error);
      toast({
        title: "Erro ao iniciar",
        description: "Não foi possível acessar o GPS. Verifique as permissões.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Parar rastreamento
  const stopTracking = async () => {
    if (!currentSession || !user) return;

    setIsLoading(true);

    try {
      // Parar GPS e cronômetro
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const finalSession: WalkingSession = {
        ...currentSession,
        endTime: Date.now(),
        duration: elapsedTime,
        distance: distance,
        calories: calories,
        averagePace: pace,
        route: routeRef.current
      };

      // Salvar no banco de dados
      const { error } = await supabase
        .from('walk_sessions')
        .insert({
          user_id: user.id,
          start_time: new Date(finalSession.startTime).toISOString(),
          end_time: new Date(finalSession.endTime!).toISOString(),
          distance_meters: finalSession.distance * 1000, // Converter km para metros
          calories_burned: finalSession.calories,
          average_pace: finalSession.averagePace,
          route_data: finalSession.route as any, // Type assertion para JSON
          is_completed: true,
          steps: Math.round(finalSession.distance * 1000 * 1.3) // Estimativa de passos
        });

      if (error) throw error;

      toast({
        title: "Caminhada salva!",
        description: `${distance.toFixed(2)}km em ${Math.floor(elapsedTime / 60)}min ${elapsedTime % 60}s`,
      });

      // Reset estado
      setIsTracking(false);
      setCurrentSession(null);
      setCurrentPosition(null);
      setElapsedTime(0);
      setDistance(0);
      setPace(0);
      setCalories(0);
      routeRef.current = [];
      lastPositionRef.current = null;

    } catch (error: any) {
      console.error('Erro ao salvar caminhada:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Pausar/Resumir rastreamento
  const pauseResumeTracking = () => {
    if (watchIdRef.current !== null) {
      // Pausar
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (isTracking) {
      // Resumir
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPos: Position = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            accuracy: position.coords.accuracy
          };

          setCurrentPosition(newPos);
          
          if (lastPositionRef.current) {
            const newDistance = calculateDistance(lastPositionRef.current, newPos);
            if (newDistance < 0.1 && position.coords.accuracy && position.coords.accuracy < 20) {
              setDistance(prev => {
                const total = prev + newDistance;
                routeRef.current.push(newPos);
                lastPositionRef.current = newPos;
                return total;
              });
            }
          }
        },
        (error) => {
          console.error('GPS Error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000
        }
      );

      intervalRef.current = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Formatadores
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number): string => {
    if (pace === 0 || !isFinite(pace)) return '0:00';
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isTracking,
    isLoading,
    currentSession,
    currentPosition,
    elapsedTime,
    distance,
    pace,
    calories,
    route: routeRef.current,
    isPaused: isTracking && watchIdRef.current === null,
    startTracking,
    stopTracking,
    pauseResumeTracking,
    formatTime,
    formatPace
  };
};