import { Button } from "@/components/ui/button";
import { ArrowRight, Layout, Database, Share2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/login`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display font-bold text-2xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            F
          </div>
          FLEXA
        </div>
        <Button onClick={handleLogin} variant="ghost" className="font-medium">
          Sign In
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground"
            >
              Build internal tools <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                without coding
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Drag, drop, and deploy custom business apps in minutes. 
              The power of a full engineering team at your fingertips.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center gap-4"
            >
              <Button onClick={handleLogin} size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>

          {/* Abstract Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-border bg-card/50 shadow-2xl overflow-hidden aspect-video group"
          >
            {/* Mock Dashboard UI */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/20" />
            <div className="p-8 grid grid-cols-12 gap-6 h-full">
              <div className="col-span-3 bg-background rounded-xl border border-border shadow-sm p-4 space-y-4 opacity-80">
                <div className="h-2 w-1/2 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-8 bg-muted/50 rounded" />)}
                </div>
              </div>
              <div className="col-span-9 space-y-6">
                <div className="flex gap-4">
                  <div className="h-32 flex-1 bg-background rounded-xl border border-border shadow-sm p-4 opacity-90" />
                  <div className="h-32 flex-1 bg-background rounded-xl border border-border shadow-sm p-4 opacity-90" />
                  <div className="h-32 flex-1 bg-background rounded-xl border border-border shadow-sm p-4 opacity-90" />
                </div>
                <div className="h-64 bg-background rounded-xl border border-border shadow-sm p-6 opacity-90" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="bg-secondary/50 py-24 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Layout, title: "Drag & Drop Builder", desc: "Create pixel-perfect interfaces with our intuitive visual editor." },
                { icon: Database, title: "Built-in Database", desc: "Data storage is handled automatically. No SQL knowledge required." },
                { icon: ShieldCheck, title: "Enterprise Security", desc: "Role-based access control and secure authentication out of the box." }
              ].map((feature, i) => (
                <div key={i} className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2024 FLEXA Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
