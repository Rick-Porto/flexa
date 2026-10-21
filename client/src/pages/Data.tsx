import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/hooks/use-apps";
import { useScreens } from "@/hooks/use-screens";
import { useComponents } from "@/hooks/use-components";
import { useDataEntries, useUpdateDataEntry } from "@/hooks/use-data-entries";
import { DataEntryService } from "@/api/dataEntryService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Database, Table2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { ComponentResponse, DataEntryResponse } from "@/types/api";
import type { DataEntryRequest } from "@/types/api";

type RowEditorState = {
  mode: "create" | "edit";
  entries: Record<string, DataEntryResponse>;
  values: Record<string, string | boolean>;
} | null;

function parseData(dataStrOrObj: any): Record<string, any> {
  if (typeof dataStrOrObj === "string") {
    try {
      return JSON.parse(dataStrOrObj);
    } catch {
      return {};
    }
  }
  if (typeof dataStrOrObj === "object" && dataStrOrObj !== null) return dataStrOrObj;
  return {};
}

function CellValue({ value, elementType }: { value: any; elementType: string }) {
  if (value === undefined || value === null || value === "") {
    return <span className="text-muted-foreground italic">empty</span>;
  }

  if (elementType === "checkbox") {
    return value ? (
      <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">Yes</Badge>
    ) : (
      <Badge variant="secondary">No</Badge>
    );
  }

  if (elementType === "date" && value) {
    try {
      return <span>{format(new Date(value), "MMM d, yyyy")}</span>;
    } catch {
      return <span>{String(value)}</span>;
    }
  }

  return <span>{String(value)}</span>;
}

