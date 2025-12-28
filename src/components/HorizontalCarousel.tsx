import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HorizontalCarouselProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function HorizontalCarousel({ title, children, className = '' }: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScrollability();
    
    // Recheck on resize
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollability, children]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    // Scroll by ~80% of visible width
    const scrollAmount = el.clientWidth * 0.8;
    const newScrollLeft = direction === 'left' 
      ? el.scrollLeft - scrollAmount 
      : el.scrollLeft + scrollAmount;

    el.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    checkScrollability();
  };

  return (
    <section className={`my-8 ${className}`}>
      {/* Header com título e setas */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        
        {/* Setas de navegação */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Anterior"
            className={`h-8 w-8 rounded-full transition-opacity ${
              canScrollLeft 
                ? 'opacity-100 hover:bg-muted' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Próximo"
            className={`h-8 w-8 rounded-full transition-opacity ${
              canScrollRight 
                ? 'opacity-100 hover:bg-muted' 
                : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Container do carrossel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
      >
        {children}
      </div>
    </section>
  );
}
