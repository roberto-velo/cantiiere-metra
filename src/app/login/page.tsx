import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex justify-center items-center gap-2 mb-6">
            <Image src="/logo.png" alt="Logo" width={200} height={50} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Accesso</CardTitle>
            <CardDescription>
              Inserisci le tue credenziali per accedere alla piattaforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario.rossi@esempio.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" asChild>
                <Link href="/">Accedi</Link>
            </Button>
            <Button variant="link" size="sm">
                Password dimenticata?
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
