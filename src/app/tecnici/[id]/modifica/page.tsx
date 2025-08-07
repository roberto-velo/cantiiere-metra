
import { notFound } from "next/navigation";
import localApi from "@/lib/data";
import { EditTechnicianForm } from "@/components/edit-technician-form";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default async function ModificaTecnicoPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const technician = await localApi.getTechnician(id);

  if (!technician) {
    notFound();
  }

  return (
     <div className="flex flex-col flex-1">
       <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/tecnici/${technician.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Torna indietro</span>
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Pencil className="h-6 w-6" /> Modifica Tecnico
            </h1>
            <p className="text-muted-foreground">
              Aggiorna i dati di {technician.firstName} {technician.lastName}.
            </p>
          </div>
        </div>
      </header>
       <main className="flex-1 p-4 sm:p-6">
          <EditTechnicianForm technician={technician} />
      </main>
    </div>
  );
}
