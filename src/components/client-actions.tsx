
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
import "jspdf-autotable";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react";
import { SheetHeader, SheetTitle } from "./ui/sheet";
import localApi from "@/lib/data";


// Helper function to convert image to data URL
async function toDataURL(url: string): Promise<string> {
    try {
        // For local images, we need to fetch them relative to the public folder
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Error converting ${url} to data URL:`, error);
        // Return a placeholder if conversion fails to avoid breaking the PDF generation
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }
}


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
    setIsDownloading(true);

    try {
        const doc = new jsPDF();
        const [tasks, technicians] = await Promise.all([
            localApi.getTasksByClientId(client.id),
            localApi.getAllTechnicians()
        ]);
        
        const allPhotos = tasks.flatMap(t => t.photos);

        let yPos = 20;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;

        // --- Header ---
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(client.name, margin, yPos);
        yPos += 8;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Codice cliente: ${client.clientCode}`, margin, yPos);

        // --- Footer ---
        const addFooter = () => {
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Pagina ${i} di ${pageCount}`,
                    doc.internal.pageSize.width / 2,
                    pageHeight - 10,
                    { align: "center" }
                );
                 doc.text(
                    `Generato il: ${new Date().toLocaleDateString('it-IT')}`,
                    margin,
                    pageHeight - 10
                );
            }
        };

        const checkPageBreak = (spaceNeeded: number) => {
            if (yPos + spaceNeeded > pageHeight - 20) { // 20 for footer margin
                doc.addPage();
                yPos = margin;
            }
        };

        yPos += 15;

        // --- Client Details ---
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Dettagli Cliente", margin, yPos);
        yPos += 8;
        (doc as any).autoTable({
            startY: yPos,
            head: [],
            body: [
                ["Email", client.email],
                ["Telefono", client.phone],
                ["Indirizzo", client.address],
            ],
            theme: 'grid',
            styles: {
                font: 'helvetica',
                fontSize: 10,
            },
            headStyles: { fontStyle: 'bold' },
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;

        // --- Pool Info ---
         if (client.poolType) {
            checkPageBreak(30);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Informazioni Piscina", margin, yPos);
            yPos += 8;
            const poolData = [
                ["Tipo Piscina", client.poolType],
                ["Dimensioni", client.poolDimensions],
                ["Volume", client.poolVolume],
                ["Tipo Filtro", client.filterType],
                ["Tipo Trattamento", client.treatmentType],
            ].filter(row => row[1]); // Filter out empty values

             (doc as any).autoTable({
                startY: yPos,
                head: [],
                body: poolData,
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 10 },
            });
            yPos = (doc as any).lastAutoTable.finalY + 15;
        }

        // --- Tasks History ---
        if (tasks.length > 0) {
            checkPageBreak(40);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Storico Lavorazioni", margin, yPos);
            yPos += 8;
            const taskBody = tasks.map(t => {
                const assignedTechnicians = technicians.filter(tech => t.technicianIds.includes(tech.id));
                const technicianNames = assignedTechnicians.map(tech => `${tech.firstName} ${tech.lastName}`).join(', ');
                return [t.date, t.description, technicianNames, t.status]
            });

             (doc as any).autoTable({
                startY: yPos,
                head: [['Data', 'Descrizione', 'Tecnico', 'Stato']],
                body: taskBody,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            });
            yPos = (doc as any).lastAutoTable.finalY + 15;
        }
        
        // --- Photos ---
        if (allPhotos.length > 0) {
            doc.addPage();
            yPos = margin;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Foto Allegati", margin, yPos);
            yPos += 10;

            const photoDataUrls = await Promise.all(allPhotos.map(p => toDataURL(p.url)));
            
            const imgWidth = 60;
            const imgHeight = 45;
            const gap = 5;
            let xPos = margin;

            for (let i = 0; i < photoDataUrls.length; i++) {
                if (xPos + imgWidth > doc.internal.pageSize.width - margin) {
                    xPos = margin;
                    yPos += imgHeight + gap + 10; // 10 for description space
                }
                
                checkPageBreak(imgHeight + 15);
                
                try {
                  doc.addImage(photoDataUrls[i], 'JPEG', xPos, yPos, imgWidth, imgHeight);
                  doc.setFontSize(8);
                  doc.setTextColor(80);
                  doc.text(allPhotos[i].description || 'Nessuna descrizione', xPos, yPos + imgHeight + 4);
                } catch (e) {
                   console.error("Error adding image to PDF: ", e);
                   doc.text("Immagine non caricata", xPos, yPos + (imgHeight / 2));
                }

                xPos += imgWidth + gap;
            }
        }

        addFooter();
        doc.save(`scheda-cliente-${client.name.replace(/\s/g, '_')}.pdf`);

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
    <>
      {/* Desktop View */}
      <div className="hidden sm:flex items-center gap-2">
        <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
          {isDownloading ? (
            <>
              <Download className="mr-2 h-4 w-4 animate-pulse" />
              Download...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              PDF
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
                   <SheetTitle className="sr-only">Azioni Cliente</SheetTitle>
                </SheetHeader>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleDownloadPdf(); }} disabled={isDownloading}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>{isDownloading ? 'Download...' : 'Scarica PDF'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push(`/clienti/${client.id}/modifica`)}>
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
              </DropdownMenuContent>
            </DropdownMenu>
      </div>
    </>
  );
}
