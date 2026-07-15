import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateApp } from "@/hooks/use-apps";
import { useCreateScreen } from "@/hooks/use-screens";
import { useCreateComponent } from "@/hooks/use-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, Pencil } from "lucide-react";

interface TemplateField {
  label: string;
  elementType: string;
  model: string;
  config?: string;
  required?: boolean;
}

interface Template {
  title: string;
  description: string;
  category: string;
  screens: { name: string; fields: TemplateField[] }[];
}

const TEMPLATES: Template[] = [
  {
    title: "Employee Onboarding",
    description: "Collect personal details, tax forms, and equipment preferences for new hires.",
    category: "HR",
    screens: [
      {
        name: "Personal Details",
        fields: [
          { label: "Full Name", elementType: "text", model: "full_name", required: true },
          { label: "Email", elementType: "text", model: "email", required: true },
          { label: "Phone", elementType: "text", model: "phone" },
          { label: "Start Date", elementType: "date", model: "start_date", required: true },
          { label: "Department", elementType: "dropdown", model: "department", config: JSON.stringify({ options: ["Engineering", "Marketing", "Sales", "HR", "Finance"] }) },
        ],
      },
      {
        name: "Equipment",
        fields: [
          { label: "Laptop Type", elementType: "dropdown", model: "laptop_type", config: JSON.stringify({ options: ["MacBook Pro", "MacBook Air", "Windows Laptop", "Linux Laptop"] }) },
          { label: "Needs Monitor", elementType: "checkbox", model: "needs_monitor" },
          { label: "T-Shirt Size", elementType: "dropdown", model: "tshirt_size", config: JSON.stringify({ options: ["S", "M", "L", "XL", "XXL"] }) },
        ],
      },
    ],
  },
  {
    title: "Inventory Tracker",
    description: "Manage stock levels, locations, and supplier details with ease.",
    category: "Operations",
    screens: [
      {
        name: "Item Details",
        fields: [
          { label: "Item Name", elementType: "text", model: "item_name", required: true },
          { label: "SKU", elementType: "text", model: "sku", required: true },
          { label: "Quantity", elementType: "number", model: "quantity", required: true },
          { label: "Location", elementType: "text", model: "location" },
          { label: "Category", elementType: "dropdown", model: "category", config: JSON.stringify({ options: ["Electronics", "Office Supplies", "Furniture", "Raw Materials"] }) },
        ],
      },
    ],
  },
  {
    title: "Event Registration",
    description: "Public facing form for event signups with dietary requirements.",
    category: "Marketing",
    screens: [
      {
        name: "Registration",
        fields: [
          { label: "Name", elementType: "text", model: "name", required: true },
          { label: "Email", elementType: "text", model: "email", required: true },
          { label: "Company", elementType: "text", model: "company" },
          { label: "Dietary Requirements", elementType: "dropdown", model: "dietary", config: JSON.stringify({ options: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher"] }) },
          { label: "Date", elementType: "date", model: "event_date", required: true },
        ],
      },
    ],
  },
  {
    title: "Incident Report",
    description: "Standardized reporting for workplace accidents or security incidents.",
    category: "Safety",
    screens: [
      {
        name: "Incident Details",
        fields: [
          { label: "Incident Date", elementType: "date", model: "incident_date", required: true },
          { label: "Location", elementType: "text", model: "location", required: true },
          { label: "Description", elementType: "textarea", model: "description", required: true },
          { label: "Severity", elementType: "dropdown", model: "severity", config: JSON.stringify({ options: ["Low", "Medium", "High", "Critical"] }) },
          { label: "Witnesses Present", elementType: "checkbox", model: "witnesses" },
        ],
      },
    ],
  },
  {
    title: "Feedback Survey",
    description: "Collect customer or employee feedback with rating scales.",
    category: "General",
    screens: [
      {
        name: "Feedback",
        fields: [
          { label: "Name", elementType: "text", model: "name" },
          { label: "Email", elementType: "text", model: "email" },
          { label: "Rating", elementType: "dropdown", model: "rating", config: JSON.stringify({ options: ["1 - Poor", "2 - Fair", "3 - Good", "4 - Very Good", "5 - Excellent"] }), required: true },
          { label: "Comments", elementType: "textarea", model: "comments" },
          { label: "Follow Up", elementType: "checkbox", model: "follow_up" },
        ],
      },
    ],
  },
  {
    title: "Expense Claim",
    description: "Submit expenses with receipt uploads and category selection.",
    category: "Finance",
    screens: [
      {
        name: "Expense Details",
        fields: [
          { label: "Expense Date", elementType: "date", model: "expense_date", required: true },
          { label: "Amount", elementType: "number", model: "amount", required: true },
          { label: "Category", elementType: "dropdown", model: "category", config: JSON.stringify({ options: ["Travel", "Meals", "Office Supplies", "Software", "Other"] }), required: true },
          { label: "Description", elementType: "textarea", model: "description", required: true },
          { label: "Recurring", elementType: "checkbox", model: "recurring" },
        ],
      },
    ],
  },
];

export default function Templates() {
  const [, navigate] = useLocation();
  const createApp = useCreateApp();
  const createScreen = useCreateScreen();
  const createComponent = useCreateComponent();

  const [editOpen, setEditOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [appName, setAppName] = useState("");
  const [editedFields, setEditedFields] = useState<TemplateField[]>([]);
  const [editedScreenName, setEditedScreenName] = useState("");
  const [activeScreenIdx, setActiveScreenIdx] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const openTemplateEditor = (template: Template) => {
    setSelectedTemplate(template);
    setAppName(template.title);
    setActiveScreenIdx(0);
    setEditedScreenName(template.screens[0].name);
    setEditedFields([...template.screens[0].fields]);
    setPreviewMode(false);
    setEditOpen(true);
  };

  const parseConfig = (config?: string): Record<string, any> => {
    if (!config) return {};
    try { return JSON.parse(config); } catch { return {}; }
  };

  const renderPreviewField = (field: TemplateField, idx: number) => {
    const cfg = parseConfig(field.config);
    switch (field.elementType) {
      case "checkbox":
        return (
          <div key={idx} className="flex items-center space-x-2">
            <Checkbox id={`preview-${idx}`} disabled />
            <Label htmlFor={`preview-${idx}`} className="font-normal">{field.label}</Label>
          </div>
        );
      case "dropdown":
        return (
          <div key={idx} className="space-y-2">
            <Label>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</Label>
            <Select disabled>
              <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
              <SelectContent>{(cfg.options || []).map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        );
      case "textarea":
        return (
          <div key={idx} className="space-y-2">
            <Label>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</Label>
            <textarea disabled className="flex min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm" placeholder={field.label} />
          </div>
        );
      default:
        return (
          <div key={idx} className="space-y-2">
            <Label>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</Label>
            <Input disabled placeholder={field.label} type={field.elementType === "number" ? "number" : field.elementType === "date" ? "date" : "text"} />
          </div>
        );
    }
  };

  const switchScreen = (idx: number) => {
    if (!selectedTemplate) return;
    // Save current fields back to template temporarily
    const updatedScreens = [...selectedTemplate.screens];
    updatedScreens[activeScreenIdx] = { ...updatedScreens[activeScreenIdx], name: editedScreenName, fields: editedFields };
    setSelectedTemplate({ ...selectedTemplate, screens: updatedScreens });
    setActiveScreenIdx(idx);
    setEditedScreenName(updatedScreens[idx].name);
    setEditedFields([...updatedScreens[idx].fields]);
  };

  const updateField = (index: number, key: keyof TemplateField, value: string | boolean) => {
    const updated = [...editedFields];
    updated[index] = { ...updated[index], [key]: value };
    setEditedFields(updated);
  };

  const removeField = (index: number) => {
    setEditedFields(editedFields.filter((_, i) => i !== index));
  };

  const addField = () => {
    setEditedFields([...editedFields, { label: "New Field", elementType: "text", model: `field_${Date.now()}` }]);
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleUseTemplate = async () => {
    if (!selectedTemplate || !appName.trim()) return;

    // Build final screens with current edits
    const allScreens = selectedTemplate.screens.map((s, i) =>
      i === activeScreenIdx ? { name: editedScreenName, fields: editedFields } : s
    );

    setIsCreating(true);
    try {
      const app = await createApp.mutateAsync({ name: appName, description: selectedTemplate.description });

      for (const screen of allScreens) {
        const createdScreen = await createScreen.mutateAsync({ name: screen.name, appId: app.id });

        for (let order = 0; order < screen.fields.length; order++) {
          const field = screen.fields[order];
          await createComponent.mutateAsync({
            elementType: field.elementType,
            label: field.label,
            model: field.model,
            order,
            required: field.required || false,
            screenId: createdScreen.id,
            ...(field.config ? { config: parseConfig(field.config) } : {}),
          });
        }
      }

      setEditOpen(false);
      navigate(`/app/${app.id}/editor`);
    } catch (err) {
      console.error("Failed to create app from template:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-4">Start with a Template</h1>
        <p className="text-muted-foreground text-lg">
          Choose from our pre-built templates to get up and running in seconds.
          Fully customizable to match your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TEMPLATES.map((template, i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 group flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                  {template.category}
                </Badge>
              </div>
              <CardTitle className="text-xl">{template.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-1 text-sm text-muted-foreground">
                {template.screens.map((s, si) => (
                  <div key={si} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary/40" />
                    <span>{s.name}</span>
                    <span className="text-xs">({s.fields.length} fields)</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                variant="outline"
                onClick={() => openTemplateEditor(template)}
              >
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Template</DialogTitle>
            <DialogDescription>
              Edit the app name, screen names, and fields before creating your app.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* App Name */}
            <div className="space-y-2">
              <Label>App Name</Label>
              <Input
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="My App"
              />
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={!previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(false)}
              >
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(true)}
              >
                <Eye className="w-4 h-4 mr-1" /> Preview
              </Button>
            </div>

            {/* Screen Tabs */}
            {selectedTemplate && selectedTemplate.screens.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {selectedTemplate.screens.map((s, i) => (
                  <Button
                    key={i}
                    variant={i === activeScreenIdx ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchScreen(i)}
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            )}

            {previewMode ? (
              /* Preview Mode */
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h3 className="font-medium text-lg">{editedScreenName}</h3>
                <div className="space-y-4">
                  {editedFields.map((field, i) => renderPreviewField(field, i))}
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <>
                {/* Screen Name */}
                <div className="space-y-2">
                  <Label>Screen Name</Label>
                  <Input
                    value={editedScreenName}
                    onChange={(e) => setEditedScreenName(e.target.value)}
                    placeholder="Screen name"
                  />
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Fields</Label>
                    <Button variant="outline" size="sm" onClick={addField}>
                      + Add Field
                    </Button>
                  </div>
                  {editedFields.map((field, i) => (
                    <div key={i} className="flex items-end gap-2 p-3 border rounded-lg bg-muted/30">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(i, "label", e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Type</Label>
                          <select
                            value={field.elementType}
                            onChange={(e) => updateField(i, "elementType", e.target.value)}
                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="textarea">Textarea</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pb-0.5">
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateField(i, "required", e.target.checked)}
                          />
                          Req
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeField(i)}
                        >
                          &times;
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUseTemplate} disabled={createApp.isPending}>
              {createApp.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create App"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
