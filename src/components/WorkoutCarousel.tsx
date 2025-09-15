import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import WorkoutCard from "./WorkoutCard";
import { Button } from "@/components/ui/button";

interface WorkoutCarouselProps {
  title: string;
  workouts: Array<{
    id: string;
    title: string;
    duration: string;
    calories: string;
    difficulty: "Iniciante" | "Intermediário" | "Avançado";
    rating: number;
    thumbnail?: string;
    isNew?: boolean;
  }>;
}

const WorkoutCarousel = ({ title, workouts }: WorkoutCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 320; // Width of one card plus gap
    const newScrollLeft = scrollRef.current.scrollLeft + 
      (direction === "left" ? -scrollAmount : scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth"
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <div className="group relative mb-12">
      <h2 className="text-2xl font-bold mb-6 text-foreground">{title}</h2>
      
      <div className="relative">
        {/* Navigation Buttons */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="carousel-nav left-2"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="carousel-nav right-2"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={handleScroll}
        >
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              title={workout.title}
              duration={workout.duration}
              calories={workout.calories}
              difficulty={workout.difficulty}
              rating={workout.rating}
              thumbnail={workout.thumbnail}
              isNew={workout.isNew}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutCarousel;