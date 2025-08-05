
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PlusCircle, Search, UsersRound } from "lucide-react";
import Link from "next/link";
import type { Client } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientiPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      const clientsFromDb = await getClients();
      setClients(clientsFromDb);
      setLoading(false);
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca cliente per nome..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
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
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="text-right space-x-2">
                           <Skeleton className="h-9 w-24 inline-block" />
                           <Skeleton className="h-9 w-32 inline-block" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    filteredClients.map((client) => (
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
                    ))
                  )}
                   {!loading && filteredClients.length === 0 && (
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
        </Card>
      </main>
    </div>
  );
}
