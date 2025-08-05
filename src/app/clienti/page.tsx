
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
import { getClients } from "@/lib/firebase";
import { PlusCircle, Search, UsersRound, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function ClientsList({ currentPageId, searchTerm }: { currentPageId?: string, searchTerm?: string }) {
  // Note: The search functionality is complex with pagination and will be implemented later.
  // The searchTerm is a placeholder for now.
  const { clients, lastVisibleId } = await getClients(currentPageId);
  
  const filteredClients = searchTerm
    ? clients.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : clients;

  return (
    <>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.name}
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/clienti/${client.id}`}>
                        Visualizza
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link
                        href={`/attivita/nuova?clientId=${client.id}`}
                      >
                        Nuova Attività
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {!filteredClients.length && (
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
        <div className="flex w-full justify-end gap-2">
            <Button variant="outline" disabled={!currentPageId}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Precedente
            </Button>
            <Button variant="outline" asChild disabled={!lastVisibleId}>
                <Link href={`/clienti?page=${lastVisibleId}`}>
                    Successivo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </CardFooter>
    </>
  );
}


export default function ClientiPage({ searchParams }: { searchParams?: { page?: string, q?: string } }) {
  const currentPageId = searchParams?.page;
  const searchTerm = searchParams?.q;

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <UsersRound className="h-6 w-6" /> Clienti
            </h1>
            <p className="text-muted-foreground">
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
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Cerca cliente per nome..."
                    className="pl-10"
                    defaultValue={searchTerm}
                    disabled // Search to be implemented
                />
            </div>
          </CardHeader>
          <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
            <ClientsList currentPageId={currentPageId} searchTerm={searchTerm} />
          </Suspense>
        </Card>
      </main>
    </div>
  );
}
