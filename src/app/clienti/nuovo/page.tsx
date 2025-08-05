
import { NewClientForm } from "@/components/new-client-form";

// This is now a Server Component to fetch initial data if needed.
// The form logic is encapsulated in the Client Component "NewClientForm".
export default function NuovoClientePage() {
  return <NewClientForm />;
}
