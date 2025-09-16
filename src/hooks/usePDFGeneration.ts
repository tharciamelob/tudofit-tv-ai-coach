import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

export const usePDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateWorkoutPDF = async (workoutPlan: any) => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Plano de Treino Personalizado', margin, yPosition);
      
      yPosition += 20;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      
      yPosition += 15;

      // Workout details
      if (workoutPlan.name) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Nome: ${workoutPlan.name}`, margin, yPosition);
        yPosition += 10;
      }

      if (workoutPlan.description) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const splitDescription = pdf.splitTextToSize(workoutPlan.description, pageWidth - 2 * margin);
        pdf.text(splitDescription, margin, yPosition);
        yPosition += splitDescription.length * 5 + 10;
      }

      // Exercises
      if (workoutPlan.exercises && workoutPlan.exercises.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Exercícios:', margin, yPosition);
        yPosition += 10;

        workoutPlan.exercises.forEach((exercise: any, index: number) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${exercise.name || exercise.exercise}`, margin, yPosition);
          yPosition += 8;

          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          
          if (exercise.sets) {
            pdf.text(`Séries: ${exercise.sets}`, margin + 10, yPosition);
            yPosition += 6;
          }
          
          if (exercise.reps) {
            pdf.text(`Repetições: ${exercise.reps}`, margin + 10, yPosition);
            yPosition += 6;
          }
          
          if (exercise.weight) {
            pdf.text(`Peso: ${exercise.weight}`, margin + 10, yPosition);
            yPosition += 6;
          }

          if (exercise.duration) {
            pdf.text(`Duração: ${exercise.duration}`, margin + 10, yPosition);
            yPosition += 6;
          }

          if (exercise.instructions) {
            const splitInstructions = pdf.splitTextToSize(exercise.instructions, pageWidth - 2 * margin - 10);
            pdf.text(splitInstructions, margin + 10, yPosition);
            yPosition += splitInstructions.length * 5;
          }

          yPosition += 10;
        });
      }

      // Footer
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 40, 285);
      }

      pdf.save(`treino-${Date.now()}.pdf`);

      toast({
        title: "PDF gerado com sucesso!",
        description: "Seu plano de treino foi baixado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateNutritionPDF = async (mealPlan: any) => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Plano Nutricional Personalizado', margin, yPosition);
      
      yPosition += 20;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      
      yPosition += 15;

      // Meal plan details
      if (mealPlan.name) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Plano: ${mealPlan.name}`, margin, yPosition);
        yPosition += 10;
      }

      if (mealPlan.description) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const splitDescription = pdf.splitTextToSize(mealPlan.description, pageWidth - 2 * margin);
        pdf.text(splitDescription, margin, yPosition);
        yPosition += splitDescription.length * 5 + 10;
      }

      // Daily meals
      if (mealPlan.daily_meals && Object.keys(mealPlan.daily_meals).length > 0) {
        Object.entries(mealPlan.daily_meals).forEach(([day, meals]: [string, any]) => {
          if (yPosition > 240) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${day}`, margin, yPosition);
          yPosition += 10;

          if (meals && typeof meals === 'object') {
            Object.entries(meals).forEach(([mealType, mealData]: [string, any]) => {
              if (yPosition > 250) {
                pdf.addPage();
                yPosition = 20;
              }

              pdf.setFontSize(14);
              pdf.setFont('helvetica', 'bold');
              pdf.text(`${mealType}:`, margin + 10, yPosition);
              yPosition += 8;

              if (typeof mealData === 'string') {
                const splitMeal = pdf.splitTextToSize(mealData, pageWidth - 2 * margin - 20);
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'normal');
                pdf.text(splitMeal, margin + 20, yPosition);
                yPosition += splitMeal.length * 5 + 5;
              } else if (mealData && typeof mealData === 'object') {
                if (mealData.description) {
                  const splitMeal = pdf.splitTextToSize(mealData.description, pageWidth - 2 * margin - 20);
                  pdf.setFontSize(12);
                  pdf.setFont('helvetica', 'normal');
                  pdf.text(splitMeal, margin + 20, yPosition);
                  yPosition += splitMeal.length * 5 + 5;
                }

                if (mealData.calories) {
                  pdf.text(`Calorias: ${mealData.calories}`, margin + 20, yPosition);
                  yPosition += 6;
                }

                if (mealData.protein) {
                  pdf.text(`Proteína: ${mealData.protein}g`, margin + 20, yPosition);
                  yPosition += 6;
                }

                if (mealData.carbs) {
                  pdf.text(`Carboidratos: ${mealData.carbs}g`, margin + 20, yPosition);
                  yPosition += 6;
                }

                if (mealData.fat) {
                  pdf.text(`Gordura: ${mealData.fat}g`, margin + 20, yPosition);
                  yPosition += 6;
                }
              }

              yPosition += 5;
            });
          }

          yPosition += 10;
        });
      }

      // Footer
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 40, 285);
      }

      pdf.save(`cardapio-${Date.now()}.pdf`);

      toast({
        title: "PDF gerado com sucesso!",
        description: "Seu plano nutricional foi baixado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateElementPDF = async (elementId: string, filename: string) => {
    setIsGenerating(true);
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento não encontrado');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}-${Date.now()}.pdf`);

      toast({
        title: "PDF gerado com sucesso!",
        description: "O arquivo foi baixado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateWorkoutPDF,
    generateNutritionPDF,
    generateElementPDF,
    isGenerating
  };
};