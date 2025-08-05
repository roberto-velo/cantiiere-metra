import { FileTagger } from "@/components/file-tagger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { clients, tasks, technicians } from "@/lib/data";
import {
  ArrowLeft,
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
import { notFound } from "next/navigation";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = tasks.find((t) => t.id === params.id);
  if (!task) notFound();

  const client = clients.find((c) => c.id === task.clientId);
  const technician = technicians.find((t) => t.id === task.technicianId);

  const details = [
    { icon: User, label: "Cliente", value: client?.name, href: `/clienti/${client?.id}` },
    { icon: HardHat, label: "Tecnico Assegnato", value: `${technician?.firstName} ${technician?.lastName}`, href: `/tecnici/${technician?.id}` },
    { icon: Calendar, label: "Data e Ora", value: `${task.date} ore ${task.time}` },
    { icon: Info, label: "Stato", value: task.status },
    { icon: Tag, label: "Priorità", value: task.priority },
  ];

  return (
    <div className="flex flex-col">
      <header className="bg-card border-b p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/attivita">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Indietro</span>
            </Link>
          </Button>
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
