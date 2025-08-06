
"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
import { addAttachmentToTaskAction } from "@/lib/actions";
import { Camera, FileUp, Loader2, Upload } from "lucide-react";

interface FileUploadProps {
  taskId: string;
  uploadType: "photo" | "document";
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FileUpload({ taskId, uploadType }: FileUploadProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isPhotoUpload = uploadType === "photo";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  const resetState = () => {
    setFile(null);
    setDescription("");
    if(fileInputRef.current) fileInputRef.current.value = "";
    if(cameraInputRef.current) cameraInputRef.current.value = "";
  }

  const handleSubmit = () => {
    if (!file) return;

    startTransition(async () => {
      try {
        const fileDataUri = await fileToDataUrl(file);
        const result = await addAttachmentToTaskAction({
          taskId,
          attachment: {
            name: file.name,
            url: fileDataUri,
            description: description,
          },
          type: uploadType,
        });

        if (result.success) {
          toast({
            title: "Caricamento completato",
            description: `Il ${uploadType === 'photo' ? 'foto' : 'documento'} è stato aggiunto all'attività.`,
          });
          setOpen(false);
          resetState();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Errore durante il caricamento",
          description: (error instanceof Error) ? error.message : "Si è verificato un errore sconosciuto.",
        });
        console.error(error);
      }
    });
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerCameraInput = () => cameraInputRef.current?.click();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if(!isOpen) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {isPhotoUpload ? <Camera className="mr-2" /> : <Upload className="mr-2" />}
          Aggiungi {isPhotoUpload ? "Foto" : "File"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Aggiungi {isPhotoUpload ? "Foto" : "Documento"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
        
        {!file && (
             <div className="space-y-4">
                {isPhotoUpload && (
                    <Button onClick={triggerCameraInput} className="w-full">
                        <Camera className="mr-2"/> Usa Fotocamera
                    </Button>
                )}
                <Button onClick={triggerFileInput} variant={isPhotoUpload ? "outline" : "default"} className="w-full">
                    <FileUp className="mr-2"/> Scegli File
                </Button>
                
                {/* Hidden Inputs */}
                <Input 
                    id="file-input-hidden" 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept={isPhotoUpload ? "image/*" : undefined}
                    className="hidden"
                />
                 {isPhotoUpload && (
                    <Input 
                        id="camera-input-hidden" 
                        type="file" 
                        ref={cameraInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                    />
                 )}
            </div>
        )}

        {file && (
            <div className="space-y-4">
                <div>
                  <Label>Anteprima</Label>
                   {isPhotoUpload && file.type.startsWith("image/") ? (
                        <div className="mt-2 rounded-md overflow-hidden aspect-video relative">
                             <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                         <p className="text-sm text-muted-foreground break-all mt-2">{file.name}</p>
                    )}
                </div>
                 {isPhotoUpload && (
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrizione (opzionale)</Label>
                        <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Es: Dettaglio del danno"
                        />
                    </div>
                )}
                 <Button variant="outline" onClick={resetState} className="w-full">
                    Cambia File
                </Button>
            </div>
        )}
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="ghost">Annulla</Button>
            </DialogClose>
          <Button onClick={handleSubmit} disabled={!file || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Caricamento...' : 'Salva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
