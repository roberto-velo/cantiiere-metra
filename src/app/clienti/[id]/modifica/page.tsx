
import { notFound } from "next/navigation";
import localApi from "@/lib/data";
import { EditClientForm } from "@/components/edit-client-form";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


// This is now a Server Component that fetches the client data
// and passes it to the client component form.
export default async function ModificaClientePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const client = await localApi.getClient(id);

  if (!client) {
    notFound();
  }

  return (
     <div className="flex flex-col flex-1">
       <header className="bg-muted/30 border-b p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/clienti/${client.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Torna indietro</span>
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Pencil className="h-6 w-6" /> Modifica Cliente
            </h1>
            <p className="text-muted-foreground">
              Aggiorna i dati del cliente {client.name}.
            </p>
          </div>
        </div>
      </header>
       <main className="flex-1 p-4 sm:p-6">
          <EditClientForm client={client} />
      </main>
    </div>
  );
}