function ScreenDataTable({ appId, screenId }: { appId: string; screenId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: components = [], isLoading: isLoadingComponents } = useComponents(screenId, appId);
  const { data: entries = [], isLoading: isLoadingEntries } = useDataEntries(appId, screenId);
  const updateEntry = useUpdateDataEntry();
  const [rowEditor, setRowEditor] = useState<RowEditorState>(null);
  const [isSavingRow, setIsSavingRow] = useState(false);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    componentId: string;
    value: string;
  } | null>(null);

  const sortedComponents = [...components].sort((a, b) => a.order - b.order);

  const openCreateRow = () => {
    const values = Object.fromEntries(sortedComponents.map((component) => [
      String(component.id), component.elementType === "checkbox" ? false : "",
    ]));
    setRowEditor({ mode: "create", entries: {}, values });
  };

  const openEditRow = (group: DataEntryResponse[]) => {
    const entryMap = Object.fromEntries(group.map((entry) => [String(entry.componentId), entry]));
    const values = Object.fromEntries(sortedComponents.map((component) => {
      const entry = entryMap[String(component.id)];
      const rawValue = entry ? parseData(entry.data).value : undefined;
      const value = component.elementType === "checkbox"
        ? Boolean(rawValue)
        : component.elementType === "date" && rawValue
          ? String(rawValue).slice(0, 10)
          : rawValue == null ? "" : String(rawValue);
      return [String(component.id), value];
    }));
    setRowEditor({ mode: "edit", entries: entryMap, values });
  };

  const updateRowValue = (componentId: string, value: string | boolean) => {
    setRowEditor((current) => current
      ? { ...current, values: { ...current.values, [componentId]: value } }
      : current);
  };

  const saveRow = async () => {
    if (!rowEditor) return;
    setIsSavingRow(true);

    try {
      await Promise.all(sortedComponents.map((component) => {
        const componentId = String(component.id);
        const rawValue = rowEditor.values[componentId] ?? "";
        const value = component.elementType === "number"
          ? rawValue === "" ? null : Number(rawValue)
          : rawValue;
        const entry = rowEditor.entries[componentId];
        const payload: DataEntryRequest = {
          screenId,
          componentId: component.id,
          data: { value },
        };

        if (rowEditor.mode === "edit" && entry) {
          return DataEntryService.update(String(entry.id), payload);
        }
        return DataEntryService.create({ ...payload, appId });
      }));

      setRowEditor(null);
      toast({ title: rowEditor.mode === "create" ? "Row created" : "Row updated" });
    } catch (error) {
      toast({
        title: rowEditor.mode === "create" ? "Could not create row" : "Could not update row",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["dataEntries", appId, String(screenId)] });
      setIsSavingRow(false);
    }
  };

  const deleteRow = async (group: DataEntryResponse[]) => {
    if (!window.confirm("Delete this row and all of its values? This cannot be undone.")) return;
    const rowId = String(group[0]?.id ?? "");
    setDeletingRowId(rowId);

    try {
      await Promise.all(group.map((entry) => DataEntryService.delete(String(entry.id))));
      toast({ title: "Row deleted" });
    } catch (error) {
      toast({
        title: "Could not delete row",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["dataEntries", appId, String(screenId)] });
      setDeletingRowId(null);
    }
  };

  // Each DataEntry is per-component with { value: "..." } in data field
  // Group entries by componentId to build one row per submission batch
  // Use a combination of similar timestamps to group entries from the same submission
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Group entries that were created within 2 seconds of each other (same submission)
  const groups: DataEntryResponse[][] = [];
  let currentGroup: DataEntryResponse[] = [];
  let lastTime = 0;

  for (const entry of sortedEntries) {
    const entryTime = new Date(entry.createdAt).getTime();
    if (currentGroup.length === 0 || entryTime - lastTime > 2000) {
      if (currentGroup.length > 0) groups.push(currentGroup);
      currentGroup = [entry];
    } else {
      currentGroup.push(entry);
    }
    lastTime = entryTime;
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  if (isLoadingComponents || isLoadingEntries) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sortedComponents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Table2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No columns defined for this screen yet.</p>
        <p className="text-sm">Add components in the Editor to define the schema.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={openCreateRow} disabled={isSavingRow} className="gap-2">
          <Plus className="h-4 w-4" /> New row
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px] font-semibold">#</TableHead>
              {sortedComponents.map((comp) => (
                <TableHead key={comp.id} className="font-semibold">
                  <div className="flex items-center gap-2">
                    <span>{comp.label}</span>
                    <Badge variant="outline" className="text-[10px] font-normal px-1 py-0">
                      {comp.elementType}
                    </Badge>
                  </div>
                  {comp.required && (
                    <span className="text-[10px] text-destructive">required</span>
                  )}
                </TableHead>
              ))}
              <TableHead className="text-muted-foreground text-xs">Submitted</TableHead>
              <TableHead className="w-24 text-right text-muted-foreground text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={sortedComponents.length + 3}
                  className="text-center py-12 text-muted-foreground"
                >
                  No data entries yet. Create a row or submit the form to add data.
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group, rowIdx) => {
              // Build a map of componentId -> entry value for this group
              const valueMap: Record<string, any> = {};
              const entryMap: Record<string, DataEntryResponse> = {};
              for (const entry of group) {
                const parsed = parseData(entry.data);
                valueMap[entry.componentId] = parsed.value;
                entryMap[entry.componentId] = entry;
              }

              return (
                <TableRow key={String(group[0].id)}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {rowIdx + 1}
                  </TableCell>
                  {sortedComponents.map((comp) => (
                    <TableCell key={comp.id}>
                      {(() => {
                        const entry = entryMap[comp.id];
                        const isEditing = editingCell?.row === rowIdx &&
                          editingCell.componentId === String(comp.id);
                        const value = valueMap[comp.id];
                        const config = typeof comp.config === "string"
                          ? parseData(comp.config)
                          : comp.config ?? {};
                        const options = Array.isArray(config.options) ? config.options : [];

                        const saveValue = async (rawValue: string | boolean) => {
                          if (!entry) return;
                          const nextValue = comp.elementType === "number"
                            ? rawValue === "" ? null : Number(rawValue)
                            : rawValue;

                          try {
                            await updateEntry.mutateAsync({
                              id: entry.id,
                              appId,
                              screenId: entry.screenId,
                              data: {
                                screenId: entry.screenId,
                                componentId: entry.componentId,
                                data: {
                                  ...parseData(entry.data),
                                  value: nextValue,
                                },
                              },
                            });
                            setEditingCell((current) =>
                              current?.row === rowIdx && current.componentId === String(comp.id)
                                ? null
                                : current
                            );
                          } catch {
                            // The mutation hook reports the error; keep the cell open for correction.
                          }
                        };

                        if (isEditing && entry) {
                          const finishEditing = () => {
                            if (editingCell) void saveValue(editingCell.value);
                          };
                          const inputValue = editingCell.value;

                          if (comp.elementType === "checkbox") {
                            return (
                              <input
                                type="checkbox"
                                autoFocus
                                checked={inputValue === "true"}
                                disabled={updateEntry.isPending}
                                onChange={(event) => void saveValue(event.target.checked)}
                                onKeyDown={(event) => {
                                  if (event.key === "Escape") setEditingCell(null);
                                }}
                                aria-label={comp.label}
                              />
                            );
                          }

                          if (comp.elementType === "select" && options.length > 0) {
                            return (
                              <select
                                autoFocus
                                value={inputValue}
                                disabled={updateEntry.isPending}
                                onChange={(event) => void saveValue(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Escape") setEditingCell(null);
                                }}
                                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                                aria-label={comp.label}
                              >
                                <option value="">Select...</option>
                                {options.map((option: any) => {
                                  const optionValue = typeof option === "string" ? option : option.value;
                                  const optionLabel = typeof option === "string" ? option : option.label ?? option.value;
                                  return <option key={String(optionValue)} value={String(optionValue)}>{String(optionLabel)}</option>;
                                })}
                              </select>
                            );
                          }

                          return (
                            <Input
                              autoFocus
                              type={comp.elementType === "number" ? "number" : comp.elementType === "date" ? "date" : "text"}
                              value={inputValue}
                              disabled={updateEntry.isPending}
                              onChange={(event) => setEditingCell({
                                row: rowIdx,
                                componentId: String(comp.id),
                                value: event.target.value,
                              })}
                              onBlur={finishEditing}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") event.currentTarget.blur();
                                if (event.key === "Escape") setEditingCell(null);
                              }}
                              aria-label={comp.label}
                              className="min-w-28"
                            />
                          );
                        }

                        return (
                          <div className="group flex min-h-9 items-center justify-between gap-2">
                            <CellValue value={value} elementType={comp.elementType} />
                            {entry && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title={`Edit ${comp.label}`}
                                aria-label={`Edit ${comp.label}`}
                                className="h-7 w-7 shrink-0 opacity-100 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 sm:opacity-0"
                                onClick={() => setEditingCell({
                                  row: rowIdx,
                                  componentId: String(comp.id),
                                  value: comp.elementType === "date" && value
                                    ? String(value).slice(0, 10)
                                    : value == null ? "" : String(value),
                                })}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                  ))}
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(group[0].createdAt), "MMM d, HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Edit row"
                        aria-label={`Edit row ${rowIdx + 1}`}
                        onClick={() => openEditRow(group)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Delete row"
                        aria-label={`Delete row ${rowIdx + 1}`}
                        disabled={deletingRowId === String(group[0].id)}
                        onClick={() => void deleteRow(group)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        {deletingRowId === String(group[0].id)
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(rowEditor)}
        onOpenChange={(open) => {
          if (!open && !isSavingRow) setRowEditor(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{rowEditor?.mode === "create" ? "Create row" : "Edit row"}</DialogTitle>
            <DialogDescription>
              {rowEditor?.mode === "create" ? "Enter values for this row." : "Update the values in this row."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {sortedComponents.map((component) => {
              const componentId = String(component.id);
              const config = typeof component.config === "string"
                ? parseData(component.config)
                : component.config ?? {};
              const options = Array.isArray(config.options) ? config.options : [];
              const value = rowEditor?.values[componentId] ?? "";

              return (
                <div key={componentId} className="space-y-2">
                  <Label htmlFor={`row-${componentId}`}>
                    {component.label}{component.required ? " *" : ""}
                  </Label>
                  {component.elementType === "checkbox" ? (
                    <input
                      id={`row-${componentId}`}
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) => updateRowValue(componentId, event.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                  ) : component.elementType === "select" && options.length > 0 ? (
                    <select
                      id={`row-${componentId}`}
                      value={String(value)}
                      onChange={(event) => updateRowValue(componentId, event.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select...</option>
                      {options.map((option: any) => {
                        const optionValue = typeof option === "string" ? option : option.value;
                        const optionLabel = typeof option === "string" ? option : option.label ?? option.value;
                        return <option key={String(optionValue)} value={String(optionValue)}>{String(optionLabel)}</option>;
                      })}
                    </select>
                  ) : (
                    <Input
                      id={`row-${componentId}`}
                      type={component.elementType === "number" ? "number" : component.elementType === "date" ? "date" : "text"}
                      value={String(value)}
                      onChange={(event) => updateRowValue(componentId, event.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRowEditor(null)} disabled={isSavingRow}>
              Cancel
            </Button>
            <Button onClick={() => void saveRow()} disabled={isSavingRow}>
              {isSavingRow ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSavingRow ? "Saving..." : "Save row"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Data() {
  const { id } = useParams<{ id: string }>();
  const { data: app, isLoading: isAppLoading } = useApp(id);
  const { data: screens = [] } = useScreens(id);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (screens.length > 0 && !activeTab) {
      setActiveTab(String(screens[0].id));
    }
  }, [screens, activeTab]);

  if (isAppLoading || !app) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-background overflow-x-hidden md:overflow-hidden">
      {/* Header */}
      <header className="min-h-16 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-0 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/app/${id}/editor`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-lg truncate">{app.name ?? "Untitled App"}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Database className="w-3 h-3" /> Data View
            </p>
          </div>
        </div>
        <Link href={`/app/${id}/editor`} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full gap-2">
            <Table2 className="w-4 h-4" /> Open Editor
          </Button>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto p-3 sm:p-6">
        {screens.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No screens yet</p>
            <p className="text-sm">Create screens in the editor to start collecting data.</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              {screens.map((screen) => (
                <TabsTrigger key={screen.id} value={String(screen.id)}>
                  {screen.name ?? "Untitled"}
                </TabsTrigger>
              ))}
            </TabsList>
            {screens.map((screen) => (
              <TabsContent key={screen.id} value={String(screen.id)}>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">{screen.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Showing all submitted entries for this screen
                  </p>
                </div>
                <ScreenDataTable appId={id} screenId={screen.id} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
