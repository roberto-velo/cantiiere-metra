"use client";

import { useState, useTransition } from "react";
import { smartFileTagging } from "@/ai/flows/smart-file-tagging";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tags } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FileTagger({ context }: { context: string }) {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSuggestedTags([]);
      setSelectedTags(new Set());
      setError(null);
    }
  };

  const handleGetSuggestions = () => {
    if (!file) return;

    startTransition(async () => {
      try {
        setError(null);
        const fileDataUri = await fileToDataUrl(file);
        const result = await smartFileTagging({ fileDataUri, context });
        setSuggestedTags(result.suggestedCategories);
      } catch (e) {
        console.error(e);
        setError("Errore durante la generazione dei tag. Riprova.");
      }
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          <span>Smart File Tagger</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Allega un file</Label>
          <Input id="file-upload" type="file" onChange={handleFileChange} />
        </div>

        {file && (
          <Button onClick={handleGetSuggestions} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisi...
              </>
            ) : (
              "Ottieni Suggerimenti Tag"
            )}
          </Button>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {suggestedTags.length > 0 && (
          <div className="space-y-2">
            <Label>Tag Suggeriti (clicca per selezionare)</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.has(tag) ? "default" : "secondary"}
                  onClick={() => toggleTag(tag)}
                  className="cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedTags.size > 0 && (
            <div className="space-y-2 rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">File da salvare:</p>
                <p className="text-sm text-muted-foreground">{file?.name}</p>
                <p className="text-sm font-medium mt-2">Tag selezionati:</p>
                <div className="flex flex-wrap gap-2">
                    {Array.from(selectedTags).map(tag => (
                        <Badge key={tag}>{tag}</Badge>
                    ))}
                </div>
                 <Button className="mt-4 w-full">Salva File e Tag</Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
