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
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/personal-ia" element={<PersonalIA />} />
            <Route path="/nutri-ia" element={<NutriIA />} />
            <Route path="/monitoramento" element={<Monitoring />} />
            <Route path="/caminhada" element={<Walking />} />
            <Route path="/refeicoes" element={<Meals />} />
            <Route path="/perfil" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
