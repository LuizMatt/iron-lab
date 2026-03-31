import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getToken, getUserRole } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Users, Dumbbell, CreditCard, ShieldAlert } from "lucide-react";

import { AdminStudents } from "@/components/admin/admin-students";
import { AdminWorkouts } from "@/components/admin/admin-workouts";
import { AdminFinance } from "@/components/admin/admin-finance";
import { AdminProfessors } from "@/components/admin/admin-professors";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("alunos");

  useEffect(() => {
    const token = getToken();
    const userRole = getUserRole();
    if (!token) {
      setLocation("/login");
    } else if (userRole !== "admin" && userRole !== "professor") {
      setLocation("/dashboard");
    } else {
      setRole(userRole);
      setIsReady(true);
    }
  }, [setLocation]);

  if (!isReady) return null;

  const navItems = [
    { id: "alunos", label: "Alunos", icon: <Users className="w-5 h-5" /> },
    { id: "treinos", label: "Treinos", icon: <Dumbbell className="w-5 h-5" /> },
    { id: "financeiro", label: "Financeiro", icon: <CreditCard className="w-5 h-5" /> },
  ];

  if (role === "admin") {
    navItems.push({ id: "professores", label: "Professores", icon: <ShieldAlert className="w-5 h-5" /> });
  }

  return (
    <DashboardLayout navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab} title="ADMIN">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "alunos" && <AdminStudents />}
        {activeTab === "treinos" && <AdminWorkouts />}
        {activeTab === "financeiro" && <AdminFinance />}
        {activeTab === "professores" && role === "admin" && <AdminProfessors />}
      </div>
    </DashboardLayout>
  );
}
