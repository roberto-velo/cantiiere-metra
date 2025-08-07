
import localApi from "@/lib/data";
import { NewReminderForm } from "@/components/new-reminder-form";

export default async function NuovoPromemoriaPage() {
  
  const [clients, technicians] = await Promise.all([
    localApi.getAllClients(), 
    localApi.getAllTechnicians()
  ]);

  return (
    <NewReminderForm clients={clients} technicians={technicians} />
  )
}
