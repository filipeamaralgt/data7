
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from "@/components/context/AppContext";
import AIDetailsDialog from './AIDetailsDialog';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

export default function AICard({ ai, children, isActive, onToggleActive, showSwitch = true }) {
    const { theme } = useAppContext();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <>
            {/*
                The 'h-full flex flex-col' on the Card, combined with 'h-[160px] overflow-y-auto' on CardContent,
                ensures that all cards maintain a uniform height. The CardContent will always take 160px,
                and its content will scroll if it exceeds this height, preventing the overall card from growing.
                The 'flex-1' is retained for internal distribution within CardContent, though 'h-[160px]'
                primarily dictates its size.
            */}
            <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'} shadow-md h-full flex flex-col transition-opacity ${!isActive && 'opacity-60'}`}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg grid place-items-center ${ai.bgColor}`}>
                                {React.cloneElement(ai.icon, { className: `w-6 h-6 ${ai.color}` })}
                            </div>
                            <div>
                                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                                    {ai.name}
                                </CardTitle>
                            </div>
                        </div>
                        {showSwitch ? (
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`switch-${ai.name}`}
                                    checked={isActive}
                                    onCheckedChange={onToggleActive}
                                    className="data-[state=checked]:bg-green-600"
                                />
                                <Label htmlFor={`switch-${ai.name}`} className="text-xs text-slate-500 dark:text-slate-400">
                                   {isActive ? 'Ativada' : 'Desativada'}
                                </Label>
                            </div>
                        ) : (
                             <div className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                Ativo
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 pt-2">{ai.role}</p>
                </CardHeader>
                {/* Changed min-h-[160px] to h-[160px] and added overflow-y-auto to ensure uniform content area height */}
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between h-[160px] overflow-y-auto">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {ai.description}
                    </p>
                    {/* Children are also part of the scrollable content area */}
                    <div className={!isActive ? 'pointer-events-none' : ''}>
                        {children}
                    </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-dashed dark:border-slate-800">
                    <Button variant="ghost" className="w-full h-9 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsDetailsOpen(true)}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Conhecer a IA
                    </Button>
                </CardFooter>
            </Card>

            <AIDetailsDialog
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                ai={ai}
            />
        </>
    );
}
