

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
        <Card>
             <CardHeader>
                <TechnicianSearch initialQuery={searchTerm} />
             </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead className="hidden sm:table-cell">Ruolo</TableHead>
                            <TableHead className="hidden md:table-cell">Telefono</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {technicians.map((technician) => (
                            <TableRow key={technician.id}>
                                <TableCell className="font-medium whitespace-nowrap">
                                {technician.firstName} {technician.lastName}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{technician.role}</TableCell>
                                <TableCell className="hidden md:table-cell">{technician.phone}</TableCell>
                                <TableCell className="text-right space-x-2 whitespace-nowrap">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/tecnici/${technician.id}`}>
                                    Visualizza
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                  <Link href={`/attivita/nuova?technicianId=${technician.id}`}>
                                    <span className="hidden sm:inline">Nuova Attività</span>
                                    <PlusCircle className="sm:hidden" />
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
                <div className="flex w-full justify-between sm:justify-end gap-2">
                    <Button variant="outline" asChild disabled={page <= 1}>
                        <Link href={prevPage}>
                            <ArrowLeft className="mr-0 sm:mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Precedente</span>
                        </Link>
                    </Button>
                    <Button variant="outline" asChild disabled={page >= totalPages}>
                        <Link href={nextPage}>
                            <span className="hidden sm:inline">Successivo</span>
                            <ArrowRight className="ml-0 sm:ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}


export default function TecniciPage({ searchParams }: { searchParams?: { page?: string, q?: string } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const searchTerm = searchParams?.q;

  return (
    <div className="flex flex-col flex-1 gap-4">
       <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Tecnici</h1>
            <div className="ml-auto flex items-center gap-2">
                <Button asChild size="sm">
                    <Link href="/tecnici/nuovo">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuovo Tecnico
                    </Link>
                </Button>
            </div>
        </div>
        <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
            <TechniciansList page={currentPage} searchTerm={searchTerm} />
        </Suspense>
    </div>
  );
}
