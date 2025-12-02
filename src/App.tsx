import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PersonalIA from "./pages/PersonalIA";
import NutriIA from "./pages/NutriIA";
import Monitoring from "./pages/Monitoring";
import Walking from "./pages/Walking";
import Meals from "./pages/Meals";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ExerciseExplorer from "./pages/ExerciseExplorer";
import ExerciseDetail from "./pages/ExerciseDetail";
import AdminExercises from "./pages/AdminExercises";
import Serie from "./pages/Serie";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <div className="app-container">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/serie/:slug" element={<Serie />} />
                <Route path="/exercicios" element={<ExerciseExplorer />} />
                <Route path="/exercicio/:slug" element={<ExerciseDetail />} />
                <Route path="/admin/exercicios" element={<AdminExercises />} />
                <Route path="/personal-ia" element={<PersonalIA />} />
                <Route path="/nutri-ia" element={<NutriIA />} />
                <Route path="/monitoramento" element={<Monitoring />} />
                <Route path="/caminhada" element={<Walking />} />
                <Route path="/refeicoes" element={<Meals />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
