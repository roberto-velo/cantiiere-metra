
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ClipboardList, Mail, MapPin, Phone, Upload, Camera, FileText, Map } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Client, Technician } from "@/lib/types";
import { addTaskAction } from "@/lib/actions";

const formSchema = z.object({
  clientId: z.string({ required_error: "Il cliente è obbligatorio." }),
  technicianId: z.string({ required_error: "Il tecnico è obbligatorio." }),
  date: z.string().min(1, "La data è obbligatoria."),
  time: z.string().min(1, "L'ora è obbligatoria."),
  description: z.string().min(5, "La descrizione deve avere almeno 5 caratteri."),
  priority: z.enum(["Bassa", "Media", "Alta"]),
  notes: z.string().optional(),
  photos: z.any().optional(),
  documents: z.any().optional(),
});

interface NewTaskFormProps {
    clients: Client[];
    technicians: Technician[];
    initialClientId?: string;
}

export function NewTaskForm({ clients, technicians, initialClientId }: NewTaskFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: initialClientId || "",
      technicianId: "",
      date: "",
      time: "",
      description: "",
      priority: "Media",
      notes: "",
    },
  });

  const clientId = form.watch("clientId");

  useEffect(() => {
    if (initialClientId) {
        const client = clients.find((c) => c.id === initialClientId);
        setSelectedClient(client || null);
    }
  }, [initialClientId, clients]);


  useEffect(() => {
    if (clientId) {
      const client = clients.find((c) => c.id === clientId);
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [clientId, clients]);
  

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const newActivity = {
            ...values,
            status: "Pianificato",
            // In a real app, you'd handle file uploads to a service like Firebase Storage
            // and get back URLs to save in Firestore.
            photos: [], 
            documents: [],
        };
        
        const result = await addTaskAction(newActivity);

        if (result.success) {
            toast({
            title: "Attività Creata!",
            description: `L'attività "${values.description}" è stata creata con successo.`,
            });
            router.push('/attivita');
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        toast({
            title: "Errore",
            description: (error instanceof Error) ? error.message : "Si è verificato un errore durante la creazione dell'attività.",
            variant: "destructive"
        });
        console.error("Error adding task: ", error);
    }
  }

  const clientInfo = selectedClient ? [
    { icon: Phone, label: "Telefono", value: selectedClient.phone, href: `tel:${selectedClient.phone}` },
    { icon: Mail, label: "Email", value: selectedClient.email, href: `mailto:${selectedClient.email}` },
  ] : [];

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/attivita">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Torna indietro</span>
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-6 w-6" /> Nuova Attività
            </h1>
            <p className="text-muted-foreground">
              Compila il modulo per creare una nuova attività.
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-4xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle>Dettagli Attività</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona un cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="technicianId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tecnico Assegnato</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona un tecnico" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {technicians.map((tech) => (
                              <SelectItem key={tech.id} value={tech.id}>
                                {tech.firstName} {tech.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Data Intervento</FormLabel>
                            <FormControl>
                            <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ora Intervento</FormLabel>
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
                      <FormLabel>Descrizione Attività</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrivi l'intervento da effettuare..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Priorità</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Seleziona una priorità" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Bassa">Bassa</SelectItem>
                                <SelectItem value="Media">Media</SelectItem>
                                <SelectItem value="Alta">Alta</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                 </div>
                 <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note Aggiuntive</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Eventuali note o dettagli importanti..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {selectedClient && (
                 <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dettagli Cliente Selezionato</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <ul className="space-y-4">
                                {clientInfo.map((info) => (
                                <li key={info.label} className="flex items-start gap-4">
                                    <info.icon className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                      <p className="font-medium text-primary">{info.label}</p>
                                      <a href={info.href} className="font-semibold text-foreground hover:underline">
                                          {info.value}
                                      </a>
                                    </div>
                                </li>
                                ))}
                                <li className="flex items-start gap-4">
                                  <MapPin className="h-5 w-5 text-primary mt-1" />
                                  <div>
                                    <p className="font-medium text-primary">Indirizzo</p>
                                     <a href={selectedClient.mapUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline flex items-center gap-2">
                                        {selectedClient.address}
                                        <Map className="h-4 w-4 text-primary" />
                                      </a>
                                  </div>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Carica Foto
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control}
                                name="photos"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Seleziona una o più foto</FormLabel>
                                    <FormControl>
                                        <Input type="file" multiple accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
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
                                <FileText className="h-5 w-5" />
                                Carica Documenti
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="documents"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Seleziona uno o più documenti</FormLabel>
                                    <FormControl>
                                        <Input type="file" multiple onChange={(e) => field.onChange(e.target.files)} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/attivita">Annulla</Link>
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creazione..." : "Crea Attività"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
