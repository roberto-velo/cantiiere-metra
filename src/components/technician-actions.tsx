
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
import { deleteTechnicianAction } from "@/lib/actions";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Technician } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "./ui/dialog";

export function TechnicianActions({ technician }: { technician: Technician }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDeleteTechnician = async () => {
    try {
      const result = await deleteTechnicianAction(technician.id);

      if (result.success) {
        toast({
          title: "Tecnico Eliminato",
          description: `Il tecnico "${technician.firstName} ${technician.lastName}" è stato eliminato con successo.`,
        });
        router.push("/tecnici");
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      toast({
        title: "Errore",
        description: (error instanceof Error) ? error.message : "Si è verificato un errore durante l'eliminazione del tecnico.",
        variant: "destructive",
      });
      console.error("Error deleting technician: ", error);
    }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/tecnici/${technician.id}/modifica`}>
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
                Questa azione non può essere annullata. L'eliminazione del tecnico
                comporterà la sua rimozione da tutte le attività a cui è assegnato.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTechnician}>
                Continua
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

       {/* Mobile View */}
       <div className="sm:hidden">
         <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">Altre azioni</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => router.push(`/tecnici/${technician.id}/modifica`)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Modifica</span>
              </DropdownMenuItem>
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
                      Questa azione non può essere annullata. L'eliminazione del tecnico
                      comporterà la sua rimozione da tutte le attività a cui è assegnato.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTechnician}>
                      Continua
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
         </Dialog>
      </div>
    </>
  );
}
