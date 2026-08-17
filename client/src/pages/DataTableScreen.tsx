import { useParams, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit2, Trash2, Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDataEntries, useCreateDataEntry, useUpdateDataEntry, useDeleteDataEntry } from "@/hooks/use-data-entries";
import { useScreen, useScreens } from "@/hooks/use-screens";
import { format } from "date-fns";

interface DataEntryRow {
  id: string | number;
  screenId: string | number;
  userId?: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export default function DataTableScreen() {
  const params = useParams<{ id: string; screenId: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const appId = params?.id ?? "";
  const screenId = params?.screenId ?? "";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DataEntryRow | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});

  const { data: screen } = useScreen(screenId);
  const { data: entries } = useDataEntries(appId, screenId);
  const createEntry = useCreateDataEntry();
  const updateEntry = useUpdateDataEntry();
  const deleteEntry = useDeleteDataEntry();

  // Get all components for this screen to understand the schema
  const components = screen?.components || [];

  // Parse entry data and create dynamic columns
  const parsedEntries = useMemo((): DataEntryRow[] => {
    if (!entries) return [];
    return entries.map(entry => ({
      id: entry.id,
      screenId: entry.screenId,
      // some backend responses may not include userId
      userId: (entry as any).userId,
      data: typeof entry.data === 'string' ? JSON.parse(entry.data) : (entry.data || {}),
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));
  }, [entries]);

  // Filter entries based on search term
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return parsedEntries;
    const term = searchTerm.toLowerCase();
    return parsedEntries.filter(entry =>
      Object.values(entry.data).some(val =>
        String(val).toLowerCase().includes(term)
      )
    );
  }, [parsedEntries, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, currentPage, pageSize]);

  // Handle edit
  const handleEdit = (entry: DataEntryRow) => {
    setEditingEntry(entry);
    // Convert entry data to form fields (strings for inputs)
    const formData: Record<string, string> = {};
    components.forEach(comp => {
      const value = entry.data[comp.model || comp.label];
      formData[comp.model || comp.label] = value !== undefined ? String(value) : "";
    });
    setEditFormData(formData);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingEntry) return;

    // Build payload with proper types
    const payload: Record<string, unknown> = {};
    components.forEach(comp => {
      const key = comp.model || comp.label;
      const value = editFormData[key];

      // Convert based on component type
      if (comp.elementType === "number") {
        payload[key] = value === "" ? null : Number(value);
      } else if (comp.elementType === "checkbox") {
        payload[key] = value === "true" || value === "on" || value === "1";
      } else if (comp.elementType === "select") {
        payload[key] = value;
      } else {
        payload[key] = value;
      }
    });

    try {
      await updateEntry.mutateAsync({
        id: Number(editingEntry.id),
        appId,
        screenId: Number(editingEntry.screenId),
        data: payload as any,
      });
      setEditDialogOpen(false);
      setEditingEntry(null);
      setEditFormData({});
      queryClient.invalidateQueries({ queryKey: ["dataEntries", appId, screenId] });
      toast({ title: "Entrada atualizada com sucesso" });
    } catch (err) {
      console.error("Error updating entry:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta entrada?")) return;

    try {
      await deleteEntry.mutateAsync({ id, appId, screenId });
      queryClient.invalidateQueries({ queryKey: ["dataEntries", appId, screenId] });
      toast({ title: "Entrada excluída com sucesso" });
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  const handleCreateNew = async () => {
    // Build empty payload with proper structure
    const payload: Record<string, unknown> = {};
    components.forEach(comp => {
      const key = comp.model || comp.label;
      if (comp.elementType === "number") {
        payload[key] = null;
      } else if (comp.elementType === "checkbox") {
        payload[key] = false;
      } else {
        payload[key] = "";
      }
    });

    try {
      await createEntry.mutateAsync({
        appId,
        data: {
          ...payload,
          screenId,
          componentId: components[0]?.id ?? "",
        } as any,
      });
      queryClient.invalidateQueries({ queryKey: ["dataEntries", appId, screenId] });
      toast({ title: "Entrada criada com sucesso" });
    } catch (err) {
      console.error("Error creating entry:", err);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [key]: value }));
  };

  if (!screen) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => (navigate as any)(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{screen.name ?? "Untitled Screen"}</h1>
            <p className="text-muted-foreground">Gerencie as entradas de dados desta tela</p>
          </div>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Entrada
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar entradas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {components.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {components.map(comp => (
                      <TableHead key={comp.id} className="w-[200px]">
                        {comp.label}
                      </TableHead>
                    ))}
                    <TableHead className="w-[180px]">Criado em</TableHead>
                    <TableHead className="w-32">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={components.length + 2} className="text-center py-12 text-muted-foreground">
                        {filteredEntries.length === 0
                          ? "Nenhuma entrada encontrada"
                          : "Nenhuma entrada correspondente à busca"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEntries.map(entry => (
                      <TableRow key={entry.id} className="hover:bg-muted/50">
                        {components.map(comp => {
                          const key = comp.model || comp.label;
                          const value = entry.data[key];
                          return (
                            <TableCell key={comp.id}>
                              {comp.elementType === "checkbox" ? (
                                <Checkbox
                                  checked={Boolean(value)}
                                  disabled
                                />
                              ) : (
                                <span className="max-w-[180px] truncate block">
                                  {value !== undefined && value !== null ? String(value) : "-"}
                                </span>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(entry)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(String(entry.id))}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p>Esta tela não possui componentes configurados.</p>
              <p className="text-sm mt-2">Adicione componentes no editor para começar a coletar dados.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({filteredEntries.length} entradas)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Entrada</DialogTitle>
            <DialogDescription>
              Modifique os valores abaixo e salve as alterações.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 md:grid-cols-2">
            {components.map(comp => {
              const key = comp.model || comp.label;
              return (
                <div key={comp.id} className="space-y-2">
                  <Label htmlFor={`edit-${key}`}>{comp.label}</Label>
                  {comp.elementType === "select" && comp.config ? (
                    <Select
                      value={editFormData[key] || ""}
                      onValueChange={(value) => handleInputChange(key, value)}
                    >
                      <SelectTrigger id={`edit-${key}`}>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const config = typeof comp.config === "string"
                            ? JSON.parse(comp.config || "{}")
                            : comp.config || {};
                          return config.options?.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          )) || [];
                        })()}
                      </SelectContent>
                    </Select>
                  ) : comp.elementType === "checkbox" ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-${key}`}
                        checked={editFormData[key] === "true" || editFormData[key] === "on" || editFormData[key] === "1"}
                        onCheckedChange={(checked) => handleInputChange(key, checked ? "true" : "false")}
                      />
                      <Label htmlFor={`edit-${key}`} className="mb-0">Ativo</Label>
                    </div>
                  ) : comp.elementType === "textarea" ? (
                    <textarea
                      id={`edit-${key}`}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={editFormData[key] || ""}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                  ) : comp.elementType === "number" ? (
                    <Input
                      id={`edit-${key}`}
                      type="number"
                      value={editFormData[key] || ""}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder="Digite um número"
                    />
                  ) : (
                    <Input
                      id={`edit-${key}`}
                      value={editFormData[key] || ""}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder={`Digite ${comp.label.toLowerCase()}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateEntry.isPending}>
              {updateEntry.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}