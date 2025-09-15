import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Target } from "lucide-react";

interface MealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
}

export default function MealPlanModal({ isOpen, onClose, plan }: MealPlanModalProps) {
  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-background via-background/95 to-muted/20 border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg">
                <plan.icon className="h-12 w-12 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {plan.title}
            </DialogTitle>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              {plan.description}
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium shadow-sm">
                {plan.calories}
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <Calendar className="h-4 w-4 mr-2" />
                {plan.duration}
              </Badge>
              {plan.badge && (
                <Badge className="px-4 py-2 text-sm font-medium shadow-sm">
                  <Target className="h-4 w-4 mr-2" />
                  {plan.badge}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-8">
          {plan.meals && Object.entries(plan.meals).map(([day, meals]: [string, any]) => (
            <Card key={day} className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-muted/10">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                <CardTitle className="text-2xl text-center text-foreground flex items-center justify-center gap-3">
                  <Calendar className="h-6 w-6 text-primary" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  {meals.map((meal: any, index: number) => (
                    <div key={index} className="p-6 bg-gradient-to-br from-background to-muted/30 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-lg text-foreground">{meal.type}</h4>
                        <div className="flex items-center gap-3">
                          {meal.time && (
                            <span className="text-sm text-muted-foreground font-medium px-2 py-1 bg-muted/50 rounded-full">
                              {meal.time}
                            </span>
                          )}
                          <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-semibold">
                              {meal.calories} kcal
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {meal.foods.map((food: string, foodIndex: number) => (
                          <div key={foodIndex} className="flex items-start gap-2 text-sm leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0"></div>
                            <span className="text-foreground/90">{food}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Summary Footer */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-2xl border border-primary/20 text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">Cardápio Completo</h3>
            <p className="text-muted-foreground text-sm">
              Desenvolvido por nutricionistas especialistas com quantidades precisas para seus objetivos
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}