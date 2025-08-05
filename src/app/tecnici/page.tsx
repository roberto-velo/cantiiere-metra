import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { technicians } from "@/lib/data";
import { PlusCircle, Search, HardHat } from "lucide-react";
import Link from "next/link";

export default function TecniciPage() {
  return (
    <div className="flex flex-col flex-1">
       <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <HardHat className="h-6 w-6" /> Tecnici
                </h1>
                <p className="text-muted-foreground">
                Gestisci l'anagrafinca dei tuoi dipendenti e tecnici.
                </p>
            </div>
            <Button asChild>
                <Link href="#">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuovo Tecnico
                </Link>
            </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cerca tecnico per nome..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ruolo</TableHead>
                    <TableHead>Telefono</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.map((technician) => (
                    <TableRow key={technician.id}>
                      <TableCell className="font-medium">
                        {technician.firstName} {technician.lastName}
                      </TableCell>
                      <TableCell>{technician.role}</TableCell>
                      <TableCell>{technician.phone}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tecnici/${technician.id}`}>
                            Visualizza
                          </Link>
                        </Button>
                         <Button size="sm" asChild>
                          <Link href={`/attivita/nuova?technicianId=${technician.id}`}>
                            Nuova Attività
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
