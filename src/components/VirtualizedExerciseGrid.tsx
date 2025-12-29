import React, { useCallback, useRef, useEffect, useState, CSSProperties, ReactElement } from 'react';
import { List } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Exercise {
  id: string;
  slug: string;
  name: string;
  difficulty: string | null;
  muscle_group: string | null;
  equipment: string | null;
  duration_seconds: number | null;
  tags: string[] | null;
}

interface VirtualizedExerciseGridProps {
  exercises: Exercise[];
  previewUrls: { [key: string]: string };
  onRevalidateUrl?: (index: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const ITEM_HEIGHT = 320;
const GAP = 16;

const getColumnCount = (containerWidth: number): number => {
  if (containerWidth < 640) return 1;
  if (containerWidth < 1024) return 2;
  if (containerWidth < 1280) return 3;
  return 4;
};

const getDifficultyColor = (difficulty: string | null) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-500';
    case 'intermediate': return 'bg-yellow-500';
    case 'advanced': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// Row props interface for the List component
interface RowPropsData {
  exercises: Exercise[];
  previewUrls: { [key: string]: string };
  itemsPerRow: number;
  containerWidth: number;
  navigate: ReturnType<typeof useNavigate>;
  onRevalidateUrl?: (index: number) => void;
}

// Row component for react-window v2
const RowComponent = (props: {
  ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem" };
  index: number;
  style: CSSProperties;
} & RowPropsData): ReactElement => {
  const { index: rowIndex, style, exercises, previewUrls, itemsPerRow, containerWidth, navigate, onRevalidateUrl } = props;
  
  const startIndex = rowIndex * itemsPerRow;
  const rowExercises = exercises.slice(startIndex, startIndex + itemsPerRow);
  const columnWidth = (containerWidth - GAP * (itemsPerRow - 1)) / itemsPerRow;

  return (
    <div style={style} className="flex gap-4">
      {rowExercises.map((exercise, colIndex) => {
        const globalIndex = startIndex + colIndex;
        const previewUrl = previewUrls[globalIndex];

        return (
          <Card 
            key={exercise.id}
            style={{ width: columnWidth }}
            className="flex-shrink-0 group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
            onClick={() => navigate(`/exercicio/${exercise.slug}`)}
          >
            <div className="relative aspect-video bg-muted overflow-hidden">
              {previewUrl ? (
                <video
                  src={previewUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onError={() => onRevalidateUrl?.(globalIndex)}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Play className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge className={`${getDifficultyColor(exercise.difficulty)} text-white text-xs`}>
                  {exercise.difficulty || 'N/A'}
                </Badge>
              </div>
              {exercise.duration_seconds && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {Math.floor(exercise.duration_seconds / 60)}:{(exercise.duration_seconds % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">{exercise.name}</h3>
              <div className="flex flex-wrap gap-1">
                {exercise.muscle_group && (
                  <Badge variant="outline" className="text-xs">{exercise.muscle_group}</Badge>
                )}
                {exercise.equipment && (
                  <Badge variant="outline" className="text-xs">{exercise.equipment}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      {/* Fill empty slots in last row */}
      {rowExercises.length < itemsPerRow && 
        Array.from({ length: itemsPerRow - rowExercises.length }).map((_, i) => (
          <div key={`empty-${i}`} style={{ width: columnWidth }} className="flex-shrink-0" />
        ))
      }
    </div>
  );
};

export const VirtualizedExerciseGrid: React.FC<VirtualizedExerciseGridProps> = ({
  exercises,
  previewUrls,
  onRevalidateUrl,
  onLoadMore,
  hasMore = false,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 600 });
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const cols = getColumnCount(width);
        setColumnCount(cols);
        setDimensions({
          width,
          height: Math.min(window.innerHeight - 200, 800)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const rowCount = Math.ceil(exercises.length / columnCount);

  // Handle load more when near bottom
  const handleRowsRendered = useCallback((
    visibleRows: { startIndex: number; stopIndex: number },
    allRows: { startIndex: number; stopIndex: number }
  ) => {
    if (hasMore && onLoadMore && allRows.stopIndex >= rowCount - 2) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore, rowCount]);

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum exercício encontrado.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      {dimensions.width > 0 && (
        <List<RowPropsData>
          rowComponent={RowComponent}
          rowCount={rowCount}
          rowHeight={ITEM_HEIGHT + GAP}
          rowProps={{
            exercises,
            previewUrls,
            itemsPerRow: columnCount,
            containerWidth: dimensions.width,
            navigate,
            onRevalidateUrl,
          }}
          overscanCount={2}
          onRowsRendered={handleRowsRendered}
          style={{ height: dimensions.height, width: dimensions.width }}
          className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        />
      )}
    </div>
  );
};
