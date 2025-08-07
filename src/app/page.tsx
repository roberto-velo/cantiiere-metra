
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HardHat,
  UsersRound,
  CalendarCheck2,
  ListTodo,
  ArrowUpRight,
  PlusCircle,
  Bell,
} from "lucide-react";
import Link from "next/link";
import localApi from "@/lib/data";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReminderItem } from "@/components/reminder-item";


const statusBadge: Record<TaskStatus, string> = {
  Pianificato: "bg-blue-500/20 text-blue-700 border border-blue-500/30",
  "In corso": "bg-orange-500/20 text-orange-700 border border-orange-500/30",
  Completato: "bg-green-500/20 text-green-700 border border-green-500/30",
};


export default async function DashboardPage() {
  
  const { tasks, technicians, clients, reminders } = await localApi.getDashboardData();

  const scheduledTasks = tasks.filter(
    (task) => task.status === "Pianificato"
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completato"
  ).length;
  const activeTechnicians = technicians.length;
  const totalClients = clients.length;

  const statsCards = [
    { title: "Attività Pianificate", value: scheduledTasks, icon: ListTodo, note: "Da completare questa settimana", noteColor: "text-primary", iconColor: "text-blue-500" },
    { title: "Attività Completate", value: completedTasks, icon: CalendarCheck2, note: "Questa settimana", noteColor: "text-primary", iconColor: "text-purple-500" },
    { title: "Clienti Attivi", value: totalClients, icon: UsersRound, note: "Totale clienti registrati", noteColor: "text-primary", iconColor: "text-orange-500" },
    { title: "Tecnici Attivi", value: activeTechnicians, icon: HardHat, note: "Disponibili per nuove attività", noteColor: "text-primary", iconColor: "text-yellow-500" },
  ];

  return (
    <div className="flex flex-col flex-1 gap-4 sm:gap-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {statsCards.map((card, index) => (
             <Card key={index} className="sm:col-span-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <card.icon className={cn("h-4 w-4 text-muted-foreground", card.iconColor)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className={cn("text-xs", card.noteColor || 'text-muted-foreground')}>
                  {card.note}
                </p>
              </CardContent>
            </Card>
        ))}
      </div>

       <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Attività Recenti</CardTitle>
                  <p className="text-sm text-primary">
                    Le ultime 5 attività registrate nel sistema.
                  </p>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="/attivita">
                    Tutte
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-primary">Descrizione</TableHead>
                      <TableHead className="hidden sm:table-cell text-primary">
                        Cliente
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-primary">
                        Data
                      </TableHead>
                      <TableHead className="text-right text-primary">Stato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {tasks.slice(0, 5).map((task) => (
                        <TableRow key={task.id}>
                           <TableCell>
                            <div className="font-medium">{task.description}</div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                             {clients.find(c => c.id === task.clientId)?.name ?? 'N/A'}
                          </TableCell>
                           <TableCell className="hidden md:table-cell whitespace-nowrap">
                            {task.date} <span className="text-foreground">{task.time}</span>
                          </TableCell>
                          <TableCell className="text-right">
                             <Badge className={cn("text-xs", statusBadge[task.status])} variant="outline">
                                {task.status}
                             </Badge>
                          </TableCell>
                        </TableRow>
                    ))}
                     {tasks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                          Nessuna attività recente.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Promemoria
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/promemoria/nuovo">
                      <PlusCircle className="mr-2" />
                      Nuovo
                    </Link>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Promemoria e scadenze imminenti.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reminders.length > 0 ? (
                  <ScrollArea className="h-72">
                    <div className="space-y-6 pr-4">
                      {reminders.map((reminder) => (
                        <ReminderItem key={reminder.id} reminder={reminder} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-full p-8">
                     <Bell className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Nessun promemoria attivo.
                    </p>
                     <Button size="sm" className="mt-4" asChild>
                       <Link href="/promemoria/nuovo">Crea Promemoria</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
    </div>
  );
}
