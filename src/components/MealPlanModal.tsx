import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface MealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
}

export default function MealPlanModal({ isOpen, onClose, plan }: MealPlanModalProps) {
  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{plan.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{plan.description}</p>
            <div className="flex justify-center gap-4">
              <Badge variant="secondary">{plan.calories}</Badge>
              <Badge variant="outline">{plan.duration}</Badge>
              {plan.badge && <Badge>{plan.badge}</Badge>}
            </div>
          </div>

          <div className="space-y-6">
            {plan.meals && Object.entries(plan.meals).map(([day, meals]: [string, any]) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="text-lg">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {meals.map((meal: any, index: number) => (
                      <div key={index} className="p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">{meal.type}</h4>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm text-muted-foreground">
                              {meal.calories} kcal
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {meal.foods.map((food: string, foodIndex: number) => (
                            <div key={foodIndex} className="text-sm">
                              • {food}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}