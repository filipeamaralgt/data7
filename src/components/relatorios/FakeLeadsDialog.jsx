
import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FakeLeadsDialog({ isOpen, onOpenChange, leads, onClean }) {
  const [selectedLeads, setSelectedLeads] = useState([]);

  useEffect(() => {
    // When the dialog opens, pre-select all leads as fake
    if (isOpen) {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  }, [isOpen, leads]);

  const handleSelectAll = (checked) => {
    setSelectedLeads(checked ? leads.map(lead => lead.id) : []);
  };

  const handleSelectOne = (leadId, checked) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleConfirmClean = () => {
    const leadsToClean = leads.filter(lead => selectedLeads.includes(lead.id));
    onClean(leadsToClean);
  };
  
  const allSelected = selectedLeads.length === leads.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Leads Petrificados pela Medusa</DialogTitle>
          <DialogDescription>
            Revise os leads considerados falsos. Desmarque qualquer um que você queira manter antes de confirmar a limpeza.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Motivo da Suspeita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => handleSelectOne(lead.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs">{lead.email}</span>
                             <a
                                href={lead.whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:underline flex items-center gap-1"
                            >
                                {lead.phone} <ExternalLink className="w-3 h-3"/>
                            </a>
                        </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{lead.reason}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirmClean} className="bg-green-600 hover:bg-green-700 text-white">
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar {selectedLeads.length} Lead(s) e Atualizar CRM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
