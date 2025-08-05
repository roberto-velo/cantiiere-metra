
"use client";

import { useState, useEffect } from "react";
import { FileTagger } from "@/components/file-tagger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTask, getClient, getTechnician, updateTaskStatus } from "@/lib/firebase";
import {
  Calendar,
  User,
  HardHat,
  Info,
  Tag,
  Camera,
  FileText,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import type { Task, TaskStatus, Client, Technician } from "@/lib/types";
import { TaskTimer } from "@/components/task-timer";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
        const fetchTaskData = async () => {
            setLoading(true);
            const taskData = await getTask(params.id as string);
            if(taskData) {
                setTask(taskData);
                const [clientData, technicianData] = await Promise.all([
                    getClient(taskData.clientId),
                    getTechnician(taskData.technicianId)
                ]);
                setClient(clientData);
                setTechnician(technicianData);
            }
            setLoading(false);
        }
        fetchTaskData();
    }
  }, [params.id]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    setTask(prevTask => prevTask ? { ...prevTask, status: newStatus } : null);
    await updateTaskStatus(task.id, newStatus);
  };

  if (loading) {
     return (
       <div className="flex flex-col flex-1">
        <header className="bg-muted/30 border-b p-4 sm:p-6">
            <div className="flex items-center gap-4">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </div>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle><Skeleton className="h-7 w-48" /></CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                       {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle><Skeleton className="h-7 w-32" /></CardTitle></CardHeader>
                    <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                 <Card>
                    <CardHeader><CardTitle><Skeleton className="h-7 w-40" /></CardTitle></CardHeader>
                    <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle><Skeleton className="h-7 w-40" /></CardTitle></CardHeader>
                    <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                </Card>
            </div>
        </main>
      </div>
     );
  }
  
  if (!task) notFound();

  const details = [
    { icon: User, label: "Cliente", value: client?.name, href: `/clienti/${client?.id}` },
    { icon: HardHat, label: "Tecnico Assegnato", value: `${technician?.firstName} ${technician?.lastName}`, href: `/tecnici/${technician?.id}` },
    { icon: Calendar, label: "Data e Ora", value: `${task.date} ore ${task.time}` },
    { icon: Info, label: "Stato", value: task.status },
    { icon: Tag, label: "Priorità", value: task.priority },
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dettaglio Attività
            </h1>
            <p className="text-muted-foreground">{task.description}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Principali</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {details.map((detail, index) => (
                <div key={index}>
                  <div className="flex items-center gap-4 text-sm">
                    <detail.icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-muted-foreground">{detail.label}</p>
                      {detail.href ? (
                        <Link href={detail.href} className="font-medium text-primary hover:underline">
                          {detail.value}
                        </Link>
                      ) : (
                        <p className="font-medium">{detail.value}</p>
                      )}
                    </div>
                  </div>
                  {index < details.length -1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {task.photos.map((photo) => (
                <div key={photo.id} className="space-y-2">
                  <Image
                    src={photo.url}
                    alt={photo.description}
                    width={200}
                    height={200}
                    className="rounded-md object-cover aspect-square w-full"
                    data-ai-hint="construction site"
                  />
                  <p className="text-xs text-muted-foreground text-center">{photo.description}</p>
                </div>
              ))}
               {task.photos.length === 0 && <p className="text-muted-foreground col-span-full">Nessuna foto allegata.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File Allegati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {task.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                        <span className="font-medium">{doc.name}</span>
                        <Button variant="ghost" size="sm" asChild>
                            <a href={doc.url} download>Scarica</a>
                        </Button>
                    </li>
                ))}
                {task.documents.length === 0 && <p className="text-muted-foreground">Nessun documento allegato.</p>}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <TaskTimer initialStatus={task.status} onStatusChange={handleStatusChange} />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5"/>
                        Note Tecniche
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md min-h-24">
                        {task.notes || 'Nessuna nota inserita.'}
                    </p>
                </CardContent>
            </Card>
            <FileTagger context={`File for task: ${task.description}`} />
        </div>
      </main>
    </div>
  );
}

