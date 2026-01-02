import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAppContext } from "@/components/context/AppContext";

export default function AIDetailsDialog({ isOpen, onOpenChange, ai }) {
    const { theme } = useAppContext();

    if (!ai) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'}>
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg grid place-items-center ${ai.bgColor}`}>
                            {React.cloneElement(ai.icon, { className: `w-7 h-7 ${ai.color}` })}
                        </div>
                        <div>
                            <DialogTitle className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{ai.name}</DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">{ai.role}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="py-4 space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {ai.story.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}