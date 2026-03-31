import { useState } from "react";
import { useGetMyPlan, useGetPayments, useGeneratePayment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, CreditCard, QrCode, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function DashboardFinance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: plan, isLoading: loadingPlan } = useGetMyPlan();
  const { data: payments, isLoading: loadingPayments } = useGetPayments();
  
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [pixModalOpen, setPixModalOpen] = useState(false);

  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return <Badge className="bg-primary text-primary-foreground border-transparent">Pago</Badge>;
      case 'overdue': return <Badge variant="destructive">Atrasado</Badge>;
      default: return <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">Pendente</Badge>;
    }
  };

  const handleOpenPix = (payment: any) => {
    setSelectedPayment(payment);
    setPixModalOpen(true);
  };

  const copyPixCode = () => {
    if (selectedPayment?.pixCopyPaste) {
      navigator.clipboard.writeText(selectedPayment.pixCopyPaste);
      toast({ title: "Código PIX copiado!", description: "Cole no app do seu banco." });
    }
  };

  if (loadingPlan || loadingPayments) return <div className="text-muted-foreground animate-pulse">Carregando financeiro...</div>;

  const pendingPayments = payments?.filter(p => p.status !== 'paid') || [];
  const nextPayment = pendingPayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 bg-primary rounded-sm" />
        <h2 className="text-3xl font-display uppercase tracking-wider">Financeiro</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Info */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Meu Plano Atual</CardTitle>
          </CardHeader>
          <CardContent>
            {plan ? (
              <div>
                <div className="text-4xl font-display text-foreground mb-1 uppercase">{plan.planName}</div>
                <div className="text-2xl font-display text-primary tracking-wider mb-4">{formatCurrency(plan.price)}<span className="text-base text-muted-foreground">/mês</span></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Status: {plan.active ? <span className="text-primary font-bold">Ativo</span> : <span className="text-destructive font-bold">Inativo</span>}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground py-4">Nenhum plano ativo.</div>
            )}
          </CardContent>
        </Card>

        {/* Next Payment */}
        <Card className="bg-card border-border relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Próximo Vencimento</CardTitle>
          </CardHeader>
          <CardContent>
            {nextPayment ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="text-4xl font-display text-foreground mb-1">
                    {format(new Date(nextPayment.dueDate), 'dd/MM/yyyy')}
                  </div>
                  <div className="text-2xl font-display text-muted-foreground tracking-wider mb-4">
                    {formatCurrency(nextPayment.amount)}
                  </div>
                </div>
                <Button 
                  className="w-full font-bold uppercase tracking-widest mt-auto"
                  onClick={() => handleOpenPix(nextPayment)}
                  variant={nextPayment.status === 'overdue' ? 'destructive' : 'default'}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Pagar Agora
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-4">
                <CheckCircle2 className="w-10 h-10 text-primary/50 mb-2" />
                <p>Tudo em dia!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-xl">Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-background/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-wider">Vencimento</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Valor</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum pagamento registrado.</TableCell>
                </TableRow>
              ) : (
                payments?.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map(p => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell className="font-medium">{format(new Date(p.dueDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{formatCurrency(p.amount)}</TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell className="text-right">
                      {p.status !== 'paid' && (
                        <Button size="sm" variant="outline" className="text-xs uppercase tracking-wider h-8" onClick={() => handleOpenPix(p)}>
                          Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pix Modal */}
      <Dialog open={pixModalOpen} onOpenChange={setPixModalOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase tracking-wider text-center">Pagamento via PIX</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="py-6 flex flex-col items-center">
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-2">Valor a pagar</div>
              <div className="text-4xl font-display text-primary tracking-wider mb-8">
                {formatCurrency(selectedPayment.amount)}
              </div>
              
              {selectedPayment.pixQrCode ? (
                <>
                  <div className="bg-white p-4 rounded-xl mb-8">
                    {/* Assuming pixQrCode is a base64 or URL to an image */}
                    <img src={selectedPayment.pixQrCode.startsWith('http') ? selectedPayment.pixQrCode : `data:image/png;base64,${selectedPayment.pixQrCode}`} alt="QR Code PIX" className="w-48 h-48" />
                  </div>
                  
                  <div className="w-full space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold text-left">Código PIX (Copia e Cola)</div>
                    <div className="flex gap-2">
                      <div className="bg-background border border-border p-3 flex-1 rounded-md text-sm text-muted-foreground truncate font-mono select-all">
                        {selectedPayment.pixCopyPaste}
                      </div>
                      <Button onClick={copyPixCode} className="px-4" variant="secondary">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 opacity-50" />
                  <p>Código PIX não disponível.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
