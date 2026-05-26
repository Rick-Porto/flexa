import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useCreateApp } from "@/hooks/use-apps";

const formSchema = z.object({
  name: z.string().min(1, "App name is required"),
  description: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export function CreateAppDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateApp();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    mutate(
      { name: data.name, description: data.description },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Create New App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Application</DialogTitle>
          <DialogDescription>
            Give your new application a name to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">App Name</Label>
            <Input id="name" placeholder="My Awesome App" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" placeholder="A short description..." {...register("description")} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create App"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
