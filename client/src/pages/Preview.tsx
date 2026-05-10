import { useState } from "react";
import { useParams, Link } from "wouter";
import { useApp } from "@/hooks/use-apps";
import { useScreens } from "@/hooks/use-screens";
import { useComponents } from "@/hooks/use-components";
import { useCreateDataEntry } from "@/hooks/use-data-entries";
import { DynamicForm } from "@/components/DynamicForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Preview() {
  const { id } = useParams<{ id: string }>();
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const [success, setSuccess] = useState(false);

  const { data: app } = useApp(id);
  const { data: screens } = useScreens(id);
  
  const currentScreen = screens?.[activeScreenIndex];
  const { data: components } = useComponents(currentScreen?.id || "");
  const createDataEntry = useCreateDataEntry();

  const handleFormSubmit = (data: any) => {
    if (!currentScreen) return;
    
    createDataEntry.mutate(
      { 
        appId: id, 
        screenId: currentScreen.id, 
        data 
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }
      }
    );
  };

  if (!app || !screens) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <Link href="/">
          <Button variant="ghost" className="mb-6 -ml-4 gap-2 text-muted-foreground">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold">{app.name}</h1>
          <p className="text-muted-foreground mt-2">Preview Mode</p>
        </div>

        {screens.length > 1 && (
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
              <CardTitle>{currentScreen?.name}</CardTitle>
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
