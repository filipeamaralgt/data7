
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { User, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const columns = {
    "Oportunidade": [],
    "Reunião Agendada": [],
    "Negociação": [],
    "Follow-up": [],
    "Contrato": [],
};

const columnDotColors = {
    "Oportunidade": "bg-purple-500",
    "Reunião Agendada": "bg-indigo-500",
    "Negociação": "bg-amber-500",
    "Follow-up": "bg-blue-500",
    "Contrato": "bg-sky-500",
};

const statusBorderColor = {
    'Cliente': 'border-l-green-500',
    'Contrato': 'border-l-sky-500',
    'Negociação': 'border-l-amber-500',
    'Reunião Agendada': 'border-l-indigo-500',
    'Oportunidade': 'border-l-purple-500',
    'Follow-up': 'border-l-blue-500',
    'Desqualificado': 'border-l-red-500',
    'No-show na call': 'border-l-red-500',
    'No-show no Whatsapp': 'border-l-red-500',
    'Desistiu antes da reunião': 'border-l-red-500',
    'Desistiu depois da reunião': 'border-l-red-500',
    default: 'border-l-slate-400',
};

const LeadCard = ({ lead, onEdit }) => (
    <Card 
      onClick={() => onEdit(lead)}
      className={`mb-3 hover:shadow-md cursor-pointer transition-shadow dark:bg-slate-800 border-l-4 ${statusBorderColor[lead.status] || statusBorderColor.default}`}
    >
        <CardContent className="p-4">
            <p className="font-bold text-slate-800 dark:text-slate-100">{lead.nome}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{lead.nome_empresa}</p>
            {lead.valor > 0 && (
                <div className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400 mt-2">
                    <DollarSign className="w-4 h-4" />
                    {lead.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
                {lead.funil && <Badge variant="outline">{lead.funil}</Badge>}
                {lead.is_sql && <Badge variant="destructive">SQL</Badge>}
                {lead.is_mql && <Badge variant="secondary">MQL</Badge>}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1 text-xs"><User className="w-3 h-3" />{lead.responsavel_id || 'N/A'}</div>
            </div>
        </CardContent>
    </Card>
);

export default function LeadKanbanView({ leads, setLeads, onEdit, isLoading, onUpdateLeadStatus }) {
    const [board, setBoard] = useState(columns);

    useEffect(() => {
        const newBoard = Object.keys(columns).reduce((acc, key) => ({ ...acc, [key]: [] }), {});
        leads.forEach(lead => {
            if (newBoard[lead.status]) {
                newBoard[lead.status].push(lead);
            }
        });
        setBoard(newBoard);
    }, [leads]);

    const onDragEnd = (result) => { // Removed async
        const { source, destination } = result;

        if (!destination) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const sourceColumn = board[source.droppableId];
        const destColumn = board[destination.droppableId];
        const sourceItems = [...sourceColumn];
        const destItems = source.droppableId === destination.droppableId ? sourceItems : [...destColumn];
        
        const [movedItem] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, movedItem);

        const newBoard = {
            ...board,
            [source.droppableId]: sourceItems,
            [destination.droppableId]: destItems
        };
        
        setBoard(newBoard);

        // Fire-and-forget update. No longer waiting.
        onUpdateLeadStatus(movedItem, destination.droppableId);
    };

    if (isLoading) return <div className="p-8 text-center">Carregando quadro...</div>

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 p-4 overflow-x-auto h-full">
                {Object.entries(board).map(([columnId, columnItems]) => (
                    <Droppable droppableId={columnId} key={columnId}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`w-72 flex-shrink-0 bg-slate-100/70 dark:bg-slate-900/50 rounded-lg flex flex-col`}
                            >
                                <div className={`p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3`}>
                                    <div className={`w-2.5 h-2.5 rounded-full ${columnDotColors[columnId] || 'bg-slate-400'}`}></div>
                                    <h3 className={`font-semibold text-sm text-slate-800 dark:text-slate-200`}>{columnId}</h3>
                                    <span className="ml-auto text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 rounded-full px-2 py-0.5">
                                        {columnItems.length}
                                    </span>
                                </div>
                                <div className={`p-3 overflow-y-auto flex-1 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-800/60' : ''}`}>
                                    {columnItems.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <LeadCard lead={item} onEdit={onEdit}/>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
}
