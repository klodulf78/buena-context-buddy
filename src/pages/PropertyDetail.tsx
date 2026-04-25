import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { relativeTime } from "@/lib/relativeTime";
import { AskModal } from "@/components/AskModal";

type Property = {
  id: string;
  name: string;
  address: string;
  last_run_at: string | null;
};

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("properties")
      .select("id, name, address, last_run_at")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else {
          setProperty(data);
          document.title = `${data.name} — Buena Context Engine`;
        }
      });
  }, [id]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Properties
        </Link>

        {notFound ? (
          <p className="mt-10 text-sm text-muted-foreground">Property not found.</p>
        ) : !property ? (
          <div className="mt-10 space-y-3">
            <div className="h-7 w-56 animate-pulse rounded bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <header className="mt-8">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {property.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{property.address}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Last engine run: {relativeTime(property.last_run_at)}
              </p>
            </header>

            <div className="mt-10 rounded-[var(--radius)] border border-border bg-card p-8">
              <div className="flex flex-col items-start gap-4">
                <div>
                  <h2 className="text-base font-medium text-foreground">
                    Query the context engine
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask anything about this property. Answers are grounded in the
                    indexed context.
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => setOpen(true)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Ask About This Property
                </Button>
              </div>
            </div>

            <AskModal
              open={open}
              onOpenChange={setOpen}
              propertyId={property.id}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default PropertyDetail;