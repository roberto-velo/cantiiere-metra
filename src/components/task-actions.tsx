
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
import { deleteTaskAction } from "@/lib/actions";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SheetHeader, SheetTitle } from "./ui/sheet";

interface TaskActionsProps {
  taskId: string;
  description: string;
}

export function TaskActions({ taskId, description }: TaskActionsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteTask = async () => {
    try {
      const result = await deleteTaskAction(taskId);
      if (result.success) {
        toast({
          title: "Attività Eliminata",
          description: `L'attività "${description}" è stata eliminata con successo.`,
        });
        router.push("/attivita");
      } else {
         toast({
          title: "Errore",
          description: result.message || "Eliminazione fallita. L'attività non è stata trovata.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: (error instanceof Error) ? error.message : "Si è verificato un errore durante l'eliminazione dell'attività.",
        variant: "destructive",
      });
      console.error("Error deleting task: ", error);
    }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:flex items-center gap-2">
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
      
      {/* Mobile View */}
       <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">Altre azioni</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <SheetHeader>
                <SheetTitle className="sr-only">Azioni Attività</SheetTitle>
              </SheetHeader>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                   <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Elimina</span>
                  </DropdownMenuItem>
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
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </>
  );
}
