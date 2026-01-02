import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function EstrategiaCard({ estrategia, onEdit, onDelete }) {
    if (!estrategia) {
        // Return null or a placeholder if the strategy object is not provided
        return null;
    }

    const statusConfig = {
        'Validada': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Em Teste': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'Ruim': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };

    return (
        <Card className="flex flex-col dark:bg-slate-900 border-slate-200/70 dark:border-slate-800">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{estrategia.nome}</CardTitle>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4"/>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-red-500"><Trash2 className="mr-2 h-4 w-4"/>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardDescription>{estrategia.tipo}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-slate-600 dark:text-slate-400">{estrategia.descricao}</p>
            </CardContent>
            <CardFooter>
                <Badge variant="outline" className={`font-semibold ${statusConfig[estrategia.status]}`}>{estrategia.status}</Badge>
            </CardFooter>
        </Card>
    );
}