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
    const synopsisMap: { [key: string]: string[] } = {
      "Cardio HIIT": [
        "4x burpees (12 reps)",
        "3x jumping jacks (30 seg)",
        "4x mountain climbers (20 reps)",
        "3x squat jumps (15 reps)"
      ],
      "Força e Resistência": [
        "3x flexões (10-15 reps)",
        "4x agachamentos (12 reps)", 
        "3x prancha (30-60 seg)",
        "3x lunges (10 reps cada perna)"
      ],
      "Yoga e Flexibilidade": [
        "5x saudação ao sol",
        "3x postura do guerreiro (30 seg cada)",
        "2x alongamento espinhal (1 min)",
        "1x relaxamento final (5 min)"
      ],
      "Pilates": [
        "3x hundred (100 batidas)",
        "2x roll up (8 reps)",
        "3x single leg stretch (10 cada)",
        "2x teaser (5 reps)"
      ],
      "Funcional": [
        "3x deadlift (12 reps)",
        "4x kettlebell swing (15 reps)",
        "3x farmer's walk (30 seg)",
        "3x box jumps (10 reps)"
      ],
      "Aulas de Jump": [
        "4x basic bounce (32 tempos)",
        "3x tuck jump (16 reps)",
        "4x knee lift (20 cada perna)",
        "2x combination sequence (1 min)"
      ],
      "Tutorial de Academia": [
        "Demonstração completa",
        "Postura correta",
        "Variações disponíveis",
        "Dicas de segurança"
      ]
    };

    return synopsisMap[category] || [
      "3x exercício principal (12 reps)",
      "2x exercício auxiliar (15 reps)", 
      "1x alongamento (30 seg)",
      "1x descanso ativo (1 min)"
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