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

  const statsCards = [
    { title: "Attività Pianificate", value: scheduledTasks, icon: ListTodo, note: "Da completare questa settimana" },
    { title: "Attività Completate", value: completedTasks, icon: CalendarCheck2, note: "Questa settimana" },
    { title: "Tecnici Attivi", value: activeTechnicians, icon: HardHat, note: "Disponibili per nuove attività" },
    { title: "Notifiche", value: notifications, icon: Bell, note: "Da controllare" }
  ];

  return (
    <div className="flex flex-col bg-muted/30">
      <header className="bg-card border-b p-4 sm:p-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Riepilogo giornaliero e settimanale delle tue attività.
        </p>
      </header>

      <main className="flex-1 p-4 sm:p-6 space-y-8">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card, index) => (
            <Card key={index} className="glow-on-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground pt-1">
                  {card.note}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">
            Accesso Rapido
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {quickLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="outline"
                className="justify-start h-24 text-left group glow-on-hover bg-card"
              >
                <Link href={link.href} className="flex items-center gap-4 p-4">
                  <div className="bg-primary/10 p-4 rounded-lg transition-colors duration-300 group-hover:bg-primary">
                    <link.icon className="h-7 w-7 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                  </div>
                  <span className="text-xl font-semibold text-foreground">{link.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">
            Attività Recenti
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left font-semibold p-4 text-muted-foreground">Descrizione</th>
                      <th className="text-left font-semibold p-4 text-muted-foreground">Cliente</th>
                      <th className="text-left font-semibold p-4 text-muted-foreground">Stato</th>
                      <th className="text-left font-semibold p-4 text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 3).map((task) => (
                      <tr key={task.id} className="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium text-foreground">{task.description}</td>
                        <td className="p-4 text-muted-foreground">
                          {
                            clients.find(c => c.id === task.clientId)?.name 
                              ? clients.find(c => c.id === task.clientId)?.name 
                              : 'N/A'
                          }
                        </td>
                        <td className="p-4 text-muted-foreground">{task.status}</td>
                        <td className="p-4 text-right">
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
