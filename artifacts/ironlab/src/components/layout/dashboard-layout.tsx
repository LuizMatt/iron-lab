import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { removeToken } from "@/lib/auth";
import { LogOut } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  navItems: { label: string; id: string; icon: ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  title: string;
}

export function DashboardLayout({ children, navItems, activeTab, onTabChange, title }: LayoutProps) {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    removeToken();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col h-auto md:h-screen sticky top-0 z-40">
        <div className="p-6 border-b border-border">
          <h1 className="text-3xl font-display text-primary tracking-widest">{title}</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-x-auto md:overflow-x-visible flex md:block">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-medium whitespace-nowrap md:whitespace-normal ${
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {item.icon}
              <span className="uppercase tracking-wider text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border mt-auto hidden md:block">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors uppercase tracking-wider text-sm font-bold"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
