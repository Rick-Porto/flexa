import { useState } from "react";
import { useParams, Link } from "wouter";
import { usePublicApp } from "@/hooks/use-apps";
import { useScreens } from "@/hooks/use-screens";
import { useComponents } from "@/hooks/use-components";
import { useCreateDataEntry } from "@/hooks/use-data-entries";
import { DynamicForm } from "@/components/DynamicForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2, Globe, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PublicApp() {
  const { publicLink } = useParams<{ publicLink: string }>();
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const [success, setSuccess] = useState(false);

  const { data: app, isLoading, error } = usePublicApp(publicLink);

  const { data: screens } = useScreens(app?.id);

  const currentScreen = screens?.[activeScreenIndex];
  const { data: components } = useComponents(currentScreen?.id);
  const createDataEntry = useCreateDataEntry();

  const handleFormSubmit = (formData: Record<string, any>) => {
    if (!currentScreen || !components || !app) return;

    const mutations = components.map((comp) => {
      const key = comp.model || `field_${comp.id}`;
      const value = formData[key];
      return createDataEntry.mutateAsync({
        appId: app.id,
        data: {
          screenId: currentScreen.id,
          componentId: comp.id,
          data: { value },
        },
      });
    });

    Promise.all(mutations).then(() => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mx-auto mb-6">
              <Globe className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">App Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This published app could not be found. The link may be invalid or the app may have been unpublished.
            </p>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground">
              <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span>Published App</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold">{app.name ?? "Untitled App"}</h1>
          {app.description && <p className="text-muted-foreground mt-2">{app.description}</p>}
        </div>

        {screens && screens.length > 1 && (
          <Tabs
            value={String(activeScreenIndex)}
            onValueChange={(v) => setActiveScreenIndex(Number(v))}
            className="mb-8"
          >
            <div className="flex justify-center">
              <TabsList className="bg-white border border-border">
                {screens.map((screen, idx) => (
                  <TabsTrigger key={screen.id} value={String(idx)}>
                    {screen.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        )}

        {success ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-center py-16">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Submission Successful!</h2>
              <p className="text-muted-foreground mb-6">Your data has been recorded securely.</p>
              <Button onClick={() => setSuccess(false)} variant="outline">
                Submit Another
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl shadow-black/5 border-border/60">
            <CardHeader>
              <CardTitle>{currentScreen?.name ?? "Select a screen"}</CardTitle>
              <CardDescription>Fill out the form below</CardDescription>
            </CardHeader>
            <CardContent>
              {components && components.length > 0 ? (
                <DynamicForm
                  components={components}
                  onSubmit={handleFormSubmit}
                  isSubmitting={createDataEntry.isPending}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No components on this screen yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}