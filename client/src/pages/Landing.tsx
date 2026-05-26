import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Layout, Database, Share2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
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
              Build internal tools <br />
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
              Create forms, dashboards, and workflows with a visual editor.
              Connect to your data and deploy in minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-sm mx-auto"
            >
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-black/5 space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  {isSignUp ? "Create an account" : "Sign in"}
                </h3>
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium"
                    onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 pb-24">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Layout, title: "Drag & Drop Builder", desc: "Build forms and pages visually without writing code." },
              { icon: Database, title: "Built-in Database", desc: "Store data securely with our integrated backend." },
              { icon: ShieldCheck, title: "Enterprise Security", desc: "Row-level security ensures users only see their own data." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
