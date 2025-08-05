"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UsersRound, Droplet } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri."),
  email: z.string().email("Inserisci un'email valida."),
  phone: z.string().min(5, "Il numero di telefono non sembra corretto."),
  address: z.string().min(5, "L'indirizzo deve avere almeno 5 caratteri."),
  
  // Campi opzionali per la piscina
  poolType: z.enum(['Interrata', 'Fuori terra']).optional(),
  poolShape: z.enum(['Rettangolare', 'Ovale', 'Forma libera']).optional(),
  poolDimensione: z.string().optional(),
  poolVolume: z.coerce.number().positive("Il volume deve essere un numero positivo.").optional(),
  poolLiner: z.enum(['PVC', 'Piastrelle', 'Vernice']).optional(),
  poolFiltrationSystem: z.enum(['Sabbia', 'Cartuccia', 'Diatomee']).optional(),
});

export default function NuovoClientePage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      poolType: undefined,
      poolShape: undefined,
      poolDimensione: "",
      poolVolume: undefined,
      poolLiner: undefined,
      poolFiltrationSystem: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const clientCode =
      values.name.substring(0, 3).toUpperCase() +
      Math.floor(100 + Math.random() * 900);
      
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(values.address)}&output=embed`;

    const newClient = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      clientCode,
      mapUrl,
      pool: values.poolType ? {
        type: values.poolType,
        shape: values.poolShape,
        dimensione: values.poolDimensione,
        volume: values.poolVolume,
        liner: values.poolLiner,
        filtrationSystem: values.poolFiltrationSystem,
      } : undefined,
    };

    console.log(newClient);
    // TODO: In a real application, you would save this data.
    toast({
      title: "Cliente Creato!",
      description: `Il cliente "${values.name}" è stato salvato con successo.`,
    });
    form.reset();
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/clienti">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Torna indietro</span>
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <UsersRound className="h-6 w-6" /> Nuovo Cliente
            </h1>
            <p className="text-muted-foreground">
              Compila il modulo per aggiungere un nuovo cliente e i dati della sua piscina.
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Droplet className="h-5 w-5" />
                        Dati Piscina (opzionale)
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
                                <Select onValueChange={field.onChange} value={field.value}>
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
                            name="poolShape"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Forma</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona una forma" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Rettangolare">Rettangolare</SelectItem>
                                        <SelectItem value="Ovale">Ovale</SelectItem>
                                        <SelectItem value="Forma libera">Forma libera</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="poolDimensione"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Dimensione (es: 10x5m)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Es: 10x5m" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="poolLiner"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Rivestimento</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona un tipo" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PVC">PVC</SelectItem>
                                        <SelectItem value="Piastrelle">Piastrelle</SelectItem>
                                        <SelectItem value="Vernice">Vernice</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="poolFiltrationSystem"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Sistema Filtrazione</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona un sistema" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Sabbia">Sabbia</SelectItem>
                                        <SelectItem value="Cartuccia">Cartuccia</SelectItem>
                                        <SelectItem value="Diatomee">Diatomee</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="poolVolume"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Volume (m³)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Es: 75" {...field} onChange={event => field.onChange(+event.target.value)} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                    <Link href="/clienti">Annulla</Link>
                </Button>
                <Button type="submit">Salva Cliente</Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
