import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
};

type Result = { answer: string; latency_ms: number } | null;

export function AskModal({ open, onOpenChange, propertyId }: Props) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset on close
      setQuestion("");
      setResult(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const ask = async () => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("answer_question", {
        body: { property_id: propertyId, question: trimmed },
      });
      if (error) throw error;
      setResult(data as Result);
    } catch (e) {
      setError((e as Error).message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Ask about this property
          </DialogTitle>
          <DialogDescription className="text-xs">
            Your question runs against the indexed property context.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. When was the boiler last serviced?"
            rows={4}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) ask();
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              ⌘ + Enter to submit
            </span>
            <Button onClick={ask} disabled={!question.trim() || loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Asking…
                </>
              ) : (
                "Ask"
              )}
            </Button>
          </div>

          {error && (
            <div className="rounded-[var(--radius)] border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-2 rounded-[var(--radius)] border border-border bg-secondary/50 p-4">
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {result.answer}
              </p>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Answered in {result.latency_ms} ms
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}