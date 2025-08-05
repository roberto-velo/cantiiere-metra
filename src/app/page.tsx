import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  HardHat,
  UsersRound,
  Bell,
  CalendarCheck2,
  ListTodo,
} from "lucide-react";
import Link from "next/link";
import { tasks, technicians, clients } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const scheduledTasks = tasks.filter(
    (task) => task.status === "Pianificato" || task.status === "In corso"
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completato"
  ).length;
  const activeTechnicians = technicians.length;
  const notifications = 3; // Mock data

  const quickLinks = [
    { href: "/clienti", label: "Clienti", icon: UsersRound },
    { href: "/tecnici", label: "Tecnici", icon: HardHat },
    { href: "/attivita", label: "Attività", icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col">
      <header className="bg-card border-b p-4 sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Riepilogo giornaliero e settimanale delle tue attività.
        </p>
      </header>

      <main className="flex-1 p-4 sm:p-6 space-y-6">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attività Pianificate
              </CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledTasks}</div>
              <p className="text-xs text-muted-foreground">
                Da completare questa settimana
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attività Completate
              </CardTitle>
              <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                Questa settimana
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tecnici Attivi
              </CardTitle>
              <HardHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTechnicians}</div>
              <p className="text-xs text-muted-foreground">
                Disponibili per nuove attività
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifiche</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications}</div>
              <p className="text-xs text-muted-foreground">
                Da controllare
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-4">
            Accesso Rapido
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {quickLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="outline"
                className="justify-start h-14 text-left transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Link href={link.href} className="flex items-center gap-4">
                  <div className="bg-muted p-3 rounded-md">
                    <link.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-lg font-medium">{link.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-4">
            Attività Recenti
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left font-medium p-3">Descrizione</th>
                      <th className="text-left font-medium p-3">Cliente</th>
                      <th className="text-left font-medium p-3">Stato</th>
                      <th className="text-left font-medium p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 3).map((task) => (
                      <tr key={task.id} className="border-b">
                        <td className="p-3">{task.description}</td>
                        <td className="p-3">
                          {
                            clients.find(c => c.id === task.clientId)?.name 
                              ? clients.find(c => c.id === task.clientId)?.name 
                              : 'N/A'
                          }
                        </td>
                        <td className="p-3">{task.status}</td>
                        <td className="p-3 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/attivita/${task.id}`}>Dettagli</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
