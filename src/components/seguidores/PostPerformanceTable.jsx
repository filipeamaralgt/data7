
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

const formatCurrency = (value) => value.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' });
const formatPercent = (value) => `${value.toFixed(2)}%`;

const mockPosts = [
    {
        thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        type: "Vídeo",
        date: "05/10/2024",
        followers: 125,
        valor_investido: 312.50,
        visitas_perfil: 980,
        reach: 12450,
        engagement: "5.8%",
        cpc: 1.50,
    },
    {
        thumbnail: "https://images.unsplash.com/photo-1593433693633-59535a242544?q=80&w=3248&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        type: "Carrossel",
        date: "03/10/2024",
        followers: 98,
        valor_investido: 186.20,
        visitas_perfil: 750,
        reach: 9800,
        engagement: "7.2%",
        cpc: 1.25,
    },
    {
        thumbnail: "https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        type: "Imagem",
        date: "01/10/2024",
        followers: 72,
        valor_investido: 194.40,
        visitas_perfil: 610,
        reach: 7500,
        engagement: "4.1%",
        cpc: 1.90,
    },
    {
        thumbnail: "https://images.unsplash.com/photo-1611162616805-6a406a6c3f3a?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        type: "Reels",
        date: "29/09/2024",
        followers: 210,
        valor_investido: 400.00,
        visitas_perfil: 2300,
        reach: 25300,
        engagement: "9.3%",
        cpc: 0.85,
    },
].map(post => ({
    ...post,
    custo_seguidor: post.followers > 0 ? post.valor_investido / post.followers : 0,
    conversao_perfil: post.visitas_perfil > 0 ? (post.followers / post.visitas_perfil) * 100 : 0,
    ctr_perfil: post.reach > 0 ? (post.visitas_perfil / post.reach) * 100 : 0,
    cpm: post.reach > 0 ? (post.valor_investido / (post.reach / 1000)) : 0,
}));

const typeColors = {
    Vídeo: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    Carrossel: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    Imagem: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Reels: "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300",
};

export default function PostPerformanceTable() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance por Post</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-auto scrollbar-slim">
                    <Table className="min-w-[1200px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px] sticky left-0 bg-white dark:bg-slate-900">Post</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Seguidores</TableHead>
                                <TableHead className="text-right">Custo / Seguidor</TableHead>
                                <TableHead className="text-right">Investimento</TableHead>
                                <TableHead className="text-right">Visitas ao Perfil</TableHead>
                                <TableHead className="text-right">Conversão Perfil</TableHead>
                                <TableHead className="text-right">Alcance</TableHead>
                                <TableHead className="text-right">CTR Visitas</TableHead>
                                <TableHead className="text-right">CPM</TableHead>
                                <TableHead className="text-right">CPC</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPosts.map((post, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-900">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 rounded-md">
                                                <AvatarImage src={post.thumbnail} alt="Post thumbnail" />
                                                <AvatarFallback className="rounded-md">P</AvatarFallback>
                                            </Avatar>
                                            <Badge className={`${typeColors[post.type]} border-none`}>{post.type}</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>{post.date}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 font-semibold text-green-600">
                                            <TrendingUp className="h-4 w-4"/>
                                            {post.followers}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(post.custo_seguidor)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(post.valor_investido)}</TableCell>
                                    <TableCell className="text-right font-medium">{post.visitas_perfil.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-medium">{formatPercent(post.conversao_perfil)}</TableCell>
                                    <TableCell className="text-right font-medium">{post.reach.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-medium">{formatPercent(post.ctr_perfil)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(post.cpm)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(post.cpc)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
