

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
  Droplet
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientActions } from "@/components/client-actions";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  
  const client = await localApi.getClient(params.id);
  
  if (!client) {
    notFound();
  }

  // For now, we fetch all tasks. In a real-world scenario with many tasks,
  // this should be paginated.
  const clientTasks = await localApi.getTasksByClientId(client.id);

  const clientInfo = [
    { icon: Phone, label: "Telefono", value: client.phone },
    { icon: Mail, label: "Email", value: client.email },
    { icon: MapPin, label: "Indirizzo", value: client.address },
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
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">
              Codice cliente: {client.clientCode}
            </p>
          </div>
          <ClientActions client={client} />
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
                      <p className="font-medium text-muted-foreground">{info.label}</p>
                      <p className="text-foreground font-semibold">{info.value}</p>
                    </div>
                  </li>
                ))}
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
                                    <p className="font-medium text-muted-foreground">{info.label}</p>
                                    <p className="text-foreground font-semibold">{info.value}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
          )}

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
