

import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import localApi from "@/lib/data";
import {
  Calendar,
  User,
  HardHat,
  Info,
  Tag,
  Camera,
  FileText,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskTimerWrapper } from "@/components/task-timer-wrapper";
import { TaskActions } from "@/components/task-actions";
import { AttachmentItem } from "@/components/attachment-item";

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  
  const { id } = params;
  const task = await localApi.getTask(id);
  
  if (!task) {
    notFound();
  }

  const [client, technicians] = await Promise.all([
      localApi.getClient(task.clientId),
      localApi.getTechniciansByIds(task.technicianIds)
  ]);

  const techniciansNames = technicians.map(t => `${t.firstName} ${t.lastName}`).join(', ');

  const details = [
    { icon: User, label: "Cliente", value: client?.name, href: `/clienti/${client?.id}?from=/attivita/${task.id}` },
    { icon: HardHat, label: "Tecnici Assegnati", value: techniciansNames },
    { icon: Calendar, label: "Data e Ora", value: `${task.date} ore ${task.time}` },
    { icon: Info, label: "Stato", value: task.status },
    { icon: Tag, label: "Priorità", value: task.priority },
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" asChild>
                <Link href="/attivita">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Torna indietro</span>
                </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Dettaglio Attività
              </h1>
              <p className="text-primary truncate">{task.description}</p>
            </div>
          </div>
          <div className="self-end sm:self-auto">
            <TaskActions taskId={task.id} description={task.description} />
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
                    <detail.icon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-primary">{detail.label}</p>
                      {detail.href && detail.value ? (
                        <Link href={detail.href} className="font-medium text-foreground hover:underline">
                          {detail.value}
                        </Link>
                      ) : (
                        <p className="font-medium">{detail.value || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                  {index < details.length -1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
          
          <TaskTimerWrapper taskId={task.id} initialStatus={task.status} initialDuration={task.duration} />

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto
              </CardTitle>
              <FileUpload taskId={task.id} uploadType="photo" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {task.photos.map((photo) => (
                <AttachmentItem key={photo.id} type="photo" item={photo} taskId={task.id} />
              ))}
               {task.photos.length === 0 && <p className="text-muted-foreground col-span-full">Nessuna foto allegata.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File Allegati
              </CardTitle>
              <FileUpload taskId={task.id} uploadType="document" />
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                <ul className="space-y-2">
                    {task.documents.map((doc) => (
                        <AttachmentItem key={doc.id} type="document" item={doc} taskId={task.id} />
                    ))}
                    {task.documents.length === 0 && <p className="text-muted-foreground text-center py-4">Nessun documento allegato.</p>}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
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
        </div>
      </main>
    </div>
  );
}
