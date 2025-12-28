import { Search, Bell, User, Menu, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Definição centralizada das rotas do menu
const navTabs = [
  { labelKey: "nav.home", path: "/", matchPrefixes: ["/", "/serie", "/exercicio"] },
  { labelKey: "nav.walking", path: "/caminhada", matchPrefixes: ["/caminhada"] },
  { labelKey: "nav.personal", path: "/personal-ia", matchPrefixes: ["/personal-ia"] },
  { labelKey: "nav.nutrition", path: "/nutri-ia", matchPrefixes: ["/nutri-ia", "/nutricao", "/refeicoes"] },
  { labelKey: "nav.monitoring", path: "/monitoramento", matchPrefixes: ["/monitoramento"] }
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro",
        description: "Erro ao encerrar sessão.",
        variant: "destructive",
      });
    }
  };

  // Determina qual aba está ativa baseado na rota atual
  const isTabActive = (tab: typeof navTabs[0]) => {
    const pathname = location.pathname;
    
    // Para a home, só é ativa se for exatamente "/" ou se começar com /serie ou /exercicio
    if (tab.path === "/") {
      // Verifica se não é nenhuma das outras rotas
      const otherTabs = navTabs.filter(t => t.path !== "/");
      const matchesOther = otherTabs.some(t => 
        t.matchPrefixes.some(prefix => pathname.startsWith(prefix))
      );
      
      if (matchesOther) return false;
      
      // É home se for "/" ou rotas relacionadas à home
      return pathname === "/" || 
             pathname.startsWith("/serie") || 
             pathname.startsWith("/exercicio");
    }
    
    // Para outras abas, verifica os prefixos
    return tab.matchPrefixes.some(prefix => pathname.startsWith(prefix));
  };

  const handleTabClick = (tab: typeof navTabs[0]) => {
    if (!user && tab.path !== "/") {
      navigate("/auth");
      return;
    }
    navigate(tab.path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">TudoFit TV</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navTabs.map((tab) => {
              const isActive = isTabActive(tab);
              return (
                <button
                  key={tab.labelKey}
                  onClick={() => handleTabClick(tab)}
                  className={`text-sm font-medium transition-colors relative pb-1 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(tab.labelKey)}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar treinos..."
                className="pl-10 w-64 bg-background/20 border-muted text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-foreground hover:text-foreground"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <User className="mr-2 h-4 w-4" />
                    {t('nav.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('nav.settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground hover:text-foreground"
                onClick={() => navigate("/auth")}
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {navTabs.map((tab) => {
                const isActive = isTabActive(tab);
                return (
                  <button
                    key={tab.labelKey}
                    onClick={() => {
                      handleTabClick(tab);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <span className="w-1 h-4 bg-primary rounded-full" />
                    )}
                    {t(tab.labelKey)}
                  </button>
                );
              })}
            </nav>
            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar treinos..."
                  className="pl-10 bg-background/20 border-muted text-foreground placeholder:text-muted-foreground"
                />
              </div>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-foreground hover:text-foreground"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {navigate("/perfil"); setIsMobileMenuOpen(false);}}>
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.profile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {navigate("/settings"); setIsMobileMenuOpen(false);}}>
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.settings')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-foreground hover:text-foreground"
                  onClick={() => navigate("/auth")}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
