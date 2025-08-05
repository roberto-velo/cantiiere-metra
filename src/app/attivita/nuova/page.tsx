
import { getClients, getTechnicians } from "@/lib/firebase";
import { NewTaskForm } from "@/components/new-task-form";

// This is now a Server Component that fetches clients and technicians
// and passes them to the client component form.
export default async function NuovaAttivitaPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  
  const [clients, technicians] = await Promise.all([
    getClients(), 
    getTechnicians()
  ]);

  const clientId = searchParams.clientId;

  return (
    <NewTaskForm 
      clients={clients} 
      technicians={technicians} 
      initialClientId={clientId} 
    />
  )
}
