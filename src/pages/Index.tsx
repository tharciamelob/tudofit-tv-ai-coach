import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import WorkoutCarousel from "@/components/WorkoutCarousel";

const Index = () => {
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
      title: "Série para ganho de massa",
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
    },
    {
      title: "Treinos em casa",
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
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <HeroSection />
        
        <div className="container mx-auto px-4 py-12">
          {workoutCategories.map((category, index) => (
            <WorkoutCarousel 
              key={index}
              title={category.title}
              workouts={category.workouts}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
