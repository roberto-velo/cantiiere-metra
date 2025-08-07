
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addReminderAction } from "@/lib/actions";
import { format } from 'date-fns';
import type { Client, Technician } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(3, "Il titolo deve avere almeno 3 caratteri."),
  description: z.string().optional(),
  dueDate: z.string().min(1, "La data di scadenza è obbligatoria."),
  dueTime: z.string().optional(),
  relatedTo: z.enum(["client", "technician", "none"]).default("none"),
  relatedId: z.string().optional(),
});

interface NewReminderFormProps {
    clients: Client[];
    technicians: Technician[];
}

export function NewReminderForm({ clients, technicians }: NewReminderFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      dueTime: "",
      relatedTo: "none",
    },
  });

  const relatedTo = form.watch("relatedTo");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await addReminderAction(values);

      if (result.success) {
        toast({
          title: "Promemoria Creato!",
          description: `Il promemoria "${values.title}" è stato salvato.`,
        });
        router.push("/");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
       toast({
        title: "Errore",
        description: (error instanceof Error) ? error.message : "Si è verificato un errore durante il salvataggio del promemoria.",
        variant: "destructive"
      });
      console.error("Error adding reminder: ", error);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Torna indietro</span>
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-6 w-6" /> Nuovo Promemoria
            </h1>
            <p className="text-muted-foreground">
              Compila il modulo per creare un nuovo promemoria.
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Dettagli Promemoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titolo</FormLabel>
                      <FormControl>
                        <Input placeholder="Es: Scadenza certificazione" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Data Scadenza</FormLabel>
                            <FormControl>
                            <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="dueTime"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Orario (Opzionale)</FormLabel>
                            <FormControl>
                            <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione (Opzionale)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Aggiungi dettagli..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="relatedTo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Collega a (Opzionale)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Nessun collegamento" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="none">Nessuno</SelectItem>
                                    <SelectItem value="client">Cliente</SelectItem>
                                    <SelectItem value="technician">Tecnico</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        {relatedTo === 'client' && (
                             <FormField
                                control={form.control}
                                name="relatedId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Seleziona Cliente</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Scegli un cliente" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {relatedTo === 'technician' && (
                              <FormField
                                control={form.control}
                                name="relatedId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Seleziona Tecnico</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Scegli un tecnico" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {technicians.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.firstName} {t.lastName}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                    <Link href="/">Annulla</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Salvataggio..." : "Salva Promemoria"}
                </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
