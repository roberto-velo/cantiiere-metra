
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTechnician, getTasksByTechnicianId, getClients } from "@/lib/firebase";
import {
  Mail,
  Phone,
  ClipboardList,
  Award,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import type { Client, Task, Technician } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function TechnicianDetailPage() {
  const params = useParams<{ id: string }>();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [technicianTasks, setTechnicianTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     if (params.id) {
      const fetchTechnicianData = async () => {
        setLoading(true);
        const technicianData = await getTechnician(params.id as string);
        if (technicianData) {
          setTechnician(technicianData);
          const [tasksData, clientsData] = await Promise.all([
            getTasksByTechnicianId(params.id as string),
            getClients()
          ]);
          setTechnicianTasks(tasksData);
          setClients(clientsData);
        }
        setLoading(false);
      };
      fetchTechnicianData();
    }
  }, [params.id]);

  if (loading) {
    return (
       <div className="flex flex-col flex-1">
        <header className="bg-muted/30 border-b p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-2">
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
             </div>
             <div className="space-y-6">
                 <Card>
                    <CardHeader>
                         <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
             </div>
        </main>
      </div>
    );
  }

  if (!technician) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {technician.firstName} {technician.lastName}
            </h1>
            <p className="text-muted-foreground">{technician.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled>
              <Pencil className="mr-2 h-4 w-4" />
              Modifica
            </Button>
            <Button variant="destructive" disabled>
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Contatto</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>{technician.phone}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Qualifiche e Certificazioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Scadenza</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technician.qualifications.length > 0 ? (
                    technician.qualifications.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell>{q.name}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(q.expiryDate).toLocaleDateString("it-IT")}
                        </TableCell>
                      </TableRow>
                    ))
                   ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">Nessuna qualifica trovata.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Storico Attività Svolte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicianTasks.length > 0 ? (
                    technicianTasks.map((task) => {
                      const client = clients.find((c) => c.id === task.clientId);
                      return (
                        <TableRow key={task.id}>
                          <TableCell>{task.date}</TableCell>
                          <TableCell>{client?.name}</TableCell>
                          <TableCell>{task.status}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/attivita/${task.id}`}>Dettagli</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">Nessuna attività trovata.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

