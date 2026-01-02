
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAppContext } from "@/components/context/AppContext"; // Import useAppContext from React Context

export default function Marketing() {
  const { theme } = useAppContext(); // Get theme from React Context

  const metasDiarias = [
    { dia: "01", leads: 45, mqls: 32, agendamentos: 18, metaLeads: 40, metaMqls: 28, metaAgendamentos: 15 },
    { dia: "02", leads: 52, mqls: 38, agendamentos: 22, metaLeads: 40, metaMqls: 28, metaAgendamentos: 15 },
    { dia: "03", leads: 38, mqls: 26, agendamentos: 12, metaLeads: 40, metaMqls: 28, metaAgendamentos: 15 },
    { dia: "04", leads: 48, mqls: 35, agendamentos: 19, metaLeads: 40, metaMqls: 28, metaAgendamentos: 15 },
    { dia: "05", leads: 55, mqls: 42, agendamentos: 24, metaLeads: 40, metaMqls: 28, metaAgendamentos: 15 }
  ];

  const custoPorLead = [
    { data: "01/12", cpl: 38.50 },
    { data: "05/12", cpl: 35.20 },
    { data: "10/12", cpl: 39.80 },
    { data: "15/12", cpl: 36.77 },
    { data: "20/12", cpl: 34.90 },
    { data: "25/12", cpl: 37.20 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Marketing
        </h1>
        <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          Análise de performance de campanhas e geração de leads
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-[#3ABEF9]" />
              <Badge className="bg-[#22C55E] text-white">112% da meta</Badge>
            </div>
            <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Leads do Mês
            </p>
            <p className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              1.240
            </p>
            <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
              Meta: 1.100
            </p>
          </CardContent>
        </Card>

        <Card className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-[#1BC4E9]" />
              <Badge className="bg-[#22C55E] text-white">106% da meta</Badge>
            </div>
            <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              MQLs do Mês
            </p>
            <p className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              892
            </p>
            <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
              Meta: 840
            </p>
          </CardContent>
        </Card>

        <Card className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-[#22C55E]" />
              <Badge className="bg-[#FACC15] text-gray-900">95% da meta</Badge>
            </div>
            <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Agendamentos
            </p>
            <p className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              456
            </p>
            <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
              Meta: 480
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
        <CardHeader>
          <CardTitle className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Performance Diária - Dezembro 2024
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={metasDiarias}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="dia" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
              <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                  borderColor: theme === "dark" ? "#374151" : "#E5E7EB"
                }}
              />
              <Legend />
              <Bar dataKey="leads" fill="#3ABEF9" name="Leads" radius={[8, 8, 0, 0]} />
              <Bar dataKey="mqls" fill="#1BC4E9" name="MQLs" radius={[8, 8, 0, 0]} />
              <Bar dataKey="agendamentos" fill="#22C55E" name="Agendamentos" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
        <CardHeader>
          <CardTitle className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Custo por Lead (CPL)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={custoPorLead}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="data" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
              <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
                  borderColor: theme === "dark" ? "#374151" : "#E5E7EB"
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cpl"
                stroke="#3ABEF9"
                strokeWidth={3}
                name="CPL (R$)"
                dot={{ fill: "#3ABEF9", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
