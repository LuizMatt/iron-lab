import { useState } from "react";
import { useGetUsers, getGetUsersQueryKey, useCreateUser, useUpdateUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminStudents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: users, isLoading } = useGetUsers({ role: 'aluno' });
  const createUser = useCreateUser();
  
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });

  const handleCreate = () => {
    createUser.mutate({
      data: {
        ...formData,
        role: "aluno" as const
      }
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({ name: "", email: "", password: "", phone: "" });
        queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey({ role: 'aluno' }) });
        toast({ title: "Aluno cadastrado com sucesso!" });
      }
    });
  };

  const filteredUsers = users?.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-primary rounded-sm" />
          <h2 className="text-3xl font-display uppercase tracking-wider">Gestão de Alunos</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar aluno..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-full md:w-64 bg-card"
            />
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold uppercase tracking-wider whitespace-nowrap">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl uppercase tracking-wider text-primary">Novo Aluno</DialogTitle>
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
                  <Label>Senha Temporária</Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <Button 
                  className="w-full mt-4 font-bold uppercase tracking-widest" 
                  onClick={handleCreate}
                  disabled={createUser.isPending || !formData.name || !formData.email || !formData.password}
                >
                  Cadastrar Aluno
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-bold text-xs uppercase tracking-wider">Nome</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Contato</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground animate-pulse">Carregando...</TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Nenhum aluno encontrado.</TableCell></TableRow>
            ) : (
              filteredUsers.map(u => (
                <TableRow key={u.id} className="border-border">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-display text-lg">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.phone || 'Sem telefone'}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                      <Edit className="w-4 h-4" />
                    </Button>
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
