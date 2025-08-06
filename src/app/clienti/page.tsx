

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
import { PlusCircle, Search, UsersRound, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ClientSearch } from "@/components/client-search";

async function ClientsList({ page, searchTerm }: { page: number, searchTerm?: string }) {
  const { clients, totalPages } = await localApi.getClients({ page, searchTerm });
  
  const params = new URLSearchParams();
  if(searchTerm) params.set('q', searchTerm);
  
  const prevPageParams = new URLSearchParams(params);
  if (page > 1) prevPageParams.set('page', String(page - 1));
  const prevPage = `/clienti?${prevPageParams.toString()}`;

  const nextPageParams = new URLSearchParams(params);
  if (page < totalPages) nextPageParams.set('page', String(page + 1));
  const nextPage = `/clienti?${nextPageParams.toString()}`;


  return (
    <>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary">Nome</TableHead>
                <TableHead className="text-primary hidden sm:table-cell">Email</TableHead>
                <TableHead className="text-primary hidden md:table-cell">Telefono</TableHead>
                <TableHead className="text-right text-primary">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{client.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{client.phone}</TableCell>
                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/clienti/${client.id}?from=/clienti`}>
                        Visualizza
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link
                        href={`/attivita/nuova?clientId=${client.id}`}
                      >
                        <span className="hidden sm:inline">Nuova Attività</span>
                        <PlusCircle className="sm:hidden" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {!clients.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      Nessun cliente trovato.
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
    </>
  );
}


export default function ClientiPage({ searchParams }: { searchParams?: { page?: string, q?: string } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const searchTerm = searchParams?.q;

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <UsersRound className="h-6 w-6" /> Clienti
            </h1>
            <p className="text-primary">
              Gestisci l'anagrafinca dei tuoi clienti.
            </p>
          </div>
          <Button asChild>
            <Link href="/clienti/nuovo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuovo Cliente
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader>
            <ClientSearch initialQuery={searchTerm} />
          </CardHeader>
          <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
            <ClientsList page={currentPage} searchTerm={searchTerm} />
          </Suspense>
        </Card>
      </main>
    </div>
  );
}
