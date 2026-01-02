
import React, { useState, useEffect } from 'react';
import { EstrategiaFunil } from '@/entities/EstrategiaFunil';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { InvokeLLM } from '@/integrations/Core'; // Added import
import { Loader2 } from 'lucide-react'; // Added import

const ETAPAS = ["Topo de Funil", "Meio de Funil", "Fundo de Funil", "Recuperação", "Conversão"];
const PILARES = ["Automação 🤖", "Tráfego Pago 🚀", "Comercial"];
const VALIDACOES = ["Não iniciada", "Em teste", "Validada", "Ruim"];

export default function EstrategiaFunilForm({ isOpen, setIsOpen, onSave, estrategiaToEdit }) {
  const getInitialData = () => ({
    nome: '',
    etapa_funil: 'Topo de Funil',
    pilar: 'Automação 🤖',
    validacao: 'Não iniciada',
    descricao: '',
    objetivo: '',
    ferramentas: '',
    observacao: '',
    ilustracao_json: null // Added default for new field
  });

  const [formData, setFormData] = useState(getInitialData());
  const [isGenerating, setIsGenerating] = useState(false); // Added state
  const { toast } = useToast();

  useEffect(() => {
    if (estrategiaToEdit) {
      setFormData(estrategiaToEdit);
    } else {
      setFormData(getInitialData());
    }
  }, [estrategiaToEdit, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true); // Set generating state to true
    try {
      if (estrategiaToEdit) {
        await EstrategiaFunil.update(estrategiaToEdit.id, formData);
        toast({ title: "Estratégia atualizada com sucesso!" });
      } else {
        // Gerar ilustração com IA antes de criar
        const prompt = `
            Você é um estrategista de marketing e designer visual. Sua tarefa é transformar uma estratégia de marketing em um conceito de fluxograma simples e bonito.
            Com base nos detalhes da estratégia fornecidos (nome, objetivo, descrição), gere um objeto JSON que descreva esse fluxo visual.
            A estratégia é:
            - Nome: ${formData.nome}
            - Objetivo: ${formData.objetivo}
            - Descrição: ${formData.descricao}
            Analise o objetivo e a descrição para identificar os principais estágios. O JSON deve seguir estritamente este esquema. Retorne apenas o JSON.
        `;
        const response_json_schema = {
          type: "object",
          properties: {
            title: { type: "string", description: "Um título curto, criativo e inspirador para o fluxo visual." },
            description: { type: "string", description: "Um resumo de uma frase do fluxo visual." },
            steps: {
              type: "array", items: {
                type: "object", properties: {
                  icon: { type: "string", description: "O nome de um ícone lucide-react válido. Escolha entre: 'Users', 'MousePointerClick', 'Filter', 'FileText', 'Zap', 'CalendarCheck', 'BrainCircuit', 'MessageSquare', 'Goal'." },
                  label: { type: "string", description: "Um rótulo conciso para esta etapa." },
                  color: { type: "string", description: "Um código de cor hexadecimal pastel suave para o fundo do ícone." }
                }, required: ["icon", "label", "color"]
              }
            }
          }, required: ["title", "description", "steps"]
        };
        
        const illustration = await InvokeLLM({ prompt, response_json_schema });

        if (!illustration || !illustration.steps || illustration.steps.length === 0) { // Added check for empty steps
            throw new Error("A IA não conseguiu gerar uma ilustração válida. Tente ajustar a descrição.");
        }

        const finalData = { ...formData, ilustracao_json: illustration };
        await EstrategiaFunil.create(finalData);
        toast({ title: "Estratégia criada com sucesso!" });
      }
      onSave();
    } catch (error) {
      console.error("Erro ao salvar estratégia:", error);
      toast({ title: error.message || "Erro ao salvar estratégia", variant: "destructive" });
    } finally {
      setIsGenerating(false); // Reset generating state
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{estrategiaToEdit ? 'Editar Estratégia' : 'Criar Nova Estratégia de Funil'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da sua estratégia de marketing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">Nome</Label>
            <Input id="nome" value={formData.nome} onChange={e => handleChange('nome', e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="etapa_funil" className="text-right">Etapa</Label>
            <Select value={formData.etapa_funil} onValueChange={value => handleChange('etapa_funil', value)}>
              <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>{ETAPAS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pilar" className="text-right">Pilar</Label>
            <Select value={formData.pilar} onValueChange={value => handleChange('pilar', value)}>
              <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>{PILARES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="validacao" className="text-right">Validação</Label>
            <Select value={formData.validacao} onValueChange={value => handleChange('validacao', value)}>
              <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>{VALIDACOES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="descricao" className="text-right pt-2">Descrição</Label>
            <Textarea id="descricao" value={formData.descricao} onChange={e => handleChange('descricao', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="objetivo" className="text-right">Objetivo</Label>
            <Input id="objetivo" value={formData.objetivo} onChange={e => handleChange('objetivo', e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ferramentas" className="text-right">Ferramentas</Label>
            <Input id="ferramentas" value={formData.ferramentas} onChange={e => handleChange('ferramentas', e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="observacao" className="text-right pt-2">Observação</Label>
            <Textarea id="observacao" value={formData.observacao} onChange={e => handleChange('observacao', e.target.value)} className="col-span-3" />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isGenerating}>
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {estrategiaToEdit ? 'Salvar Alterações' : (isGenerating ? 'Gerando Ilustração...' : 'Salvar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
