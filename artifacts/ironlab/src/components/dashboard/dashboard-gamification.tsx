import { useGetStreak } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Calendar, CheckCircle, XCircle } from "lucide-react";

export function DashboardGamification() {
  const { data: streak, isLoading } = useGetStreak();

  if (isLoading) return <div className="text-muted-foreground animate-pulse">Carregando dados...</div>;
  if (!streak) return null;

  const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 bg-primary rounded-sm" />
        <h2 className="text-3xl font-display uppercase tracking-wider">Gamificação</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Streak */}
        <Card className="bg-card border-border overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Flame className="w-32 h-32 text-primary" />
          </div>
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[250px] relative z-10 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Flame className="w-10 h-10 text-primary" />
            </div>
            <div className="text-6xl font-display text-primary tracking-widest mb-2">
              {streak.currentStreak} <span className="text-2xl text-muted-foreground tracking-normal uppercase">Dias</span>
            </div>
            <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
              Sequência Atual
            </p>
            
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border">
              <div className={`w-3 h-3 rounded-full ${streak.trainedToday ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {streak.trainedToday ? "Fogo Ativo!" : "Risco de perder (Treine hoje)"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Week */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center border border-border">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Recorde Pessoal</p>
                <div className="text-3xl font-display text-foreground">
                  {streak.maxStreak} DIAS
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border flex-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Esta Semana</p>
              </div>
              
              <div className="flex justify-between items-center px-2">
                {streak.weekDays.map((trained, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground">{daysOfWeek[i]}</span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      trained 
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(163,230,53,0.3)]" 
                        : "bg-background border-border text-muted-foreground/30"
                    }`}>
                      {trained ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-4 h-4" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
