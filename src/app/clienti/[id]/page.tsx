
"use client";

import { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getClient, getTasksByClientId, deleteClient } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  MapPin,
  Phone,
  FileText,
  ClipboardList,
  Upload,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import type { Client, Task } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [clientTasks, setClientTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const fetchClientData = async () => {
        setLoading(true);
        const clientData = await getClient(params.id as string);
        if (clientData) {
          setClient(clientData);
          const tasksData = await getTasksByClientId(params.id as string);
          setClientTasks(tasksData);
        }
        setLoading(false);
      };
      fetchClientData();
    }
  }, [params.id]);
  
  const handleDeleteClient = async () => {
    if (!client) return;
    try {
      await deleteClient(client.id);
      toast({
        title: "Cliente Eliminato",
        description: `Il cliente "${client.name}" è stato eliminato con successo.`,
      });
      router.push("/clienti");
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del cliente.",
        variant: "destructive"
      });
      console.error("Error deleting client: ", error);
    }
  };

  if (loading) {
    return (
       <div className="flex flex-col flex-1">
        <header className="bg-muted/30 border-b p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-5 w-40" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
             </div>
             <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                         <CardTitle><Skeleton className="h-7 w-32" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="w-full aspect-video" />
                    </CardContent>
                </Card>
             </div>
        </main>
      </div>
    );
  }

  if (!client) {
    notFound();
  }

  const clientInfo = [
    { icon: Phone, label: "Telefono", value: client.phone },
    { icon: Mail, label: "Email", value: client.email },
    { icon: MapPin, label: "Indirizzo", value: client.address },
  ];
  
  const allDocuments = clientTasks.flatMap(t => t.documents);

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">
              Codice cliente: {client.clientCode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/clienti/${client.id}/modifica`}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifica
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                 <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione non può essere annullata. L'eliminazione del cliente
                    comporterà la rimozione di tutti i dati associati, incluse le attività passate.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClient}>
                    Continua
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {clientInfo.map((info) => (
                  <li key={info.label} className="flex items-start gap-4">
                    <info.icon className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">{info.label}</p>
                      <p className="text-muted-foreground">{info.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Storico Lavorazioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientTasks.length > 0 ? (
                    clientTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.date}</TableCell>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/attivita/${task.id}`}>Dettagli</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">Nessuna attività trovata.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documenti Allegati
              </CardTitle>
              <Button size="sm" variant="outline" disabled>
                <Upload className="mr-2 h-4 w-4" />
                Carica
              </Button>
            </CardHeader>
            <CardContent>
              {allDocuments.length > 0 ? (
                 <ul className="space-y-2">
                    {allDocuments.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <span className="font-medium">{doc.name}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.url} download>
                            Scarica
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
              ) : (
                 <p className="text-sm text-center text-muted-foreground py-4">
                    Nessun documento allegato.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Mappa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full rounded-md border"
                  src={client.mapUrl}
                  loading="lazy"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
