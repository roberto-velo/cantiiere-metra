
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteClient } from "@/lib/firebase";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Client } from "@/lib/types";

export function ClientActions({ client }: { client: Client }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteClient = async () => {
    if (!client) return;
    try {
      await deleteClient(client.id);
      toast({
        title: "Cliente Eliminato",
        description: `Il cliente "${client.name}" è stato eliminato con successo.`,
      });
      router.push("/clienti");
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del cliente.",
        variant: "destructive",
      });
      console.error("Error deleting client: ", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link href={`/clienti/${client.id}/modifica`}>
          <Pencil className="mr-2 h-4 w-4" />
          Modifica
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L'eliminazione del cliente
              comporterà la rimozione di tutti i dati associati, incluse le
              attività passate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient}>
              Continua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
