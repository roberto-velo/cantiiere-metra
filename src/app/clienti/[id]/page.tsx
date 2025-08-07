

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import localApi from "@/lib/data";
import {
  Mail,
  MapPin,
  Phone,
  FileText,
  ClipboardList,
  Droplet,
  Map,
  ArrowLeft,
  Camera,
  HardHat
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientActions } from "@/components/client-actions";
import { FileUpload } from "@/components/file-upload";
import { AttachmentItem } from "@/components/attachment-item";

export default async function ClientDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { from?: string } }) {
  
  const { id } = params;
  const client = await localApi.getClient(Number(id));
  
  if (!client) {
    notFound();
  }

  const backPath = searchParams?.from || '/clienti';

  const [clientTasks, technicians] = await Promise.all([
    localApi.getTasksByClientId(client.id),
    localApi.getAllTechnicians()
  ]);

  const clientInfo = [
    { icon: Phone, label: "Telefono", value: client.phone, href: `tel:${client.phone}` },
    { icon: Mail, label: "Email", value: client.email, href: `mailto:${client.email}` },
  ];
  
  const poolInfo = [
      { label: "Tipo Piscina", value: client.poolType },
      { label: "Dimensioni", value: client.poolDimensions },
      { label: "Volume", value: client.poolVolume },
      { label: "Tipo Filtro", value: client.filterType },
      { label: "Tipo Trattamento", value: client.treatmentType },
  ].filter(info => info.value);

  // We need to associate attachments with their tasks
  const allPhotos = clientTasks.flatMap(t => (t.photos as any[]).map(p => ({ ...p, taskId: t.id })));
  const allDocuments = clientTasks.flatMap(t => (t.documents as any[]).map(d => ({ ...d, taskId: t.id })));


  return (
    <div className="flex flex-col flex-1" id="client-detail-page">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href={backPath}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Torna indietro</span>
                </Link>
            </Button>
            <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{client.name}</h1>
                <p className="text-primary">
                Codice cliente: <span className="font-semibold">{client.clientCode}</span>
                </p>
            </div>
          </div>
          <div id="client-actions-wrapper" className="self-end sm:self-auto">
            <ClientActions client={client} />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {clientInfo.map((info) => (
                  <li key={info.label} className="flex items-start gap-4">
                    <info.icon className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <p className="font-medium text-primary">{info.label}</p>
                      <a href={info.href} className="font-semibold text-foreground hover:underline break-all">
                        {info.value}
                      </a>
                    </div>
                  </li>
                ))}
                 <li className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <p className="font-medium text-primary">Indirizzo</p>
                      <a href={client.mapUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline flex items-center gap-2">
                        {client.address}
                        <Map className="h-4 w-4 text-primary" />
                      </a>
                    </div>
                  </li>
              </ul>
            </CardContent>
          </Card>
          
          {poolInfo.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Droplet className="h-5 w-5" />
                        Informazioni Piscina
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        {poolInfo.map((info) => (
                            <li key={info.label} className="flex items-start gap-3">
                                <div>
                                    <p className="font-medium text-primary">{info.label}</p>
                                    <p className="text-foreground font-semibold">{info.value}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ClipboardList className="h-5 w-5" />
                Storico Lavorazioni
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-primary">Data</TableHead>
                      <TableHead className="text-primary">Descrizione</TableHead>
                      <TableHead className="text-primary">Tecnico</TableHead>
                      <TableHead className="text-primary">Stato</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientTasks.length > 0 ? (
                      clientTasks.map((task) => {
                        const assignedTechnicians = technicians.filter(t => task.technicianIds.includes(t.id));
                        const technicianNames = assignedTechnicians.map(t => `${t.firstName} ${t.lastName}`).join(', ');

                        return (
                        <TableRow key={task.id}>
                          <TableCell className="whitespace-nowrap">{task.date}</TableCell>
                          <TableCell>{task.description}</TableCell>
                          <TableCell className="whitespace-nowrap">{technicianNames || 'N/A'}</TableCell>
                          <TableCell>{task.status}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/attivita/${task.id}`}>Dettagli</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">Nessuna attività trovata.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto
              </CardTitle>
               {clientTasks[0] && <FileUpload taskId={clientTasks[0].id} uploadType="photo" />}
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {allPhotos.map((photo) => (
                <AttachmentItem key={photo.id} type="photo" item={photo} taskId={photo.taskId} />
              ))}
               {allPhotos.length === 0 && <p className="text-muted-foreground col-span-full">Nessuna foto allegata.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                File Allegati
              </CardTitle>
              {clientTasks[0] && <FileUpload taskId={clientTasks[0].id} uploadType="document" />}
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                {allDocuments.length > 0 ? (
                  <ul className="space-y-2">
                      {allDocuments.map((doc) => (
                         <AttachmentItem key={doc.id} type="document" item={doc} taskId={doc.taskId} />
                      ))}
                    </ul>
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-4">
                      Nessun documento allegato.
                  </p>
                )}
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
