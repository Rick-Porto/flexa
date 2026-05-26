import { useApps, useDeleteApp } from "@/hooks/use-apps";
import { CreateAppDialog } from "@/components/CreateAppDialog";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Eye, Trash2, Calendar, MoreVertical, Layout } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { data: apps, isLoading } = useApps();
  const deleteApp = useDeleteApp();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse space-y-8">
        <div className="h-10 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and deploy your applications</p>
        </div>
        <CreateAppDialog />
      </div>

      {apps && apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-dashed border-border rounded-3xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
            <Layout className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">No apps yet</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Create your first application to start building forms and workflows.
          </p>
          <CreateAppDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps?.map((app) => (
            <Card key={app.id} className="group hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/50">
              <CardHeader className="relative">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl font-bold font-display">
                      {(app.name ?? "A").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteApp.mutate(app.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-xl">{app.name ?? "Untitled App"}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {format(new Date(app.createdAt), "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardFooter className="gap-2 pt-0">
                <Link href={`/app/${app.id}/editor`} className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Edit2 className="w-4 h-4" />
                    Editor
                  </Button>
                </Link>
                <Link href={`/app/${app.id}/preview`} className="flex-1">
                  <Button className="w-full gap-2 btn-primary">
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
