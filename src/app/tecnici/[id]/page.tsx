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
import { technicians, tasks as allTasks, clients } from "@/lib/data";
import {
  ArrowLeft,
  Mail,
  Phone,
  ClipboardList,
  Award,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function TechnicianDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const technician = technicians.find((t) => t.id === params.id);
  const technicianTasks = allTasks.filter(
    (task) => task.technicianId === params.id
  );

  if (!technician) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <header className="bg-card border-b p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/tecnici">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Indietro</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {technician.firstName} {technician.lastName}
            </h1>
            <p className="text-muted-foreground">{technician.role}</p>
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
                  {technician.qualifications.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>{q.name}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(q.expiryDate).toLocaleDateString("it-IT")}
                      </TableCell>
                    </TableRow>
                  ))}
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
                  {technicianTasks.map((task) => {
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
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
