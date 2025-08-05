
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getClient, updateClient } from "@/lib/firebase";
import { useRouter, useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import type { Client } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri."),
  email: z.string().email("Inserisci un'email valida."),
  phone: z.string().min(5, "Il numero di telefono non sembra corretto."),
  address: z.string().min(5, "L'indirizzo deve avere almeno 5 caratteri."),
});

export default function ModificaClientePage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (params.id) {
      const fetchClient = async () => {
        setLoading(true);
        const clientData = await getClient(params.id);
        if (clientData) {
          setClient(clientData);
          form.reset(clientData);
        }
        setLoading(false);
      };
      fetchClient();
    }
  }, [params.id, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!client) return;
    try {
      const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(values.address)}&output=embed`;
      
      const updatedClient = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        mapUrl,
      };

      await updateClient(client.id, updatedClient);
      
      toast({
        title: "Cliente Aggiornato!",
        description: `Il cliente "${values.name}" è stato aggiornato con successo.`,
      });
      router.push(`/clienti/${client.id}`);
    } catch (error) {
       toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del cliente.",
        variant: "destructive"
      });
      console.error("Error updating client: ", error);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <header className="bg-muted/30 border-b p-4 sm:p-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-40" />
        </header>
        <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
            <Skeleton className="h-[400px] w-full" />
        </main>
      </div>
    );
  }

  if (!client) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/clienti/${client.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Torna indietro</span>
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Pencil className="h-6 w-6" /> Modifica Cliente
            </h1>
            <p className="text-muted-foreground">
              Aggiorna i dati del cliente {client.name}.
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Anagrafica Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Es: Mario Rossi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="Es: info@cliente.it" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Telefono</FormLabel>
                        <FormControl>
                            <Input placeholder="Es: 02 12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Es: Via Roma, 1, 20121 Milano MI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                    <Link href={`/clienti/${client.id}`}>Annulla</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Salvataggio..." : "Salva Modifiche"}
                </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
