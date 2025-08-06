
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { deleteAttachmentAction, updateAttachmentAction } from "@/lib/actions";
import { Pencil, Trash2 } from "lucide-react";
import type { Photo, Document } from "@/lib/types";

interface AttachmentItemProps {
  type: 'photo' | 'document';
  item: Photo | Document;
  taskId: string;
}

export function AttachmentItem({ type, item, taskId }: AttachmentItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [description, setDescription] = useState(type === 'photo' ? (item as Photo).description : '');
  const [name, setName] = useState(type === 'document' ? (item as Document).name : '');
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAttachmentAction({ taskId, attachmentId: item.id, type });
      if (result.success) {
        toast({ title: "Successo", description: result.message });
      } else {
        toast({ title: "Errore", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleUpdate = () => {
    startTransition(async () => {
        const data = type === 'photo' ? { description } : { name };
        const result = await updateAttachmentAction({ taskId, attachmentId: item.id, type, data });
         if (result.success) {
            toast({ title: "Successo", description: result.message });
            setIsEditDialogOpen(false);
        } else {
            toast({ title: "Errore", description: result.message, variant: "destructive" });
        }
    })
  }

  if (type === 'photo') {
    const photo = item as Photo;
    const imageUrl = photo.url.startsWith('http') || photo.url.startsWith('/') ? photo.url : `/${photo.url}`;
    
    return (
      <div className="space-y-2">
        <div className="aspect-square w-full overflow-hidden rounded-md relative group">
          <Image src={imageUrl} alt={photo.description} fill className="object-cover" data-ai-hint="construction site" />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-7 w-7 bg-white/80 hover:bg-white">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifica Descrizione</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="description">Descrizione</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Annulla</Button></DialogClose>
                        <Button onClick={handleUpdate} disabled={isPending}>Salva</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-7 w-7">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isPending}>Elimina</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">{photo.description}</p>
      </div>
    );
  }

  const doc = item as Document;
  return (
    <li className="flex items-center justify-between rounded-md border p-3 min-w-[300px] group">
      <span className="font-medium truncate pr-4">{doc.name}</span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <a href={doc.url} download>Scarica</a>
        </Button>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
             <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-4 w-4" />
                </Button>
             </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modifica Nome File</DialogTitle>
                </DialogHeader>
                 <div className="py-4">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Annulla</Button></DialogClose>
                    <Button onClick={handleUpdate} disabled={isPending}>Salva</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
              <AlertDialogDescription>Questa azione non può essere annullata.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending}>Elimina</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}
