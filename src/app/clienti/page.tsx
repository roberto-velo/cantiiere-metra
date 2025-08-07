

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <ClientSearch initialQuery={searchTerm} />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Telefono</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
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
    </Card>
  );
}


export default async function ClientiPage({ searchParams }: { searchParams?: { page?: string, q?: string } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const searchTerm = searchParams?.q;

  return (
    <div className="flex flex-col flex-1 gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Clienti</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm">
                <Link href="/clienti/nuovo">
                <PlusCircle className="h-4 w-4" />
                Nuovo Cliente
                </Link>
            </Button>
        </div>
      </div>
       <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
          <ClientsList page={currentPage} searchTerm={searchTerm} />
        </Suspense>
    </div>
  );
}
