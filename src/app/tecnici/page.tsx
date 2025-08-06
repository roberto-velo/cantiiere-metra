

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import localApi from "@/lib/data";
import { PlusCircle, Search, HardHat, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function TechniciansList({ page, searchTerm }: { page: number, searchTerm?: string }) {
    const { technicians, totalPages } = await localApi.getTechnicians(page);
    
    const filteredTechnicians = searchTerm
        ? technicians.filter(
            (technician) =>
            technician.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            technician.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : technicians;

    return (
        <>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="text-primary">Nome</TableHead>
                            <TableHead className="text-primary">Ruolo</TableHead>
                            <TableHead className="text-primary">Telefono</TableHead>
                            <TableHead className="text-right text-primary">Azioni</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTechnicians.map((technician) => (
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
                                <Button size="sm" disabled>
                                    Nuova Attività
                                </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        {!filteredTechnicians.length && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                Nessun tecnico trovato.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex w-full justify-end gap-2">
                    <Button variant="outline" asChild disabled={page <= 1}>
                        <Link href={`/tecnici?page=${page - 1}`}>
                            <ArrowLeft className="mr-2" />
                            Precedente
                        </Link>
                    </Button>
                    <Button variant="outline" asChild disabled={page >= totalPages}>
                        <Link href={`/tecnici?page=${page + 1}`}>
                            Successivo
                            <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </>
    );
}


export default function TecniciPage({ searchParams }: { searchParams?: { page?: string, q?: string } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const searchTerm = searchParams?.q;

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
            <Link href="/tecnici/nuovo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuovo Tecnico
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader>
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca tecnico per nome..."
                  className="pl-10"
                  defaultValue={searchTerm}
                  disabled // Search to be implemented
                />
              </div>
          </CardHeader>
           <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
                <TechniciansList page={currentPage} searchTerm={searchTerm} />
           </Suspense>
        </Card>
      </main>
    </div>
  );
}
