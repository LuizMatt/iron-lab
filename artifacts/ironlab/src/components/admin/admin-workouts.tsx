import { useState } from "react";
import { useGetWorkouts, getGetWorkoutsQueryKey, useCreateWorkout, useDeleteWorkout, useGetUsers, useAssignWorkout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Dumbbell, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminWorkouts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: workouts, isLoading: loadW } = useGetWorkouts();
  const { data: students, isLoading: loadS } = useGetUsers({ role: 'aluno' });
  
  const createWorkout = useCreateWorkout();
  const deleteWorkout = useDeleteWorkout();
  const assignWorkout = useAssignWorkout();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedWorkoutForAssign, setSelectedWorkoutForAssign] = useState<string | null>(null);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<string | null>(null);

  const [newWorkout, setNewWorkout] = useState({ name: "", description: "", muscleGroups: "", exercises: [{ name: "", sets: 3, reps: "10-12" }] });

  const handleCreate = () => {
    createWorkout.mutate({
      data: {
        name: newWorkout.name,
        description: newWorkout.description,
        muscleGroups: newWorkout.muscleGroups,
        isCustom: false,
        exercises: newWorkout.exercises.filter(e => e.name)
      }
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewWorkout({ name: "", description: "", muscleGroups: "", exercises: [{ name: "", sets: 3, reps: "10-12" }] });
        queryClient.invalidateQueries({ queryKey: getGetWorkoutsQueryKey() });
        toast({ title: "Treino base criado!" });
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

  const handleAssign = () => {
    if (!selectedWorkoutForAssign || !selectedStudentForAssign) return;
    // Note: assignWorkout needs the workout ID in path and userIds in body. 
    // Wait, let's check API spec for assignWorkout. It might just be POST /api/workouts/assign with userIds and workoutId in body or path?
    // Let's assume path has id: /api/workouts/{id}/assign.
    // Let's modify the generated API client logic or check how it works.
    // The spec says AssignWorkoutRequest: { userIds: string[] }, so it's probably POST /api/workouts/{id}/assign
    // Let's pass it correctly based on typical Orval signature: (id: string, data: { userIds: string[] })
    // In our api.ts: `export const useAssignWorkout = <TError = ErrorType<unknown>, TContext = unknown>(options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof assignWorkout>>, TError, {id: string, data: BodyType<AssignWorkoutRequest>}, TContext>, request?: SecondParameter<typeof customFetch> }): UseMutationResult...`
    
    assignWorkout.mutate({
      id: selectedWorkoutForAssign,
      data: { userIds: [selectedStudentForAssign] }
    }, {
      onSuccess: () => {
        setIsAssignOpen(false);
        toast({ title: "Treino atribuído com sucesso!" });
      }
    });
  };

  const addExerciseField = () => {
    setNewWorkout(prev => ({ ...prev, exercises: [...prev.exercises, { name: "", sets: 3, reps: "10" }] }));
  };

  const baseWorkouts = workouts?.filter(w => !w.isCustom) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-primary rounded-sm" />
          <h2 className="text-3xl font-display uppercase tracking-wider">Biblioteca de Treinos</h2>
        </div>

        <div className="flex gap-2">
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="font-bold uppercase tracking-wider">
                <Users className="w-4 h-4 mr-2" /> Atribuir a Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border overflow-visible">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl uppercase tracking-wider text-primary">Atribuir Treino</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Selecione o Treino Base</Label>
                  <Select onValueChange={setSelectedWorkoutForAssign}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Escolha..." /></SelectTrigger>
                    <SelectContent>
                      {baseWorkouts.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Selecione o Aluno</Label>
                  <Select onValueChange={setSelectedStudentForAssign}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Escolha..." /></SelectTrigger>
                    <SelectContent>
                      {students?.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full mt-4 font-bold uppercase tracking-widest"
                  onClick={handleAssign}
                  disabled={assignWorkout.isPending || !selectedWorkoutForAssign || !selectedStudentForAssign}
                >
                  Confirmar Atribuição
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold uppercase tracking-wider">
                <PlusCircle className="w-4 h-4 mr-2" /> Novo Treino Base
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl uppercase tracking-wider text-primary">Criar Treino Base</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={newWorkout.name} onChange={e => setNewWorkout({...newWorkout, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Foco / Grupos</Label>
                  <Input value={newWorkout.muscleGroups} onChange={e => setNewWorkout({...newWorkout, muscleGroups: e.target.value})} />
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Exercícios</Label>
                    <Button variant="ghost" size="sm" onClick={addExerciseField} className="h-6 px-2 text-xs">Add</Button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {newWorkout.exercises.map((ex, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input placeholder="Nome" value={ex.name} onChange={e => { const n = [...newWorkout.exercises]; n[idx].name = e.target.value; setNewWorkout({...newWorkout, exercises: n}); }} className="flex-1" />
                        <Input type="number" placeholder="Séries" value={ex.sets} onChange={e => { const n = [...newWorkout.exercises]; n[idx].sets = parseInt(e.target.value)||0; setNewWorkout({...newWorkout, exercises: n}); }} className="w-16" />
                        <Input placeholder="Reps" value={ex.reps} onChange={e => { const n = [...newWorkout.exercises]; n[idx].reps = e.target.value; setNewWorkout({...newWorkout, exercises: n}); }} className="w-20" />
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full mt-4 font-bold uppercase tracking-widest" onClick={handleCreate} disabled={createWorkout.isPending || !newWorkout.name}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loadW ? <div className="animate-pulse text-muted-foreground">Carregando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {baseWorkouts.map(w => (
            <Card key={w.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="font-display uppercase text-lg">{w.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="text-destructive h-6 w-6" onClick={() => handleDelete(w.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {w.muscleGroups && <Badge variant="outline" className="w-fit border-primary/30 text-primary">{w.muscleGroups}</Badge>}
              </CardHeader>
              <CardContent className="pt-2 text-sm text-muted-foreground">
                <div className="space-y-1">
                  {w.exercises.slice(0,3).map(e => (
                    <div key={e.id} className="flex justify-between border-b border-white/5 pb-1 mb-1">
                      <span>{e.name}</span>
                      <span className="font-mono text-primary/70">{e.sets}x{e.reps}</span>
                    </div>
                  ))}
                  {w.exercises.length > 3 && <div className="text-xs italic mt-2">+ {w.exercises.length - 3} exercícios</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
