
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Client } from "@/lib/types";
import { updateClientAction } from "@/lib/actions";
import { Droplet } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri."),
  email: z.string().email("Inserisci un'email valida."),
  phone: z.string().min(5, "Il numero di telefono non sembra corretto."),
  address: z.string().min(5, "L'indirizzo deve avere almeno 5 caratteri."),
  poolType: z.string().optional(),
  poolDimensions: z.string().optional(),
  poolVolume: z.string().optional(),
  filterType: z.string().optional(),
  treatmentType: z.string().optional(),
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
      poolType: client.poolType || "",
      poolDimensions: client.poolDimensions || "",
      poolVolume: client.poolVolume || "",
      filterType: client.filterType || "",
      treatmentType: client.treatmentType || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(values.address)}&output=embed`;
      
      const updatedClient = {
        ...values,
        mapUrl,
      };

      const result = await updateClientAction(client.id, updatedClient);
      
      if (result.success) {
        toast({
          title: "Cliente Aggiornato!",
          description: `Il cliente "${values.name}" è stato aggiornato con successo.`,
        });
        router.push(`/clienti/${client.id}`);
        router.refresh();
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
       toast({
        title: "Errore",
        description: (error instanceof Error) ? error.message : "Si è verificato un errore durante l'aggiornamento del cliente.",
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

         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Droplet className="h-5 w-5"/>
                    Informazioni Piscina (Opzionale)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="poolType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo Piscina</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona un tipo" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Interrata">Interrata</SelectItem>
                                    <SelectItem value="Fuori terra">Fuori terra</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="poolDimensions"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dimensioni</FormLabel>
                                <FormControl>
                                    <Input placeholder="Es: 8x4m" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="poolVolume"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Volume</FormLabel>
                                <FormControl>
                                    <Input placeholder="Es: 50mc" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="filterType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo Filtro</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona un tipo" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="A sabbia">A sabbia</SelectItem>
                                    <SelectItem value="Eco Summer">Eco Summer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="treatmentType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo Trattamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleziona un tipo" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Centralina sale">Centralina sale</SelectItem>
                                    <SelectItem value="Centralina sale/PH">Centralina sale/PH</SelectItem>
                                    <SelectItem value="Centralina CL/PH">Centralina CL/PH</SelectItem>
                                </SelectContent>
                            </Select>
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
