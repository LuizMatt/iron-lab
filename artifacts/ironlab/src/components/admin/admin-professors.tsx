import { useState } from "react";
import { useGetUsers, getGetUsersQueryKey, useCreateUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminProfessors() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: users, isLoading } = useGetUsers({ role: 'professor' });
  const createUser = useCreateUser();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });

  const handleCreate = () => {
    createUser.mutate({
      data: {
        ...formData,
        role: "professor" as const
      }
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({ name: "", email: "", password: "", phone: "" });
        queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey({ role: 'professor' }) });
        toast({ title: "Professor cadastrado!" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-destructive rounded-sm" />
          <h2 className="text-3xl font-display uppercase tracking-wider text-destructive">Equipe de Professores</h2>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="font-bold uppercase tracking-wider">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Professor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-destructive/20">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl uppercase tracking-wider text-destructive flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" /> Novo Professor
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Senha Administrativa</Label>
                <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <Button 
                variant="destructive"
                className="w-full mt-4 font-bold uppercase tracking-widest text-destructive-foreground" 
                onClick={handleCreate}
                disabled={createUser.isPending || !formData.name || !formData.email || !formData.password}
              >
                Conceder Acesso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-bold text-xs uppercase tracking-wider">Nome</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Contato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground animate-pulse">Carregando...</TableCell></TableRow>
            ) : users?.length === 0 ? (
              <TableRow><TableCell colSpan={2} className="text-center py-8 text-muted-foreground">Nenhum professor encontrado.</TableCell></TableRow>
            ) : (
              users?.map(u => (
                <TableRow key={u.id} className="border-border">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/20 text-destructive flex items-center justify-center font-display text-lg">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.phone || '-'}</div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
