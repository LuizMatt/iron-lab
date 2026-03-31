import { useState } from "react";
import { useGetWorkouts, getGetWorkoutsQueryKey, useCompleteWorkout, useCreateWorkout, useDeleteWorkout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Trash2, PlusCircle, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DashboardWorkouts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: workouts, isLoading } = useGetWorkouts();
  
  const completeWorkout = useCompleteWorkout();
  const createWorkout = useCreateWorkout();
  const deleteWorkout = useDeleteWorkout();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ name: "", description: "", muscleGroups: "", exercises: [{ name: "", sets: 3, reps: "10-12" }] });

  if (isLoading) return <div className="text-muted-foreground animate-pulse">Carregando treinos...</div>;

  const assignedWorkouts = workouts?.filter(w => !w.isCustom) || [];
  const customWorkouts = workouts?.filter(w => w.isCustom) || [];

  const handleComplete = (id: string) => {
    completeWorkout.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Treino finalizado!", description: "Continue no foco.", className: "border-primary bg-background text-primary" });
        queryClient.invalidateQueries({ queryKey: ["/api/streak"] }); // Optimistic streak update if needed
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteWorkout.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWorkoutsQueryKey() });
        toast({ title: "Treino removido." });
      }
    });
  };

  const handleCreateCustom = () => {
    if (!newWorkout.name) return;
    createWorkout.mutate({
      data: {
        name: newWorkout.name,
        description: newWorkout.description,
        muscleGroups: newWorkout.muscleGroups,
        isCustom: true,
        exercises: newWorkout.exercises.filter(e => e.name)
      }
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewWorkout({ name: "", description: "", muscleGroups: "", exercises: [{ name: "", sets: 3, reps: "10-12" }] });
        queryClient.invalidateQueries({ queryKey: getGetWorkoutsQueryKey() });
        toast({ title: "Treino personalizado criado!" });
      }
    });
  };

  const addExerciseField = () => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: "", sets: 3, reps: "10" }]
    }));
  };

  const WorkoutCard = ({ workout }: { workout: any }) => (
    <Card className="bg-card border-border overflow-hidden group">
      <CardHeader className="pb-3 border-b border-white/5 bg-white/5">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-display uppercase tracking-wider text-foreground mb-1">{workout.name}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {workout.muscleGroups && <Badge variant="outline" className="mr-2 border-primary/30 text-primary">{workout.muscleGroups}</Badge>}
              {workout.description}
            </CardDescription>
          </div>
          {workout.isCustom && (
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(workout.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3 mb-6">
          {workout.exercises.map((ex: any) => (
            <div key={ex.id} className="flex items-center justify-between p-2 rounded bg-background border border-white/5">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">{ex.name}</span>
              </div>
              <div className="text-sm font-display text-primary tracking-wider">
                {ex.sets} x {ex.reps}
              </div>
            </div>
          ))}
          {workout.exercises.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhum exercício cadastrado.</p>}
        </div>
        <Button 
          className="w-full font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => handleComplete(workout.id)}
          disabled={completeWorkout.isPending}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Finalizar Treino
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-primary rounded-sm" />
          <h2 className="text-3xl font-display uppercase tracking-wider">Treinos Atribuídos</h2>
        </div>
        {assignedWorkouts.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium text-lg mb-1">Nenhum treino atribuído</p>
            <p className="text-sm">Fale com seu professor para montar sua ficha.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedWorkouts.map(w => <WorkoutCard key={w.id} workout={w} />)}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-muted-foreground rounded-sm" />
            <h2 className="text-3xl font-display uppercase tracking-wider">Meus Treinos (Custom)</h2>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wider">
                <PlusCircle className="w-4 h-4 mr-2" /> Criar Treino
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl uppercase tracking-wider text-primary">Novo Treino Personalizado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nome do Treino</Label>
                  <Input 
                    placeholder="Ex: Peito e Tríceps" 
                    value={newWorkout.name} 
                    onChange={e => setNewWorkout({...newWorkout, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grupos Musculares</Label>
                  <Input 
                    placeholder="Ex: Peito, Tríceps, Ombro" 
                    value={newWorkout.muscleGroups} 
                    onChange={e => setNewWorkout({...newWorkout, muscleGroups: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    placeholder="Observações do treino..." 
                    value={newWorkout.description} 
                    onChange={e => setNewWorkout({...newWorkout, description: e.target.value})} 
                  />
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Exercícios</Label>
                    <Button variant="ghost" size="sm" onClick={addExerciseField} className="text-xs h-8">
                      <PlusCircle className="w-3 h-3 mr-1" /> Add Exercício
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {newWorkout.exercises.map((ex, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <Input 
                            placeholder="Nome do exercício" 
                            value={ex.name}
                            onChange={e => {
                              const newExs = [...newWorkout.exercises];
                              newExs[idx].name = e.target.value;
                              setNewWorkout({...newWorkout, exercises: newExs});
                            }}
                          />
                          <div className="flex gap-2">
                            <Input 
                              type="number" 
                              placeholder="Séries" 
                              className="w-20"
                              value={ex.sets}
                              onChange={e => {
                                const newExs = [...newWorkout.exercises];
                                newExs[idx].sets = parseInt(e.target.value) || 0;
                                setNewWorkout({...newWorkout, exercises: newExs});
                              }}
                            />
                            <Input 
                              placeholder="Reps (ex: 10-12)" 
                              value={ex.reps}
                              onChange={e => {
                                const newExs = [...newWorkout.exercises];
                                newExs[idx].reps = e.target.value;
                                setNewWorkout({...newWorkout, exercises: newExs});
                              }}
                            />
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive mt-1"
                          onClick={() => {
                            const newExs = [...newWorkout.exercises];
                            newExs.splice(idx, 1);
                            setNewWorkout({...newWorkout, exercises: newExs});
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full font-bold uppercase tracking-widest mt-4" 
                  onClick={handleCreateCustom}
                  disabled={createWorkout.isPending || !newWorkout.name}
                >
                  Salvar Treino
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {customWorkouts.length === 0 ? (
           <div className="p-6 text-center text-muted-foreground text-sm">Você ainda não tem treinos personalizados.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customWorkouts.map(w => <WorkoutCard key={w.id} workout={w} />)}
          </div>
        )}
      </section>
    </div>
  );
}
