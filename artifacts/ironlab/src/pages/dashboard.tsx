import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getToken, getUserRole } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Dumbbell, Trophy, CreditCard, User as UserIcon } from "lucide-react";

import { DashboardWorkouts } from "@/components/dashboard/dashboard-workouts";
import { DashboardGamification } from "@/components/dashboard/dashboard-gamification";
import { DashboardFinance } from "@/components/dashboard/dashboard-finance";
import { DashboardProfile } from "@/components/dashboard/dashboard-profile";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState("treinos");

  useEffect(() => {
    const token = getToken();
    const role = getUserRole();
    if (!token) {
      setLocation("/login");
    } else if (role === "admin" || role === "professor") {
      setLocation("/admin");
    } else {
      setIsReady(true);
    }
  }, [setLocation]);

  if (!isReady) return null;

  const navItems = [
    { id: "treinos", label: "Meus Treinos", icon: <Dumbbell className="w-5 h-5" /> },
    { id: "gamificacao", label: "Gamificação", icon: <Trophy className="w-5 h-5" /> },
    { id: "financeiro", label: "Financeiro", icon: <CreditCard className="w-5 h-5" /> },
    { id: "perfil", label: "Perfil", icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <DashboardLayout navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab} title="ALUNO">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "treinos" && <DashboardWorkouts />}
        {activeTab === "gamificacao" && <DashboardGamification />}
        {activeTab === "financeiro" && <DashboardFinance />}
        {activeTab === "perfil" && <DashboardProfile />}
      </div>
    </DashboardLayout>
  );
}
