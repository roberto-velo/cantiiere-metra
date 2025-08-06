
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
import { deleteClientAction } from "@/lib/actions";
import { Pencil, Trash2, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Client } from "@/lib/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";

export function ClientActions({ client }: { client: Client }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDeleteClient = async () => {
    if (!client) return;
    try {
      const result = await deleteClientAction(client.id);

      if (result.success) {
        toast({
          title: "Cliente Eliminato",
          description: `Il cliente "${client.name}" è stato eliminato con successo.`,
        });
        router.push("/clienti");
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      toast({
        title: "Errore",
        description: (error instanceof Error) ? error.message : "Si è verificato un errore durante l'eliminazione del cliente.",
        variant: "destructive",
      });
      console.error("Error deleting client: ", error);
    }
  };
  
  const handleDownloadPdf = async () => {
    const mainContent = document.getElementById('client-detail-page');
    if (!mainContent) {
        toast({
            title: "Errore",
            description: "Impossibile trovare il contenuto da esportare.",
            variant: "destructive",
        });
        return;
    }
    
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(mainContent, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // Important for external images
            onclone: (document) => {
              // Hide action buttons in the cloned document for the PDF
              const actions = document.getElementById('client-actions');
              if (actions) {
                actions.style.display = 'none';
              }
            }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const widthInPdf = pdfWidth;
        const heightInPdf = widthInPdf / ratio;
        
        let position = 0;
        let remainingHeight = imgHeight * (widthInPdf / imgWidth);

        while (remainingHeight > 0) {
            pdf.addImage(imgData, 'PNG', 0, position, widthInPdf, heightInPdf);
            remainingHeight -= pdfHeight;
            if (remainingHeight > 0) {
                pdf.addPage();
                position = -pdfHeight;
            }
        }
        
        pdf.save(`scheda-cliente-${client.name.replace(/\s/g, '_')}.pdf`);

    } catch (error) {
         toast({
            title: "Errore PDF",
            description: "Si è verificato un errore durante la creazione del PDF.",
            variant: "destructive",
        });
        console.error("Error generating PDF: ", error);
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <div className="flex items-center gap-2" id="client-actions">
       <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
        {isDownloading ? (
          <>
            <Download className="mr-2 h-4 w-4 animate-pulse" />
            Download...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Scarica PDF
          </>
        )}
      </Button>
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
