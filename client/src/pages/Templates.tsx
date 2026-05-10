import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TEMPLATES = [
  {
    title: "Employee Onboarding",
    description: "Collect personal details, tax forms, and equipment preferences for new hires.",
    category: "HR"
  },
  {
    title: "Inventory Tracker",
    description: "Manage stock levels, locations, and supplier details with ease.",
    category: "Operations"
  },
  {
    title: "Event Registration",
    description: "Public facing form for event signups with dietary requirements.",
    category: "Marketing"
  },
  {
    title: "Incident Report",
    description: "Standardized reporting for workplace accidents or security incidents.",
    category: "Safety"
  },
  {
    title: "Feedback Survey",
    description: "Collect customer or employee feedback with rating scales.",
    category: "General"
  },
  {
    title: "Expense Claim",
    description: "Submit expenses with receipt uploads and category selection.",
    category: "Finance"
  }
];

export default function Templates() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
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
                <div className="w-full h-32 bg-muted/30 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground/30 text-4xl font-display font-bold select-none group-hover:bg-muted/50 transition-colors">
                  Aa
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant="outline">
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
