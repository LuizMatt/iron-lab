import { useState } from "react";
import { useGetPayments, getGetPaymentsQueryKey, useGeneratePayment, useGetUsers } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminFinance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: payments, isLoading: loadP } = useGetPayments();
  const { data: students, isLoading: loadS } = useGetUsers({ role: 'aluno' });
  const generatePayment = useGeneratePayment();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ userId: "", amount: 149.00, dueDate: "" });

  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return <Badge className="bg-primary text-primary-foreground border-transparent">Pago</Badge>;
      case 'overdue': return <Badge variant="destructive">Atrasado</Badge>;
      default: return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">Pendente</Badge>;
    }
  };

  const handleGenerate = () => {
    if (!formData.userId || !formData.dueDate) return;
    // ensure date is in correct ISO format or YYYY-MM-DD
    const isoDate = new Date(formData.dueDate).toISOString();

    generatePayment.mutate({
      data: {
        userId: formData.userId,
        amount: Number(formData.amount),
        dueDate: isoDate
      }
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({ userId: "", amount: 149.00, dueDate: "" });
        queryClient.invalidateQueries({ queryKey: getGetPaymentsQueryKey() });
        toast({ title: "Cobrança gerada com sucesso!" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-primary rounded-sm" />
          <h2 className="text-3xl font-display uppercase tracking-wider">Controle Financeiro</h2>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold uppercase tracking-wider">
              <PlusCircle className="w-4 h-4 mr-2" /> Gerar Cobrança PIX
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border overflow-visible">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl uppercase tracking-wider text-primary">Nova Cobrança</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Aluno</Label>
                <Select onValueChange={v => setFormData({...formData, userId: v})}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {students?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
              <Button 
                className="w-full mt-4 font-bold uppercase tracking-widest"
                onClick={handleGenerate}
                disabled={generatePayment.isPending || !formData.userId || !formData.dueDate}
              >
                Gerar PIX
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-background/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-bold text-xs uppercase tracking-wider">Aluno</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Vencimento</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Valor</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadP ? (
               <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground animate-pulse">Carregando...</TableCell></TableRow>
            ) : payments?.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma cobrança encontrada.</TableCell></TableRow>
            ) : (
              payments?.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map(p => (
                <TableRow key={p.id} className="border-border">
                  <TableCell className="font-medium">{p.userName || p.userId}</TableCell>
                  <TableCell>{format(new Date(p.dueDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{formatCurrency(p.amount)}</TableCell>
                  <TableCell>{getStatusBadge(p.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
