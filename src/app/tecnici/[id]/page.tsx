
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
import localApi from "@/lib/data";
import {
  Phone,
  ClipboardList,
  Award,
  Calendar,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TechnicianActions } from "@/components/technician-actions";
import type { Qualification } from "@/lib/types";

export default async function TechnicianDetailPage({ params }: { params: { id: string } }) {
  
  const { id } = params;
  const technician = await localApi.getTechnician(Number(id));

  if (!technician) {
    notFound();
  }

  const [technicianTasks, clients] = await Promise.all([
      localApi.getTasksByTechnicianId(Number(id)),
      localApi.getAllClients()
  ]);

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/tecnici">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Torna indietro</span>
                </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {technician.firstName} {technician.lastName}
              </h1>
              <p className="text-primary">{technician.role}</p>
            </div>
          </div>
          <div className="self-end sm:self-auto">
            <TechnicianActions technician={technician} />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2">
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
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-primary">Nome</TableHead>
                      <TableHead className="text-primary">Scadenza</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(technician.qualifications as Qualification[])?.length > 0 ? (
                      (technician.qualifications as Qualification[]).map((q) => (
                        <TableRow key={q.id}>
                          <TableCell>{q.name}</TableCell>
                          <TableCell className="flex items-center gap-2 whitespace-nowrap">
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
              </div>
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
            <CardContent className="p-0 sm:p-6">
               <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-primary">Data</TableHead>
                      <TableHead className="text-primary">Cliente</TableHead>
                      <TableHead className="text-primary">Stato</TableHead>
                      <TableHead className="text-primary"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicianTasks.length > 0 ? (
                      technicianTasks.map((task) => {
                        const client = clients.find((c) => c.id === task.clientId);
                        return (
                          <TableRow key={task.id}>
                            <TableCell className="whitespace-nowrap">{task.date}</TableCell>
                            <TableCell>{client?.name || 'N/A'}</TableCell>
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
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
