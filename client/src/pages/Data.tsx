import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useApp } from "@/hooks/use-apps";
import { useScreens } from "@/hooks/use-screens";
import { useComponents } from "@/hooks/use-components";
import { useDataEntries } from "@/hooks/use-data-entries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Database, Table2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { ComponentResponse, DataEntryResponse } from "@/types/api";

function parseData(dataStr: string): Record<string, any> {
  try {
    return JSON.parse(dataStr);
  } catch {
    return {};
  }
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

function ScreenDataTable({ screenId }: { screenId: number }) {
  const { data: components = [], isLoading: isLoadingComponents } = useComponents(screenId);
  const { data: entries = [], isLoading: isLoadingEntries } = useDataEntries(screenId);

  const sortedComponents = [...components].sort((a, b) => a.order - b.order);

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={sortedComponents.length + 2}
                className="text-center py-12 text-muted-foreground"
              >
                No data entries yet. Submit the form to see data here.
              </TableCell>
            </TableRow>
          ) : (
            groups.map((group, rowIdx) => {
              // Build a map of componentId -> entry value for this group
              const valueMap: Record<number, any> = {};
              for (const entry of group) {
                const parsed = parseData(entry.data);
                valueMap[entry.componentId] = parsed.value;
              }

              return (
                <TableRow key={rowIdx}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {rowIdx + 1}
                  </TableCell>
                  {sortedComponents.map((comp) => (
                    <TableCell key={comp.id}>
                      <CellValue
                        value={valueMap[comp.id]}
                        elementType={comp.elementType}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(group[0].createdAt), "MMM d, HH:mm")}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/app/${id}/editor`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-lg">{app.name ?? "Untitled App"}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Database className="w-3 h-3" /> Data View
            </p>
          </div>
        </div>
        <Link href={`/app/${id}/editor`}>
          <Button variant="outline" className="gap-2">
            <Table2 className="w-4 h-4" /> Open Editor
          </Button>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
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
                <ScreenDataTable screenId={screen.id} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
