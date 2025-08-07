
"use client";

import type { Reminder } from "@/lib/types";
import { formatDistanceToNow, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Bell, Trash2 } from "lucide-react";
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
import { Button } from "./ui/button";
import { useTransition } from "react";
import { deleteReminderAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReminderItemProps {
  reminder: Reminder;
}

export function ReminderItem({ reminder }: ReminderItemProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteReminderAction(reminder.id);
      if (result.success) {
        toast({ title: "Successo", description: "Promemoria eliminato." });
      } else {
        toast({ title: "Errore", description: result.message, variant: "destructive" });
      }
    });
  }

  return (
    <div className="flex items-center gap-4 group">
      <Bell className="h-6 w-6 text-primary" />
      <div className="grid gap-1 flex-1">
        <p className="text-sm font-medium">{reminder.title}</p>
        <p className="text-sm text-primary">
          Scade{" "}
          {formatDistanceToNow(parseISO(reminder.dueDate), {
            locale: it,
            addSuffix: true,
          })}
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10")}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Questo eliminerà
              permanentemente il promemoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
