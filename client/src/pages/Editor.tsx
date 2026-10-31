import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useApp, usePublishApp } from "@/hooks/use-apps";
import { useScreens, useCreateScreen, useDeleteScreen } from "@/hooks/use-screens";
import { useComponents, useUpdateComponent, useDeleteComponent } from "@/hooks/use-components";
import { ComponentService } from "@/api/componentService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
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
  Eye,
  Settings,
  Database,
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import type { ComponentResponse } from "@/types/api";

const COMPONENT_TYPES = [
  { type: "text", label: "Text Input", icon: Type },
  { type: "number", label: "Number Input", icon: Hash },
  { type: "date", label: "Date Picker", icon: Calendar },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "dropdown", label: "Dropdown", icon: List },
];

function parseConfig(config: string | Record<string, any> | null): Record<string, any> {
  if (!config) return {};
  if (typeof config === "string") {
    try {
      return JSON.parse(config);
    } catch {
      return {};
    }
  }
  return config;
}

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [pendingComponents, setPendingComponents] = useState<ComponentResponse[]>([]);
  const [isSavingComponents, setIsSavingComponents] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isNewScreenOpen, setIsNewScreenOpen] = useState(false);
  const [newScreenName, setNewScreenName] = useState("");
  const [componentLabelDraft, setComponentLabelDraft] = useState("");
  const savedComponentLabel = useRef<string | null>(null);
  const canvasRef = useRef<HTMLElement>(null);
  const scrollToNewComponent = useRef(false);

  const { data: app, isLoading: isAppLoading } = useApp(id);
  const { data: screens = [], isLoading: isLoadingScreens } = useScreens(id);
  const activeScreenId = screens.some((screen) => screen.id === selectedScreenId)
    ? selectedScreenId
    : screens[0]?.id ?? null;
  const { data: savedComponents = [], isLoading: isLoadingComponents } = useComponents(
    activeScreenId ?? undefined,
    id
  );
  const components = [
    ...savedComponents,
    ...pendingComponents.filter((component) => String(component.screenId) === String(activeScreenId)),
  ];

  const createScreen = useCreateScreen();
  const deleteScreen = useDeleteScreen();
  const updateComponent = useUpdateComponent();
  const deleteComponent = useDeleteComponent();
  const publishApp = usePublishApp();

  // Auto-select first screen
  useEffect(() => {
    if (activeScreenId !== selectedScreenId) {
      setSelectedScreenId(activeScreenId);
    }
  }, [activeScreenId, selectedScreenId]);

  // Reset selected component when screen changes
  useEffect(() => {
    setSelectedComponentId(null);
  }, [activeScreenId]);

  const selectedComponent = components?.find(c => String(c.id) === selectedComponentId) ?? null;

  useEffect(() => {
    setComponentLabelDraft(selectedComponent?.label ?? "");
    savedComponentLabel.current = selectedComponent?.label ?? null;
  }, [selectedComponent?.id, selectedComponent?.label]);

  useEffect(() => {
    if (!scrollToNewComponent.current || components.length === 0) return;

    scrollToNewComponent.current = false;
    const frame = window.requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.scrollTo({ top: canvas.scrollHeight, behavior: "smooth" });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [components.length]);

  const handleCreateScreen = () => {
    if (!newScreenName.trim() || !id) return;
    createScreen.mutate(
      { name: newScreenName, appId: id },
      {
        onSuccess: () => {
          setIsNewScreenOpen(false);
          setNewScreenName("");
        },
      }
    );
  };

  const handleAddComponent = (type: string) => {
    if (activeScreenId === null || !id) return;
    scrollToNewComponent.current = true;
    const count = components?.length || 0;
    const defaultConfig =
      type === "dropdown"
        ? { options: ["Option 1", "Option 2"] }
        : undefined;

    const timestamp = new Date().toISOString();
    setPendingComponents((current) => [...current, {
      id: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      elementType: type,
      label: `New ${type}`,
      model: `field_${Date.now()}`,
      config: defaultConfig ?? null,
      order: count,
      required: false,
      validationRule: null,
      screenId: activeScreenId,
      createdAt: timestamp,
      updatedAt: timestamp,
      dataEntries: [],
    }]);
  };

  const refreshComponentCaches = async (screenIds: string[]) => {
    await Promise.all(screenIds.map(async (screenId) => {
      const components = await ComponentService.getByScreen(screenId);
      queryClient.setQueryData(
        ["components", id ?? "", String(screenId)],
        components.filter((component) => String(component.screenId) === String(screenId))
      );
    }));
  };

  const savePendingComponents = async () => {
    if (!id) return false;
    const drafts = pendingComponents.filter((component) =>
      screens.some((screen) => String(screen.id) === String(component.screenId))
    );
    if (drafts.length === 0) return true;

    setIsSavingComponents(true);
    const savedIds: string[] = [];
    const touchedScreenIds = Array.from(new Set(drafts.map((component) => String(component.screenId))));
    try {
      for (const component of drafts) {
        await ComponentService.create({
          elementType: component.elementType,
          label: component.label,
          model: component.model ?? undefined,
          config: component.config,
          order: component.order,
          required: component.required,
          validationRule: component.validationRule ?? undefined,
          screenId: component.screenId,
        });
        savedIds.push(String(component.id));
      }

      await refreshComponentCaches(touchedScreenIds);
      setPendingComponents((current) => current.filter((component) => !savedIds.includes(String(component.id))));
      toast({ title: "Changes saved" });
      return true;
    } catch (error) {
      setPendingComponents((current) => current.filter((component) => !savedIds.includes(String(component.id))));
      await Promise.all(touchedScreenIds.map(async (screenId) => {
        try {
          await refreshComponentCaches([screenId]);
        } catch {
          queryClient.invalidateQueries({ queryKey: ["components", id, screenId] });
        }
      }));
      toast({
        title: "Unable to save all fields",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSavingComponents(false);
    }
  };

  const handlePublish = async () => {
    if (!id || !(await savePendingComponents())) return;
    await publishApp.mutateAsync(id);
  };

  const handleDeleteComponent = (component: ComponentResponse) => {
    if (String(component.id).startsWith("pending-")) {
      setPendingComponents((current) => current.filter((item) => item.id !== component.id));
      if (selectedComponentId === String(component.id)) setSelectedComponentId(null);
      return;
    }

    if (!activeScreenId) return;
    deleteComponent.mutate({ id: component.id, screenId: activeScreenId, appId: id });
    if (selectedComponentId === String(component.id)) setSelectedComponentId(null);
  };

  const handleUpdateComponent = (comp: ComponentResponse, updates: Partial<ComponentResponse>) => {
    if (String(comp.id).startsWith("pending-")) {
      setPendingComponents((current) => current.map((component) =>
        component.id === comp.id ? { ...component, ...updates } : component
      ));
      return;
    }
    if (!activeScreenId) return;
    updateComponent.mutate({
      id: comp.id,
      screenId: activeScreenId,
      appId: id,
      data: {
        elementType: updates.elementType ?? comp.elementType,
        label: updates.label ?? comp.label,
        model: comp.model ?? undefined,
        config: updates.config ?? comp.config ?? undefined,
        order: comp.order,
        required: updates.required ?? comp.required,
        screenId: activeScreenId,
      },
    });
  };

  const handleSaveComponentLabel = () => {
    if (!selectedComponent || componentLabelDraft === savedComponentLabel.current) return;
    savedComponentLabel.current = componentLabelDraft;
    handleUpdateComponent(selectedComponent, { label: componentLabelDraft });
  };

  if (isAppLoading || isLoadingScreens || !app || (activeScreenId !== null && isLoadingComponents)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {isLoadingComponents ? "Loading screen fields..." : "Loading app screens..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-background overflow-x-hidden md:overflow-hidden">
      {/* Header */}
      <header className="min-h-16 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-0 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-lg truncate">{app.name ?? "Untitled App"}</h1>
            <p className="text-xs text-muted-foreground">Editor Mode</p>
          </div>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Link href={`/app/${id}/data`} className="flex-1 sm:flex-none">
            <Button variant="outline" aria-label="Open data view" title="Data" className="w-full gap-2 px-2 sm:w-auto sm:px-4">
              <Database className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Data</span>
            </Button>
          </Link>
          <Link href={`/app/${id}/preview`} className="flex-1 sm:flex-none">
            <Button variant="outline" aria-label="Preview app" title="Preview App" className="w-full gap-2 px-2 sm:w-auto sm:px-4">
              <Eye className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Preview App</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex-1 gap-2 px-2 sm:px-4"
            onClick={() => void savePendingComponents()}
            disabled={isSavingComponents || pendingComponents.length === 0}
          >
            {isSavingComponents ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save{pendingComponents.length > 0 ? ` (${pendingComponents.length})` : ""}</span>
          </Button>
          <Button
            className="flex-1 gap-2 px-2 sm:px-4 btn-primary"
            onClick={() => void handlePublish()}
            disabled={isSavingComponents || publishApp.isPending}
          >
            {publishApp.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{publishApp.isPending ? "Publishing..." : "Publish"}</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row md:overflow-hidden">
        {/* Left Sidebar: Screens */}
        <aside className="w-full max-h-56 md:max-h-none md:w-64 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col shrink-0">
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
                    activeScreenId === screen.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setSelectedScreenId(screen.id)}
                >
                  <span>{screen.name ?? "Untitled Screen"}</span>
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
        <main ref={canvasRef} className="min-w-0 min-h-0 flex-1 bg-muted/30 p-3 pb-24 sm:p-8 sm:pb-24 overflow-auto flex items-start justify-center">
          <div className="h-max w-full max-w-2xl shrink-0 bg-card rounded-xl shadow-lg border border-border min-h-[480px] sm:min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold">
                {screens?.find((s) => s.id === activeScreenId)?.name ?? "Select a screen"}
              </h2>
            </div>
            <div className="p-6 space-y-4 flex-1">
              {components?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-12">
                  <p>No components yet.</p>
                  <p className="text-sm">Click items on the right to add them.</p>
                </div>
              ) : (
                components
                  ?.sort((a, b) => a.order - b.order)
                  .map((comp) => (
                    <div
                      key={comp.id}
                      className={cn(
                        "group relative p-4 rounded-lg border transition-all cursor-pointer",
                        String(comp.id).startsWith("pending-") && "border-primary/40 bg-primary/5",
                        selectedComponentId === String(comp.id)
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-transparent hover:border-primary/50 hover:bg-primary/5"
                      )}
                      onClick={() => setSelectedComponentId(String(comp.id))}
                    >
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComponent(comp);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Label className="pointer-events-none block max-w-full break-words text-base font-semibold leading-6 md:text-lg md:leading-7">
                        {comp.label}
                        {comp.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {String(comp.id).startsWith("pending-") && (
                        <div className="mt-2 text-xs font-medium text-primary">
                          Unsaved
                        </div>
                      )}
                      <div className="mt-2 pointer-events-none opacity-60">
                        {comp.elementType === "checkbox" ? (
                          <div className="flex items-center gap-2">
                            <Checkbox disabled />
                            <span className="text-sm text-muted-foreground">{comp.label}</span>
                          </div>
                        ) : comp.elementType === "dropdown" ? (
                          <Input disabled placeholder="Select an option..." />
                        ) : (
                          <Input disabled placeholder={`${comp.elementType} input`} type={comp.elementType === "number" ? "number" : comp.elementType === "date" ? "date" : "text"} />
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Components & Properties */}
        <aside className="w-full md:w-72 border-t md:border-t-0 md:border-l border-border bg-card flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm">
              {selectedComponent ? "Properties" : "Components"}
            </h2>
          </div>
          <ScrollArea className="flex-1 p-4">
            {selectedComponent ? (
              /* Property Editor */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Editing Component</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSelectedComponentId(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={componentLabelDraft}
                    onChange={(e) => setComponentLabelDraft(e.target.value)}
                    onBlur={handleSaveComponentLabel}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveComponentLabel();
                        e.currentTarget.blur();
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Type</Label>
                  <select
                    value={selectedComponent.elementType}
                    onChange={(e) => handleUpdateComponent(selectedComponent, { elementType: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="dropdown">Dropdown</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="required-check"
                    checked={selectedComponent.required}
                    onCheckedChange={(checked) =>
                      handleUpdateComponent(selectedComponent, { required: !!checked })
                    }
                  />
                  <Label htmlFor="required-check" className="text-sm font-normal cursor-pointer">
                    Required field
                  </Label>
                </div>

                {selectedComponent.elementType === "dropdown" && (
                  <div className="space-y-2">
                    <Label className="text-xs">Dropdown Options</Label>
                    <DropdownOptionsEditor
                      config={typeof selectedComponent.config === "string" ? parseConfig(selectedComponent.config) : selectedComponent.config}
                      onChange={(newConfig) =>
                        handleUpdateComponent(selectedComponent, { config: newConfig })
                      }
                    />
                  </div>
                )}

                <Separator />

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Model: <code className="bg-muted px-1 rounded">{selectedComponent.model}</code></p>
                  <p>Order: {selectedComponent.order}</p>
                  <p>ID: {selectedComponent.id}</p>
                </div>
              </div>
            ) : (
              /* Component Palette */
              <>
                <div className="grid grid-cols-2 gap-3">
                  {COMPONENT_TYPES.map((item) => (
                    <Button
                      key={item.type}
                      variant="outline"
                      className="h-20 flex flex-col gap-2 hover:border-primary hover:text-primary transition-all"
                      onClick={() => handleAddComponent(item.type)}
                      disabled={activeScreenId === null || isSavingComponents}
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
                    Click a component on the canvas to edit its properties.
                  </p>
                </div>
              </>
            )}
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}

function DropdownOptionsEditor({ config, onChange }: { config: Record<string, any> | null; onChange: (config: Record<string, any>) => void }) {
  const parsed = parseConfig(config);
  const options: string[] = parsed.options || [];
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (!newOption.trim()) return;
    const updated = [...options, newOption.trim()];
    onChange({ options: updated });
    setNewOption("");
  };

  const removeOption = (idx: number) => {
    const updated = options.filter((_, i) => i !== idx);
    onChange({ options: updated });
  };

  return (
    <div className="space-y-2">
      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <Input
            value={opt}
            onChange={(e) => {
              const updated = [...options];
              updated[idx] = e.target.value;
              onChange({ options: updated });
            }}
            className="h-7 text-xs flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive shrink-0"
            onClick={() => removeOption(idx)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
      <div className="flex gap-1">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="New option"
          className="h-7 text-xs"
          onKeyDown={(e) => e.key === "Enter" && addOption()}
        />
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addOption}>
          Add
        </Button>
      </div>
    </div>
  );
}
