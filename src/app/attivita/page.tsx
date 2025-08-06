

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import localApi from "@/lib/data";
import type { TaskPriority, TaskStatus, Technician } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlusCircle, ClipboardList, ArrowLeft, ArrowRight, Calendar, List, User, HardHat, Tag } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { TaskFilters } from "@/components/task-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCalendar } from "@/components/task-calendar";


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


async function TasksList({ 
  page,
  dateRange,
  searchTerm,
  date
}: { 
  page: number;
  dateRange?: string;
  searchTerm?: string;
  date?: string;
}) {
    const { tasks, totalPages } = await localApi.getTasks({ page, dateRange, searchTerm, date });
    const [clients, technicians] = await Promise.all([
        localApi.getAllClients(),
        localApi.getAllTechnicians()
    ]);

    const params = new URLSearchParams();
    if(dateRange) params.set('range', dateRange);
    if(searchTerm) params.set('q', searchTerm);
    if(date) params.set('date', date);


    const prevPageParams = new URLSearchParams(params);
    if (page > 1) prevPageParams.set('page', String(page - 1));
    const prevPage = `/attivita?${prevPageParams.toString()}`;

    const nextPageParams = new URLSearchParams(params);
    if (page < totalPages) nextPageParams.set('page', String(page + 1));
    const nextPage = `/attivita?${nextPageParams.toString()}`;


  return (
    <Card>
       {/* Mobile View - Cards */}
        <div className="grid gap-4 sm:hidden p-4">
            {tasks.map((task) => {
              const client = clients.find((c) => c.id === task.clientId);
              const assignedTechnicians = technicians.filter((t) => task.technicianIds.includes(t.id));
              return (
                  <Card key={task.id} className="w-full">
                      <CardHeader>
                          <CardTitle className="text-lg">{task.description}</CardTitle>
                          <CardDescription>{task.date} ore {task.time}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-primary"/>
                              <span>{client?.name ?? 'N/A'}</span>
                          </div>
                           <div className="flex items-center gap-2 text-sm">
                              <HardHat className="h-4 w-4 text-primary"/>
                              <span>{assignedTechnicians.map(t => `${t.firstName}`).join(', ') || 'N/A'}</span>
                          </div>
                           <div className="flex items-center gap-2">
                                <span className={cn("px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap", statusBadge[task.status])}>
                                    {task.status}
                                </span>
                                <span className={cn("px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap", priorityBadge[task.priority])}>
                                    {task.priority}
                                </span>
                           </div>
                      </CardContent>
                      <CardFooter>
                          <Button className="w-full" asChild>
                             <Link href={`/attivita/${task.id}`}>Visualizza Dettagli</Link>
                          </Button>
                      </CardFooter>
                  </Card>
              )
            })}
             {tasks.length === 0 && (
                <p className="text-center text-muted-foreground py-10">Nessuna attività trovata.</p>
              )}
        </div>

      {/* Desktop View - Table */}
      <div className="hidden sm:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-primary">Attività</TableHead>
                  <TableHead className="text-primary hidden md:table-cell">Cliente</TableHead>
                  <TableHead className="text-primary hidden lg:table-cell">Tecnico</TableHead>
                  <TableHead className="text-primary">Stato</TableHead>
                  <TableHead className="text-primary hidden md:table-cell">Priorità</TableHead>
                  <TableHead className="text-primary">Data e Ora</TableHead>
                  <TableHead className="text-primary hidden lg:table-cell">Durata</TableHead>
                  <TableHead className="text-right text-primary"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const client = clients.find(
                    (c) => c.id === task.clientId
                  );
                  const assignedTechnicians = technicians.filter(
                    (t) => task.technicianIds.includes(t.id)
                  );
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {task.description}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{client?.name}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {assignedTechnicians.map(t => `${t.firstName} ${t.lastName}`).join(', ')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                            statusBadge[task.status]
                          )}
                        >
                          {task.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                            priorityBadge[task.priority]
                          )}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{task.date} {task.time}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {task.status === "Completato" ? formatDuration(task.duration) : '-'}
                      </TableCell>
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
                {tasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      Nessuna attività trovata.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-4">
        <div className="flex w-full justify-between sm:justify-end gap-2">
            <Button variant="outline" asChild disabled={page <= 1} size="icon" className="sm:hidden">
                <Link href={prevPage}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <Button variant="outline" asChild disabled={page <= 1} className="hidden sm:inline-flex">
                <Link href={prevPage}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Precedente
                </Link>
            </Button>
            
            <span className="self-center text-sm text-muted-foreground">Pag. {page} di {totalPages}</span>

             <Button variant="outline" asChild disabled={page >= totalPages} size="icon" className="sm:hidden">
                 <Link href={nextPage}>
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
            <Button variant="outline" asChild disabled={page >= totalPages} className="hidden sm:inline-flex">
                <Link href={nextPage}>
                    Successivo
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default async function AttivitaPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const dateRange = searchParams?.range as string | undefined;
  const searchTerm = searchParams?.q as string | undefined;
  const date = searchParams?.date as string | undefined;
  
  const defaultView = date ? 'list' : 'list';

  const { tasks: allTasks } = await localApi.getTasks({
    limit: 1000, 
    dateRange,
    searchTerm,
  });

  const clients = await localApi.getAllClients();

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-6 w-6" /> Programmazione Attività
            </h1>
            <p className="text-primary">
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
            <Tabs defaultValue={defaultView} className="w-full">
              <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4">
                  <TaskFilters />
                  <TabsList className="self-start grid grid-cols-2 w-full md:w-auto">
                      <TabsTrigger value="list"><List className="mr-2"/>Lista</TabsTrigger>
                      <TabsTrigger value="calendar"><Calendar className="mr-2"/>Calendario</TabsTrigger>
                  </TabsList>
              </div>
                <TabsContent value="list">
                  
                    <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
                        <TasksList 
                          page={currentPage} 
                          dateRange={dateRange}
                          searchTerm={searchTerm}
                          date={date}
                        />
                    </Suspense>
                 
                </TabsContent>
                <TabsContent value="calendar">
                   <Card>
                    <CardContent className="p-0 sm:p-2 md:p-4">
                         <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
                            <TaskCalendar tasks={allTasks} clients={clients} />
                         </Suspense>
                    </CardContent>
                  </Card>
                </TabsContent>
            </Tabs>
      </main>
    </div>
  );
}
