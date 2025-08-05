
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clients, tasks, technicians } from "@/lib/data";
import type { TaskPriority, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlusCircle, Search, ClipboardList, Calendar } from "lucide-react";
import Link from "next/link";

const priorityBadge: Record<TaskPriority, string> = {
  Alta: "bg-red-500/20 text-red-700 border border-red-500/30",
  Media: "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30",
  Bassa: "bg-green-500/20 text-green-700 border border-green-500/30",
};

const statusBadge: Record<TaskStatus, string> = {
  Pianificato: "bg-blue-500/20 text-blue-700 border border-blue-500/30",
  "In corso": "bg-orange-500/20 text-orange-700 border border-orange-500/30",
  Completato: "bg-green-500/20 text-green-700 border border-green-500/30",
};

export default function AttivitaPage() {
  return (
    <div className="flex flex-col flex-1">
       <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <ClipboardList className="h-6 w-6" /> Programmazione Attività
                </h1>
                <p className="text-muted-foreground">
                Crea, visualizza e gestisci le attività dei tecnici.
                </p>
            </div>
            <Button asChild>
                <Link href="/attivita/nuova">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuova Attività
                </Link>
            </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <Tabs defaultValue="lista">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="lista">
                <ClipboardList className="mr-2 h-4 w-4" /> Lista
              </TabsTrigger>
              <TabsTrigger value="calendario">
                <Calendar className="mr-2 h-4 w-4" /> Calendario
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="lista">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cerca attività per descrizione..." className="pl-10" />
                  </div>
                  <div className="flex gap-2 w-full flex-1 md:w-auto">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtra per cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtra per tecnico" />
                      </SelectTrigger>
                      <SelectContent>
                         {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attività</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Tecnico</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Priorità</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => {
                        const client = clients.find(c => c.id === task.clientId);
                        const technician = technicians.find(t => t.id === task.technicianId);
                        return (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">{task.description}</TableCell>
                            <TableCell>{client?.name}</TableCell>
                            <TableCell>{technician?.firstName} {technician?.lastName}</TableCell>
                            <TableCell>
                                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusBadge[task.status])}>
                                    {task.status}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", priorityBadge[task.priority])}>
                                    {task.priority}
                                </span>
                            </TableCell>
                            <TableCell>{task.date}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/attivita/${task.id}`}>
                                  Visualizza
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calendario">
            <Card>
              <CardHeader>
                <CardTitle>Calendario Attività</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-96 bg-muted rounded-md">
                    <p className="text-muted-foreground">La vista calendario sarà implementata qui.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
