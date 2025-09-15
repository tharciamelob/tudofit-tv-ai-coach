import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ContinueWatching from "@/components/ContinueWatching";
import WorkoutCarousel from "@/components/WorkoutCarousel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  // Mock data for workout categories
  const workoutCategories = [
    {
      title: "Série para emagrecer rápido",
      workouts: [
        {
          id: "1",
          title: "HIIT Queima Gordura - 20 min",
          duration: "20 min",
          calories: "300 cal",
          difficulty: "Intermediário" as const,
          rating: 4.8,
          isNew: true
        },
        {
          id: "2", 
          title: "Cardio Explosivo - Full Body",
          duration: "25 min",
          calories: "350 cal", 
          difficulty: "Avançado" as const,
          rating: 4.9
        },
        {
          id: "3",
          title: "Metabolismo Acelerado",
          duration: "15 min",
          calories: "250 cal",
          difficulty: "Iniciante" as const,
          rating: 4.7
        },
        {
          id: "4",
          title: "Fat Burn Express",
          duration: "30 min", 
          calories: "400 cal",
          difficulty: "Intermediário" as const,
          rating: 4.6
        }
      ]
    },
    {
      title: "Séries de Academia - Iniciantes",
      workouts: [
        {
          id: "17",
          title: "Primeiro Treino na Academia",
          duration: "30 min",
          calories: "150 cal",
          difficulty: "Iniciante" as const,
          rating: 4.9,
          isNew: true
        },
        {
          id: "18",
          title: "Básico de Musculação - Semana 1",
          duration: "40 min", 
          calories: "180 cal",
          difficulty: "Iniciante" as const,
          rating: 4.8
        },
        {
          id: "19",
          title: "Adaptação Corporal",
          duration: "35 min",
          calories: "160 cal", 
          difficulty: "Iniciante" as const,
          rating: 4.7
        },
        {
          id: "20",
          title: "Fundamentos da Musculação",
          duration: "45 min",
          calories: "200 cal",
          difficulty: "Iniciante" as const, 
          rating: 4.6
        }
      ]
    },
    {
      title: "Séries de Academia - Condicionamento",
      workouts: [
        {
          id: "21",
          title: "Resistência Cardiovascular",
          duration: "50 min",
          calories: "400 cal",
          difficulty: "Intermediário" as const,
          rating: 4.8
        },
        {
          id: "22",
          title: "Circuito Funcional Academia",
          duration: "45 min", 
          calories: "350 cal",
          difficulty: "Intermediário" as const,
          rating: 4.7
        },
        {
          id: "23",
          title: "Crossfit Style na Academia",
          duration: "40 min",
          calories: "450 cal", 
          difficulty: "Avançado" as const,
          rating: 4.9,
          isNew: true
        },
        {
          id: "24",
          title: "Condicionamento Atlético",
          duration: "55 min",
          calories: "500 cal",
          difficulty: "Avançado" as const, 
          rating: 4.8
        }
      ]
    },
    {
      title: "Séries de Academia - Fisiculturismo",
      workouts: [
        {
          id: "25",
          title: "Peito e Tríceps - Bodybuilding",
          duration: "60 min",
          calories: "250 cal",
          difficulty: "Avançado" as const,
          rating: 4.9
        },
        {
          id: "26",
          title: "Costas e Bíceps - Pro",
          duration: "70 min", 
          calories: "280 cal",
          difficulty: "Avançado" as const,
          rating: 4.8
        },
        {
          id: "27",
          title: "Pernas - Hipertrofia Máxima",
          duration: "65 min",
          calories: "300 cal", 
          difficulty: "Avançado" as const,
          rating: 4.9,
          isNew: true
        },
        {
          id: "28",
          title: "Ombros e Trapézio - Definition",
          duration: "50 min",
          calories: "200 cal",
          difficulty: "Intermediário" as const, 
          rating: 4.7
        }
      ]
    },
    {
      title: "Série para ganho de massa muscular",
      workouts: [
        {
          id: "5",
          title: "Hipertrofia Peito e Tríceps", 
          duration: "45 min",
          calories: "200 cal",
          difficulty: "Intermediário" as const,
          rating: 4.9
        },
        {
          id: "6",
          title: "Costas e Bíceps - Massa",
          duration: "50 min", 
          calories: "220 cal",
          difficulty: "Avançado" as const,
          rating: 4.8
        },
        {
          id: "7",
          title: "Pernas e Glúteos - Power",
          duration: "40 min",
          calories: "180 cal", 
          difficulty: "Intermediário" as const,
          rating: 4.7,
          isNew: true
        },
        {
          id: "8",
          title: "Ombros e Trapézio",
          duration: "35 min",
          calories: "150 cal",
          difficulty: "Iniciante" as const, 
          rating: 4.5
        }
      ]
    },
    {
      title: "Treinos em Casa - Sem Equipamento",
      workouts: [
        {
          id: "13",
          title: "Home Workout - Sem Equipamentos",
          duration: "30 min",
          calories: "200 cal",
          difficulty: "Iniciante" as const,
          rating: 4.7 
        },
        {
          id: "14",
          title: "Sala de Casa - Condicionamento",
          duration: "25 min",
          calories: "180 cal",
          difficulty: "Intermediário" as const,
          rating: 4.6
        },
        {
          id: "15", 
          title: "Apartamento Friendly",
          duration: "20 min",
          calories: "150 cal",
          difficulty: "Iniciante" as const,
          rating: 4.8,
          isNew: true
        },
        {
          id: "16",
          title: "Home HIIT Intenso",
          duration: "35 min",
          calories: "280 cal",
          difficulty: "Avançado" as const,
          rating: 4.9
        },
        {
          id: "29",
          title: "Peso Corporal - Full Body",
          duration: "40 min",
          calories: "250 cal",
          difficulty: "Intermediário" as const,
          rating: 4.8
        },
        {
          id: "30",
          title: "Calistenia Básica",
          duration: "35 min",
          calories: "220 cal",
          difficulty: "Iniciante" as const,
          rating: 4.7
        }
      ]
    },
    {
      title: "Tutorial de Academia - Demonstração de Aparelhos",
      workouts: [
        {
          id: "31",
          title: "Como Usar a Esteira Corretamente",
          duration: "15 min",
          calories: "0 cal",
          difficulty: "Iniciante" as const,
          rating: 4.9,
          isNew: true
        },
        {
          id: "32",
          title: "Supino - Técnica Perfeita", 
          duration: "20 min",
          calories: "0 cal",
          difficulty: "Iniciante" as const,
          rating: 4.8
        },
        {
          id: "33",
          title: "Leg Press - Execução Segura",
          duration: "18 min",
          calories: "0 cal", 
          difficulty: "Iniciante" as const,
          rating: 4.7
        },
        {
          id: "34",
          title: "Puxador Alto - Variações",
          duration: "22 min",
          calories: "0 cal",
          difficulty: "Intermediário" as const, 
          rating: 4.6
        },
        {
          id: "35",
          title: "Smith Machine - Guia Completo",
          duration: "25 min",
          calories: "0 cal",
          difficulty: "Intermediário" as const,
          rating: 4.8
        }
      ]
    },
    {
      title: "Treinos Pilates - Sem Equipamentos",
      workouts: [
        {
          id: "36",
          title: "Pilates Básico - Mat Work",
          duration: "30 min",
          calories: "120 cal",
          difficulty: "Iniciante" as const,
          rating: 4.8
        },
        {
          id: "37",
          title: "Core Pilates - Fortalecimento", 
          duration: "25 min",
          calories: "100 cal",
          difficulty: "Intermediário" as const,
          rating: 4.9,
          isNew: true
        },
        {
          id: "38",
          title: "Pilates Postural",
          duration: "35 min",
          calories: "130 cal", 
          difficulty: "Iniciante" as const,
          rating: 4.7
        },
        {
          id: "39",
          title: "Pilates Flow - Sequência Completa",
          duration: "40 min",
          calories: "150 cal",
          difficulty: "Intermediário" as const, 
          rating: 4.8
        },
        {
          id: "40",
          title: "Pilates Respiração e Movimento",
          duration: "20 min",
          calories: "80 cal",
          difficulty: "Iniciante" as const,
          rating: 4.6
        }
      ]
    },
    {
      title: "Treinos Yoga",
      workouts: [
        {
          id: "41",
          title: "Hatha Yoga para Iniciantes",
          duration: "30 min",
          calories: "90 cal",
          difficulty: "Iniciante" as const,
          rating: 4.8
        },
        {
          id: "42",
          title: "Vinyasa Flow - Energia", 
          duration: "45 min",
          calories: "140 cal",
          difficulty: "Intermediário" as const,
          rating: 4.9
        },
        {
          id: "43",
          title: "Yoga Matinal - Desperte",
          duration: "20 min",
          calories: "70 cal", 
          difficulty: "Iniciante" as const,
          rating: 4.7,
          isNew: true
        },
        {
          id: "44",
          title: "Yin Yoga - Relaxamento",
          duration: "50 min",
          calories: "60 cal",
          difficulty: "Iniciante" as const, 
          rating: 4.8
        },
        {
          id: "45",
          title: "Power Yoga - Força e Flexibilidade",
          duration: "40 min",
          calories: "180 cal",
          difficulty: "Avançado" as const,
          rating: 4.9
        },
        {
          id: "46",
          title: "Yoga Noturno - Sono Reparador",
          duration: "25 min",
          calories: "50 cal",
          difficulty: "Iniciante" as const,
          rating: 4.6
        }
      ]
    },
    {
      title: "Funcional de 15 minutos",
      workouts: [
        {
          id: "9",
          title: "Quick Core Blast",
          duration: "15 min",
          calories: "120 cal",
          difficulty: "Iniciante" as const,
          rating: 4.6
        },
        {
          id: "10",
          title: "Express Full Body",
          duration: "15 min", 
          calories: "140 cal",
          difficulty: "Intermediário" as const,
          rating: 4.7
        },
        {
          id: "11",
          title: "Mobilidade Matinal",
          duration: "15 min",
          calories: "80 cal",
          difficulty: "Iniciante" as const,
          rating: 4.8,
          isNew: true
        },
        {
          id: "12",
          title: "Power 15 - Força",
          duration: "15 min",
          calories: "160 cal", 
          difficulty: "Avançado" as const,
          rating: 4.5
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black app-container">
      <Header />
      
      <div className="pt-20">
        <HeroSection />
        <ContinueWatching />
        
        {/* Hero Section with CTA for non-logged users */}
        {!user && (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Comece sua jornada fitness hoje!</h2>
              <p className="text-muted-foreground mb-6">
                Acesse sua conta para desbloquear treinos personalizados, cardápios IA e muito mais.
              </p>
              <Link to="/auth">
                <Button size="lg" className="btn-hero">
                  Entrar / Cadastrar - R$ 9,99 primeiro mês
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Workout Categories */}
        <div className="pb-8">
          {workoutCategories.map((category, index) => (
            <WorkoutCarousel
              key={index}
              title={category.title}
              workouts={category.workouts}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
