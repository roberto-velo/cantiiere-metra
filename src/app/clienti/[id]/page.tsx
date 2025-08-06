

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
  Upload,
  Droplet,
  Map,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientActions } from "@/components/client-actions";

export default async function ClientDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { from?: string } }) {
  
  const { id } = params;
  const client = await localApi.getClient(id);
  
  if (!client) {
    notFound();
  }

  // Determine the back path
  const backPath = searchParams.from || '/clienti';


  // For now, we fetch all tasks. In a real-world scenario with many tasks,
  // this should be paginated.
  const clientTasks = await localApi.getTasksByClientId(client.id);

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


  const allDocuments = clientTasks.flatMap(t => t.documents);

  return (
    <div className="flex flex-col flex-1" id="client-detail-page">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href={backPath}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Torna indietro</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
                <p className="text-primary">
                Codice cliente: <span className="font-semibold">{client.clientCode}</span>
                </p>
            </div>
          </div>
          <ClientActions client={client} />
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
                      <a href={info.href} className="font-semibold text-foreground hover:underline">
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
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-primary">Data</TableHead>
                    <TableHead className="text-primary">Descrizione</TableHead>
                    <TableHead className="text-primary">Stato</TableHead>
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
      </main>
    </div>
  );
}
