

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import localApi from "@/lib/data";
import { PlusCircle, HardHat, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { TechnicianSearch } from "@/components/technician-search";

async function TechniciansList({ page, searchTerm }: { page: number, searchTerm?: string }) {
    const { technicians, totalPages } = await localApi.getTechnicians({page, searchTerm});
    
    const params = new URLSearchParams();
    if(searchTerm) params.set('q', searchTerm);
    
    const prevPageParams = new URLSearchParams(params);
    if (page > 1) prevPageParams.set('page', String(page - 1));
    const prevPage = `/tecnici?${prevPageParams.toString()}`;

    const nextPageParams = new URLSearchParams(params);
    if (page < totalPages) nextPageParams.set('page', String(page + 1));
    const nextPage = `/tecnici?${nextPageParams.toString()}`;

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
                        {!technicians.length && (
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
                        <Link href={prevPage}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Precedente
                        </Link>
                    </Button>
                    <Button variant="outline" asChild disabled={page >= totalPages}>
                        <Link href={nextPage}>
                            Successivo
                            <ArrowRight className="ml-2 h-4 w-4" />
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
            <p className="text-primary">
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
            <TechnicianSearch initialQuery={searchTerm} />
          </CardHeader>
           <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
                <TechniciansList page={currentPage} searchTerm={searchTerm} />
           </Suspense>
        </Card>
      </main>
    </div>
  );
}
