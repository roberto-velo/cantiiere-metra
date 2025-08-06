
"use client";

import { useState, useRef, useEffect, useTransition } from "react";
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
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

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
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPhotoUpload = uploadType === "photo";

  useEffect(() => {
    // We only ask for permission when the dialog for photo upload is opened
    if (isPhotoUpload && open) {
      const getCameraPermission = async () => {
        try {
          // If permission is already granted or denied, don't ask again
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (result.state === 'granted') {
             setHasCameraPermission(true);
             return;
          }
          if (result.state === 'denied') {
             setHasCameraPermission(false);
             return;
          }
          
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          // We don't need to do anything with the stream here, just get permission.
          // We will request the stream again when the user clicks the "Use Camera" button.
          stream.getTracks().forEach(track => track.stop());

        } catch (error) {
          console.error("Error accessing camera:", error);
          setHasCameraPermission(false);
        }
      };
      getCameraPermission();
    }
  }, [open, isPhotoUpload]);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCapturing && videoRef.current) {
        const video = videoRef.current;
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => {
                stream = s;
                video.srcObject = s;
            })
            .catch(err => {
                console.error("Error starting camera stream:", err);
                toast({
                    variant: "destructive",
                    title: "Fotocamera non disponibile",
                    description: "Impossibile accedere alla fotocamera. Controlla i permessi del browser.",
                });
                setIsCapturing(false);
            });
    }

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
}, [isCapturing, toast]);


  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob(blob => {
            if (blob) {
                const capturedFile = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
                setFile(capturedFile);
                setIsCapturing(false); // Go back to file preview
            }
        }, 'image/png');
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  const resetState = () => {
    setFile(null);
    setDescription("");
    setIsCapturing(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
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

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  }

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
        {isCapturing && (
            <div className="space-y-4">
                <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                <Button onClick={handleCapturePhoto} className="w-full">
                    <Camera className="mr-2"/> Scatta Foto
                </Button>
                <Button variant="outline" onClick={() => setIsCapturing(false)} className="w-full">Annulla</Button>
            </div>
        )}
        
        {!isCapturing && !file && (
             <div className="space-y-4">
                {isPhotoUpload && hasCameraPermission && (
                    <Button onClick={() => setIsCapturing(true)} className="w-full">
                        <Camera className="mr-2"/> Usa Fotocamera
                    </Button>
                )}
                <Button onClick={triggerFileInput} variant="outline" className="w-full">
                    <FileUp className="mr-2"/> Scegli File
                </Button>
                
                <Input 
                    id="file-input-hidden" 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept={isPhotoUpload ? "image/*" : undefined}
                    capture={isPhotoUpload ? "environment" : undefined}
                    className="hidden"
                />

                {isPhotoUpload && hasCameraPermission === false && (
                     <Alert variant="destructive">
                      <AlertTitle>Accesso alla Fotocamera Negato</AlertTitle>
                      <AlertDescription>
                        Per scattare foto, abilita i permessi della fotocamera nelle impostazioni del browser.
                      </AlertDescription>
                    </Alert>
                )}
            </div>
        )}

        {file && !isCapturing && (
            <div className="space-y-4">
                <div>
                  <Label>File Selezionato</Label>
                  <p className="text-sm text-muted-foreground break-all">{file.name}</p>
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

        <canvas ref={canvasRef} className="hidden" />

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
