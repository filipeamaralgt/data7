import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, CreditCard, Banknote } from 'lucide-react';

const mockHistory = [
    { id: '1', date: '01/09/2024', value: 'R$ 550,00', status: 'Pago', method: 'Cartão de Crédito', cardLast4: '4296' },
    { id: '2', date: '15/08/2024', value: 'R$ 1.200,00', status: 'Pago', method: 'Boleto', cardLast4: null },
    { id: '3', date: '01/08/2024', value: 'R$ 480,00', status: 'Pago', method: 'Cartão de Crédito', cardLast4: '5512' },
    { id: '4', date: '15/07/2024', value: 'R$ 950,00', status: 'Pago', method: 'Cartão de Crédito', cardLast4: '5512' },
    { id: '5', date: '01/07/2024', value: 'R$ 500,00', status: 'Pago', method: 'Boleto', cardLast4: null },
];

export default function HistoricoPagamentoDialog({ isOpen, onOpenChange }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Histórico de Pagamentos</DialogTitle>
          <DialogDescription>
            Aqui estão os últimos pagamentos registrados para esta conta de anúncios.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método de Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="font-medium">{item.value}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            {item.method === 'Cartão de Crédito' ? 
                                <CreditCard className="w-4 h-4 text-slate-500" /> : 
                                <Banknote className="w-4 h-4 text-slate-500" />}
                            <div>
                                <p className="font-medium">{item.method}</p>
                                {item.cardLast4 && (
                                    <p className="text-xs text-slate-500">final {item.cardLast4}</p>
                                )}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4"/>
                            <span>{item.status}</span>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}