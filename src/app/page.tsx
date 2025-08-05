
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  HardHat,
  UsersRound,
  Bell,
  CalendarCheck2,
  ListTodo,
} from "lucide-react";
import Link from "next/link";
import { getTasks, getTechnicians, getClients } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, Client, Technician } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const statusBadge: Record<TaskStatus, string> = {
  Pianificato: "bg-blue-500/20 text-blue-700 border border-blue-500/30",
  "In corso": "bg-orange-500/20 text-orange-700 border border-orange-500/30",
  Completato: "bg-green-500/20 text-green-700 border border-green-500/30",
};


export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const [tasksData, techniciansData, clientsData] = await Promise.all([
            getTasks(),
            getTechnicians(),
            getClients()
        ]);
        setTasks(tasksData);
        setTechnicians(techniciansData);
        setClients(clientsData);
        setLoading(false);
    }
    fetchData();
  }, []);


  const scheduledTasks = tasks.filter(
    (task) => task.status === "Pianificato" || task.status === "In corso"
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completato"
  ).length;
  const activeTechnicians = technicians.length;
  const notifications = 3; // Mock data

  const statsCards = [
    { title: "Attività Pianificate", value: scheduledTasks, icon: ListTodo, note: "Da completare questa settimana" },
    { title: "Attività Completate", value: completedTasks, icon: CalendarCheck2, note: "Questa settimana" },
    { title: "Tecnici Attivi", value: activeTechnicians, icon: HardHat, note: "Disponibili per nuove attività" },
    { title: "Notifiche", value: notifications, icon: Bell, note: "Da controllare" }
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Riepilogo giornaliero e settimanale delle tue attività.
        </p>
      </header>

      <div className="flex-1 p-4 sm:p-6 space-y-8">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
             statsCards.map((_, index) => (
                 <Card key={index}>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-5" />
                    </CardHeader>
                     <CardContent>
                        <Skeleton className="h-8 w-12 mb-1" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                 </Card>
             ))
          ) : (
            statsCards.map((card, index) => (
                <Card key={index} className="glow-on-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary">
                    {card.title}
                    </CardTitle>
                    <card.icon className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{card.value}</div>
                    <p className="text-xs text-muted-foreground pt-1">
                    {card.note}
                    </p>
                </CardContent>
                </Card>
            ))
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">
            Attività Recenti
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left font-semibold p-4 text-muted-foreground">Descrizione</th>
                      <th className="text-left font-semibold p-4 text-muted-foreground">Cliente</th>
                      <th className="text-left font-semibold p-4 text-muted-foreground">Stato</th>
                      <th className="text-left font-semibold p-4 text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                       Array.from({length: 3}).map((_, i) => (
                           <tr key={i} className="border-b last:border-b-0">
                                <td className="p-4"><Skeleton className="h-5 w-full" /></td>
                                <td className="p-4"><Skeleton className="h-5 w-32" /></td>
                                <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                <td className="p-4 text-right"><Skeleton className="h-9 w-24" /></td>
                           </tr>
                       ))
                    ) : (
                        tasks.slice(0, 3).map((task) => (
                        <tr key={task.id} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                            <td className="p-4 font-medium text-foreground">{task.description}</td>
                            <td className="p-4 text-muted-foreground">
                            {
                                clients.find(c => c.id === task.clientId)?.name 
                                ? clients.find(c => c.id === task.clientId)?.name 
                                : 'N/A'
                            }
                            </td>
                            <td className="p-4 text-muted-foreground">
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusBadge[task.status])}>
                                {task.status}
                            </span>
                            </td>
                            <td className="p-4 text-right">
                            <Button asChild variant="ghost" size="sm">
                                <Link href={`/attivita/${task.id}`}>Dettagli</Link>
                            </Button>
                            </td>
                        </tr>
                        ))
                    )}
                     {!loading && tasks.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center h-24">
                          Nessuna attività recente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
