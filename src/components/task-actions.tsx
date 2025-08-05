
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
import localApi from "@/lib/data";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Task } from "@/lib/types";

export function TaskActions({ task }: { task: Task }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteTask = async () => {
    if (!task) return;
    try {
      await localApi.deleteTask(task.id);
      toast({
        title: "Attività Eliminata",
        description: `L'attività "${task.description}" è stata eliminata con successo.`,
      });
      router.push("/attivita");
      router.refresh();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione dell'attività.",
        variant: "destructive",
      });
      console.error("Error deleting task: ", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" disabled>
        <Pencil className="mr-2 h-4 w-4" />
        Modifica
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
              Questa azione non può essere annullata. L'eliminazione dell'attività
              la rimuoverà permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>
              Continua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
