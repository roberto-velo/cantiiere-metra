

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import localApi from "@/lib/data";
import type { TaskPriority, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlusCircle, ClipboardList, ArrowLeft, ArrowRight, Calendar, List } from "lucide-react";
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
    <>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary">Attività</TableHead>
                <TableHead className="text-primary">Cliente</TableHead>
                <TableHead className="text-primary">Tecnico</TableHead>
                <TableHead className="text-primary">Stato</TableHead>
                <TableHead className="text-primary">Priorità</TableHead>
                <TableHead className="text-primary">Data e Ora</TableHead>
                <TableHead className="text-primary">Durata</TableHead>
                <TableHead className="text-right text-primary"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const client = clients.find(
                  (c) => c.id === task.clientId
                );
                const technician = technicians.find(
                  (t) => t.id === task.technicianId
                );
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      {task.description}
                    </TableCell>
                    <TableCell>{client?.name}</TableCell>
                    <TableCell>
                      {technician?.firstName} {technician?.lastName}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          statusBadge[task.status]
                        )}
                      >
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          priorityBadge[task.priority]
                        )}
                      >
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell>{task.date} {task.time}</TableCell>
                    <TableCell>
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
      <CardFooter>
        <div className="flex w-full justify-end gap-2">
            <Button variant="outline" asChild disabled={page <= 1}>
                <Link href={prevPage}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Precedente
                </Link>
            </Button>
            <Button variant="outline" asChild disabled={page >= totalPages}>
                <Link href={nextPage}>
                    Successivo
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </CardFooter>
    </>
  );
}

export default async function AttivitaPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const dateRange = searchParams?.range as string | undefined;
  const searchTerm = searchParams?.q as string | undefined;
  const date = searchParams?.date as string | undefined;
  
  // If a specific date is selected, default the view to the list.
  const defaultView = date ? 'list' : 'list';

  // Fetch all tasks for the calendar view, applying filters.
  // The calendar needs all tasks for the given period, not just a paginated subset.
  const { tasks: allTasks } = await localApi.getTasks({
    limit: 1000, // A large limit to get all tasks for the calendar
    dateRange,
    searchTerm,
    // Do not pass date here, calendar should show all tasks for the month/week
  });

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center justify-between">
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <TaskFilters />
                  <TabsList>
                      <TabsTrigger value="list"><List className="mr-2"/>Lista</TabsTrigger>
                      <TabsTrigger value="calendar"><Calendar className="mr-2"/>Calendario</TabsTrigger>
                  </TabsList>
              </div>
                <TabsContent value="list">
                  <Card>
                    <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
                        <TasksList 
                          page={currentPage} 
                          dateRange={dateRange}
                          searchTerm={searchTerm}
                          date={date}
                        />
                    </Suspense>
                  </Card>
                </TabsContent>
                <TabsContent value="calendar">
                   <Card>
                    <CardContent className="p-2 md:p-4">
                         <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
                            <TaskCalendar tasks={allTasks} />
                         </Suspense>
                    </CardContent>
                  </Card>
                </TabsContent>
            </Tabs>
      </main>
    </div>
  );
}

