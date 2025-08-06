

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
import localApi from "@/lib/data";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types";

const statusBadge: Record<TaskStatus, string> = {
  Pianificato: "bg-blue-500/20 text-blue-700 border border-blue-500/30",
  "In corso": "bg-orange-500/20 text-orange-700 border border-orange-500/30",
  Completato: "bg-green-500/20 text-green-700 border border-green-500/30",
};

const formatDuration = (totalSeconds: number = 0) => {
    if (!totalSeconds) return 'N/A';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
};


export default async function DashboardPage() {
  
  const { tasks, technicians, clients } = await localApi.getDashboardData();

  const scheduledTasks = tasks.filter(
    (task) => task.status === "Pianificato" || task.status === "In corso"
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completato"
  ).length;
  const activeTechnicians = technicians.length;
  const totalClients = clients.length;

  const statsCards = [
    { title: "Attività Pianificate", value: scheduledTasks, icon: ListTodo, note: "Da completare questa settimana" },
    { title: "Attività Completate", value: completedTasks, icon: CalendarCheck2, note: "Questa settimana" },
    { title: "Clienti Attivi", value: totalClients, icon: UsersRound, note: "Totale clienti registrati" },
    { title: "Tecnici Attivi", value: activeTechnicians, icon: HardHat, note: "Disponibili per nuove attività" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-primary">
          Riepilogo giornaliero e settimanale delle tue attività.
        </p>
      </header>

      <div className="flex-1 p-4 sm:p-6 space-y-8">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card, index) => (
              <Card key={index} className="glow-on-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-primary">
                  {card.title}
                  </CardTitle>
                  <card.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                  <div className="text-3xl font-bold text-foreground">{card.value}</div>
                  <p className="text-xs text-foreground pt-1">
                  {card.note}
                  </p>
              </CardContent>
              </Card>
          ))}
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
                      <th className="text-left font-semibold p-4 text-primary">Descrizione</th>
                      <th className="text-left font-semibold p-4 text-primary hidden sm:table-cell">Cliente</th>
                      <th className="text-left font-semibold p-4 text-primary hidden md:table-cell">Data</th>
                      <th className="text-left font-semibold p-4 text-primary hidden lg:table-cell">Tempo Impiegato</th>
                      <th className="text-left font-semibold p-4 text-primary">Stato</th>
                      <th className="text-left font-semibold p-4 text-primary"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 5).map((task) => (
                    <tr key={task.id} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium text-foreground">{task.description}</td>
                        <td className="p-4 text-foreground hidden sm:table-cell">
                        {
                            clients.find(c => c.id === task.clientId)?.name 
                            ? clients.find(c => c.id === task.clientId)?.name 
                            : 'N/A'
                        }
                        </td>
                         <td className="p-4 text-foreground hidden md:table-cell">{task.date}</td>
                        <td className="p-4 text-foreground hidden lg:table-cell">
                            {task.status === "Completato" ? formatDuration(task.duration) : '-'}
                        </td>
                        <td className="p-4 text-muted-foreground">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusBadge[task.status])}>
                            {task.status}
                        </span>
                        </td>
                        <td className="p-4 text-right">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/attivita/${task.id}`}>Dettagli</Link>
                        </Button>
                        </td>
                    </tr>
                    ))}
                     {tasks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center h-24">
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
