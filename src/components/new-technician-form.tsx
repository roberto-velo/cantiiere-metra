
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
  ArrowLeft,
  HardHat,
  PlusCircle,
  Trash2,
  CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { addTechnician } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const qualificationSchema = z.object({
  name: z.string().min(1, "Il nome della qualifica è obbligatorio."),
  expiryDate: z.date({
    required_error: "La data di scadenza è obbligatoria.",
  }),
});

const formSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri."),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri."),
  phone: z.string().min(5, "Il numero di telefono non sembra corretto."),
  role: z.string().min(2, "Il ruolo deve avere almeno 2 caratteri."),
  qualifications: z.array(qualificationSchema),
});

export function NewTechnicianForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      role: "",
      qualifications: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "qualifications",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const newTechnician = {
        ...values,
        qualifications: values.qualifications.map(q => ({
          id: crypto.randomUUID(),
          name: q.name,
          expiryDate: format(q.expiryDate, 'yyyy-MM-dd')
        }))
      };
      
      await addTechnician(newTechnician);
      
      toast({
        title: "Tecnico Creato!",
        description: `Il tecnico "${values.firstName} ${values.lastName}" è stato salvato con successo.`,
      });
      router.push("/tecnici");
    } catch (error) {
       toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del tecnico.",
        variant: "destructive"
      });
      console.error("Error adding technician: ", error);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/tecnici">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Torna indietro</span>
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <HardHat className="h-6 w-6" /> Nuovo Tecnico
            </h1>
            <p className="text-muted-foreground">
              Compila il modulo per aggiungere un nuovo tecnico al team.
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
                <CardTitle>Anagrafica Tecnico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Es: Marco" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cognome</FormLabel>
                        <FormControl>
                          <Input placeholder="Es: Gialli" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefono</FormLabel>
                        <FormControl>
                          <Input placeholder="Es: 333 1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ruolo</FormLabel>
                        <FormControl>
                          <Input placeholder="Es: Idraulico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Qualifiche e Certificazioni</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ name: "", expiryDate: new Date() })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Aggiungi Qualifica
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                      <FormField
                        control={form.control}
                        name={`qualifications.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Qualifica</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Es: Certificazione Gas"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`qualifications.${index}.expiryDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data Scadenza</FormLabel>
                             <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Scegli una data</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                 {fields.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground py-4">
                        Nessuna qualifica aggiunta.
                    </p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/tecnici">Annulla</Link>
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvataggio..." : "Salva Tecnico"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
