import { useState } from "react";
import { useParams, Link } from "wouter";
import { useApp } from "@/hooks/use-apps";
import { useScreens, useCreateScreen, useDeleteScreen } from "@/hooks/use-screens";
import { useComponents, useCreateComponent, useDeleteComponent } from "@/hooks/use-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Type, 
  Hash, 
  Calendar, 
  CheckSquare, 
  List,
  Save,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

const COMPONENT_TYPES = [
  { type: "text", label: "Text Input", icon: Type },
  { type: "number", label: "Number Input", icon: Hash },
  { type: "date", label: "Date Picker", icon: Calendar },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "dropdown", label: "Dropdown", icon: List },
];

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [isNewScreenOpen, setIsNewScreenOpen] = useState(false);
  const [newScreenName, setNewScreenName] = useState("");

  const { data: app, isLoading: isAppLoading } = useApp(id);
  const { data: screens } = useScreens(id);
  const { data: components } = useComponents(selectedScreenId || "");
  
  const createScreen = useCreateScreen();
  const deleteScreen = useDeleteScreen();
  const createComponent = useCreateComponent();
  const deleteComponent = useDeleteComponent();

  // Auto-select first screen
  if (screens && screens.length > 0 && !selectedScreenId) {
    setSelectedScreenId(screens[0].id);
  }

  const handleCreateScreen = () => {
    if (!newScreenName.trim()) return;
    createScreen.mutate(
      { appId: id, data: { name: newScreenName, order: screens?.length || 0 } },
      {
        onSuccess: () => {
          setIsNewScreenOpen(false);
          setNewScreenName("");
        },
      }
    );
  };

  const handleAddComponent = (type: string) => {
    if (!selectedScreenId) return;
    const count = components?.length || 0;
    createComponent.mutate({
      screenId: selectedScreenId,
      data: {
        elementType: type,
        label: `New ${type}`,
        model: `field_${Date.now()}`,
        order: count,
        required: false,
        config: type === 'dropdown' ? { options: ['Option 1', 'Option 2'] } : {}
      }
    });
  };

  if (isAppLoading || !app) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-lg">{app.name}</h1>
            <p className="text-xs text-muted-foreground">Editor Mode</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/${id}/preview`}>
            <Button variant="outline" className="gap-2">
              <Save className="w-4 h-4" /> Preview App
            </Button>
          </Link>
          <Button className="gap-2 btn-primary">
            Publish
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Screens */}
        <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h2 className="font-semibold text-sm">Screens</h2>
            <Dialog open={isNewScreenOpen} onOpenChange={setIsNewScreenOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Screen</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label>Screen Name</Label>
                  <Input 
                    value={newScreenName} 
                    onChange={(e) => setNewScreenName(e.target.value)}
                    placeholder="e.g. Employee Details"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateScreen}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {screens?.map((screen) => (
                <div 
                  key={screen.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors group",
                    selectedScreenId === screen.id 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setSelectedScreenId(screen.id)}
                >
                  <span>{screen.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScreen.mutate({ id: screen.id, appId: id });
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 bg-muted/30 p-8 overflow-auto flex justify-center">
          <div className="w-full max-w-2xl bg-card rounded-xl shadow-lg border border-border min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold">
                {screens?.find(s => s.id === selectedScreenId)?.name || "Select a screen"}
              </h2>
            </div>
            <div className="p-6 space-y-4 flex-1">
              {components?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-12">
                  <p>No components yet.</p>
                  <p className="text-sm">Click items on the right to add them.</p>
                </div>
              ) : (
                components?.sort((a, b) => a.order - b.order).map((comp) => (
                  <div 
                    key={comp.id} 
                    className="group relative p-4 rounded-lg border border-transparent hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteComponent.mutate({ id: comp.id, screenId: selectedScreenId! })}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <Label className="pointer-events-none">{comp.label}{comp.required && "*"}</Label>
                    <div className="mt-2 pointer-events-none opacity-60">
                      <Input disabled placeholder={`Input for ${comp.label}`} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Components */}
        <aside className="w-72 border-l border-border bg-card flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm">Components</h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-3">
              {COMPONENT_TYPES.map((item) => (
                <Button
                  key={item.type}
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:border-primary hover:text-primary transition-all"
                  onClick={() => handleAddComponent(item.type)}
                  disabled={!selectedScreenId}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              ))}
            </div>
            
            <Separator className="my-6" />
            
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <Settings className="w-4 h-4" /> Properties
              </div>
              <p className="text-xs text-muted-foreground">
                Select a component on the canvas to edit its properties (label, validation, etc).
              </p>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
