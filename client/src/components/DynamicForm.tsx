import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ComponentResponse } from "@/types/api";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DynamicFormProps {
  components: ComponentResponse[];
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting?: boolean;
}

export function DynamicForm({ components, onSubmit, isSubmitting }: DynamicFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  const sortedComponents = [...components].sort((a, b) => a.order - b.order);

  const parseConfig = (config: Record<string, any> | string | null): Record<string, any> => {
    if (!config) return {};
    if (typeof config === "string") {
      try {
        return JSON.parse(config);
      } catch {
        return {};
      }
    }
    return config;
  };

  const renderField = (comp: ComponentResponse) => {
    const commonProps = {
      id: String(comp.id),
      ...register(comp.model || `field_${comp.id}`, {
        required: comp.required ? "This field is required" : false,
      }),
    };

    switch (comp.elementType) {
      case "text":
        return (
          <Input
            {...commonProps}
            placeholder={comp.label}
          />
        );
      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            placeholder="0"
          />
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={String(comp.id)}
              onCheckedChange={(checked) => setValue(comp.model || `field_${comp.id}`, checked)}
            />
            <Label htmlFor={String(comp.id)} className="font-normal cursor-pointer">
              {comp.label}
            </Label>
          </div>
        );
      case "date":
        const dateValue = watch(comp.model || `field_${comp.id}`);
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => setValue(comp.model || `field_${comp.id}`, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case "dropdown":
      case "select":
        const cfg = parseConfig(comp.config);
        const options: string[] = cfg.options || [];
        return (
          <Select onValueChange={(val) => setValue(comp.model || `field_${comp.id}`, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt: string) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "textarea":
        return (
          <textarea
            {...commonProps}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder={comp.label}
          />
        );
      default:
        return (
          <Input
            {...commonProps}
            placeholder={comp.label}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {sortedComponents.map((comp) => (
        <div key={comp.id} className="space-y-2">
          {comp.elementType !== "checkbox" && (
            <Label htmlFor={String(comp.id)}>
              {comp.label}
              {comp.required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          {renderField(comp)}
          {errors[comp.model || `field_${comp.id}`] && (
            <p className="text-sm text-destructive">
              {errors[comp.model || `field_${comp.id}`]?.message as string}
            </p>
          )}
        </div>
      ))}

      <Button type="submit" disabled={isSubmitting} className="w-full btn-primary">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Entry"
        )}
      </Button>
    </form>
  );
}
