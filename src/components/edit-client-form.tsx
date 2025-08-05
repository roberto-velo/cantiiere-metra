
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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { updateClient } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import type { Client } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri."),
  email: z.string().email("Inserisci un'email valida."),
  phone: z.string().min(5, "Il numero di telefono non sembra corretto."),
  address: z.string().min(5, "L'indirizzo deve avere almeno 5 caratteri."),
});

interface EditClientFormProps {
    client: Client;
}

export function EditClientForm({ client }: EditClientFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
      router.refresh(); // To see the changes immediately
    } catch (error) {
       toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del cliente.",
        variant: "destructive"
      });
      console.error("Error updating client: ", error);
    }
  }

  return (
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
  );
}
