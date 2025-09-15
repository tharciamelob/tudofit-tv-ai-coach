import { Search, Bell, User, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [activeTab, setActiveTab] = useState("Início");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { label: "Início", path: "/" },
    { label: "Caminhada", path: "/caminhada" }, 
    { label: "Personal IA", path: "/personal-ia" },
    { label: "Nutrição", path: "/nutri-ia" },
    { label: "Monitoramento", path: "/monitoramento" }
  ];

  const handleTabClick = (tab: { label: string; path: string }) => {
    if (!user && tab.path !== "/") {
      navigate("/auth");
      return;
    }
    setActiveTab(tab.label);
    navigate(tab.path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">TudoFit TV</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => handleTabClick(tab)}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  activeTab === tab.label
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground hover:text-foreground"
              onClick={() => user ? navigate("/perfil") : navigate("/auth")}
            >
              <User className="h-5 w-5" />
            </Button>
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
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => {
                    handleTabClick(tab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left text-sm font-medium transition-colors hover:text-foreground ${
                    activeTab === tab.label
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar treinos..."
                  className="pl-10 bg-background/20 border-muted text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground hover:text-foreground"
                onClick={() => user ? navigate("/perfil") : navigate("/auth")}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;