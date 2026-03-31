import { useState, useEffect } from "react";
import { useGetMe, getGetMeQueryKey, useUpdateUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DashboardProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: user, isLoading } = useGetMe();
  const updateUser = useUpdateUser();

  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  if (isLoading) return <div className="text-muted-foreground animate-pulse">Carregando perfil...</div>;
  if (!user) return null;

  const handleSave = () => {
    updateUser.mutate({
      id: user.id,
      data: formData
    }, {
      onSuccess: () => {
        toast({ title: "Perfil atualizado com sucesso!" });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      }
    });
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 bg-primary rounded-sm" />
        <h2 className="text-3xl font-display uppercase tracking-wider">Meu Perfil</h2>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-background to-primary/20" />
        <CardContent className="relative pt-0 px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-8">
            <Avatar className="w-32 h-32 border-4 border-card bg-background">
              <AvatarImage src={user.avatarUrl || ""} />
              <AvatarFallback className="text-4xl font-display text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <h3 className="text-3xl font-display uppercase tracking-wider">{user.name}</h3>
              <p className="text-muted-foreground uppercase text-sm font-bold tracking-widest">{user.role}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="uppercase text-xs tracking-wider text-muted-foreground font-bold">Nome Completo</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="h-12 bg-background"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="uppercase text-xs tracking-wider text-muted-foreground font-bold">E-mail</Label>
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-12 bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-xs tracking-wider text-muted-foreground font-bold">Telefone</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="h-12 bg-background"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <Button 
              onClick={handleSave}
              disabled={updateUser.isPending}
              className="w-full md:w-auto h-12 px-8 font-bold uppercase tracking-widest"
            >
              <Save className="w-5 h-5 mr-2" />
              {updateUser.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
