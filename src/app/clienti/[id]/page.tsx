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
import { clients, tasks as allTasks } from "@/lib/data";
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
import { notFound } from "next/navigation";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = clients.find((c) => c.id === params.id);
  const clientTasks = allTasks.filter((task) => task.clientId === params.id);

  if (!client) {
    notFound();
  }

  const clientInfo = [
    { icon: Phone, label: "Telefono", value: client.phone },
    { icon: Mail, label: "Email", value: client.email },
    { icon: MapPin, label: "Indirizzo", value: client.address },
  ];

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
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Modifica
            </Button>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina
            </Button>
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
                  {clientTasks.map((task) => (
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
                  ))}
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
              <Button size="sm" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Carica
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {allTasks
                  .filter(t => t.clientId === client.id)
                  .flatMap(t => t.documents)
                  .map((doc) => (
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
