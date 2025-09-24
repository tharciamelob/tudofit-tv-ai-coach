import { Play, Clock, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkoutCardProps {
  title: string;
  duration: string;
  calories: string;
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
  rating: number;
  thumbnail?: string;
  isNew?: boolean;
  category?: string;
}

const WorkoutCard = ({ 
  title, 
  duration, 
  calories, 
  difficulty, 
  rating, 
  thumbnail,
  isNew = false,
  category = ""
}: WorkoutCardProps) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Iniciante": return "text-green-400";
      case "Intermediário": return "text-yellow-400";
      case "Avançado": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  const getWorkoutSynopsis = (category: string, title: string) => {
    // Roteiros específicos baseados no título
    const specificWorkouts: { [key: string]: string[] } = {
      // HIIT Workouts
      "HIIT Queima Gordura": [
        "• 4x Burpees com salto (12 reps)",
        "• 3x High Knees intensos (45 seg)",
        "• 4x Jump Squats explosivos (15 reps)",
        "• 3x Mountain Climbers rápidos (30 seg)",
        "• 2x Plank Jacks dinâmicos (20 reps)"
      ],
      "HIIT Explosivo": [
        "• 5x Burpees Box Jump (8 reps)",
        "• 4x Tuck Jumps (12 reps)",
        "• 3x Split Lunges alternados (20 seg)",
        "• 4x Push-up to T (10 reps)",
        "• 2x Sprint Intervals (30 seg)"
      ],
      "HIIT Funcional": [
        "• 4x Thrusters com peso corporal (15 reps)",
        "• 3x Bear Crawl para frente/trás (20 seg)",
        "• 4x Squat to Press imaginário (12 reps)",
        "• 3x Lateral Bounds (16 reps)",
        "• 2x Tabata final (20s/10s x4)"
      ],
      
      // Força e Resistência
      "Treino Superior": [
        "• 4x Flexões diamante (8-12 reps)",
        "• 3x Pike Push-ups (10 reps)",
        "• 4x Tricep Dips na cadeira (15 reps)",
        "• 3x Superman com braços (12 reps)",
        "• 2x Prancha lateral (30 seg cada)"
      ],
      "Treino Inferior": [
        "• 4x Pistol Squats assistidos (6 cada)",
        "• 3x Bulgarian Split Squats (12 cada)",
        "• 4x Single Leg Deadlift (10 cada)",
        "• 3x Calf Raises (20 reps)",
        "• 2x Wall Sit (45 seg)"
      ],
      "Full Body Power": [
        "• 4x Burpee to Tuck Jump (10 reps)",
        "• 3x Push-up to Downward Dog (12 reps)",
        "• 4x Jump Squats + Overhead Reach (15 reps)",
        "• 3x Plank Up-Downs (16 reps)",
        "• 2x Turkish Get-Up (5 cada lado)"
      ],
      
      // Yoga Específicos
      "Yoga Matinal": [
        "• 3x Saudação ao Sol A (fluxo lento)",
        "• 2x Gato-Vaca dinâmico (10 reps)",
        "• 3x Guerreiro I flow (45 seg cada)",
        "• 2x Torção sentado suave (1 min cada)",
        "• 1x Child's Pose relaxante (2 min)"
      ],
      "Power Yoga": [
        "• 5x Saudação ao Sol B (fluxo rápido)",
        "• 3x Chaturanga flow (8 reps)",
        "• 4x Guerreiro III desafio (30 seg cada)",
        "• 3x Crow Pose hold (15 seg)",
        "• 1x Inversão na parede (1 min)"
      ],
      "Yoga Relaxante": [
        "• 2x Saudação ao Sol gentil",
        "• 3x Flexão para frente (1 min cada)",
        "• 3x Torção supina (45 seg cada)",
        "• 2x Happy Baby pose (1 min)",
        "• 1x Savasana profundo (5 min)"
      ],
      
      // Pilates Específicos
      "Pilates Core": [
        "• 3x Hundred clássico (100 batidas)",
        "• 4x Criss Cross oblíquos (20 reps)",
        "• 3x Double Leg Stretch (12 reps)",
        "• 4x Bicycle abdominal (16 cada)",
        "• 2x Plank variations (45 seg cada)"
      ],
      "Pilates Postural": [
        "• 4x Roll Up vertebral (8 reps)",
        "• 3x Swan Dive posterior (10 reps)",
        "• 4x Side Kick Series (12 cada)",
        "• 3x Swimming alternado (20 reps)",
        "• 2x Spine Stretch Forward (8 reps)"
      ],
      
      // Funcionais Específicos
      "Funcional Atlético": [
        "• 4x Clean & Press simulado (12 reps)",
        "• 3x Farmer's Walk pesado (50 passos)",
        "• 4x Box Jump + Burpee (8 reps)",
        "• 3x Kettlebell Swing russo (25 reps)",
        "• 2x Battle Ropes imaginário (30 seg)"
      ],
      "Funcional Iniciante": [
        "• 3x Squat to Stand (15 reps)",
        "• 4x Modified Push-ups (10 reps)",
        "• 3x Step-ups na cadeira (12 cada)",
        "• 3x Dead Bug alternado (16 reps)",
        "• 2x Bird Dog (30 seg cada)"
      ],
      
      // Jump Específicos
      "Jump Cardio": [
        "• 4x Basic Bounce aquecimento (32 tempos)",
        "• 3x Star Jumps no trampolim (20 reps)",
        "• 4x Knee Tucks altos (16 reps)",
        "• 3x Twist Jumps (24 reps)",
        "• 2x Cardio combo final (2 min)"
      ],
      "Jump Coreografia": [
        "• 2x Sequência básica (64 tempos)",
        "• 3x Mambo bounce (32 tempos)",
        "• 4x Grapevine jump (16 cada lado)",
        "• 3x Combo avançado (48 tempos)",
        "• 1x Cool down bounce (1 min)"
      ]
    };

    // Se encontrar roteiro específico, retorna ele
    if (specificWorkouts[title]) {
      return specificWorkouts[title];
    }

    // Fallback por categoria
    const categoryDefaults: { [key: string]: string[] } = {
      "Cardio HIIT": [
        "• 4x Burpees completos (15 reps)",
        "• 3x Jumping Jacks (45 segundos)",
        "• 4x Mountain Climbers (30 reps)",
        "• 3x Jump Squats (20 reps)",
        "• 2x Sprint no lugar (30 seg)"
      ],
      "Força e Resistência": [
        "• 4x Flexões de braço (12-15 reps)",
        "• 3x Agachamento livre (20 reps)",
        "• 4x Prancha abdominal (45 seg)",
        "• 3x Lunges alternados (16 reps)",
        "• 3x Elevação pélvica (15 reps)"
      ],
      "Yoga e Flexibilidade": [
        "• 5x Saudação ao Sol completa",
        "• 3x Guerreiro I e II (45 seg cada)",
        "• 2x Flexão anterior sentado (1 min)",
        "• 3x Torção espinhal (30 seg cada)",
        "• 1x Savasana relaxamento (5 min)"
      ],
      "Pilates": [
        "• 3x The Hundred (100 batidas)",
        "• 4x Roll Up vertebral (8 reps)",
        "• 3x Single Leg Stretch (12 cada)",
        "• 3x Criss Cross oblíquo (16 reps)",
        "• 2x Teaser completo (6 reps)"
      ],
      "Funcional": [
        "• 4x Deadlift com peso corporal (15 reps)",
        "• 3x Kettlebell Swing (20 reps)",
        "• 4x Farmer's Walk (40 passos)",
        "• 3x Box Jump ou Step Up (12 reps)",
        "• 3x Turkish Get-Up (5 cada lado)"
      ],
      "Aulas de Jump": [
        "• 4x Basic Bounce (64 tempos)",
        "• 3x Tuck Jump no trampolim (20 reps)",
        "• 4x Knee Lift alternado (32 cada)",
        "• 3x Twist Jump (24 reps)",
        "• 2x Sequência coreografada (2 min)"
      ]
    };

    return categoryDefaults[category] || [
      "• 4x Exercício composto (12-15 reps)",
      "• 3x Exercício isolado (10-12 reps)",
      "• 3x Exercício funcional (8-10 reps)",
      "• 2x Exercício de ativação (45 seg)",
      "• 1x Recuperação ativa (1-2 min)"
    ];
  };

  return (
    <div className="group cursor-pointer min-w-[280px] md:min-w-[320px] rounded-lg overflow-hidden bg-gradient-to-b from-black via-black to-slate-800 shadow-lg border border-white/5 hover:border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/10">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black overflow-hidden border border-white/10">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-16 w-16 text-primary/60" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90 scale-110">
            <Play className="h-5 w-5 ml-1" fill="currentColor" />
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew && (
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
              NOVO
            </span>
          )}
          <span className={`px-2 py-1 rounded text-xs font-medium bg-black/60 ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/60 px-2 py-1 rounded">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-white font-medium">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Sinopse dos exercícios */}
        <div className="mb-3 space-y-1">
          {getWorkoutSynopsis(category, title).map((exercise, index) => (
            <p key={index} className="text-xs text-muted-foreground/80 leading-relaxed">
              • {exercise}
            </p>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{calories}</span>
            </div>
          </div>
        </div>

        {/* Hover Actions */}
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button className="w-full bg-primary hover:bg-primary/90">
            Iniciar Treino
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCard;