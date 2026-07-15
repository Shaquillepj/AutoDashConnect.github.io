import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Wrench, ArrowRight, Zap, Eye, EyeOff } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const labelClass = "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold";

const inputClass = [
  "h-11 rounded-xl bg-surface-raised border-0",
  "text-foreground placeholder:text-muted-foreground",
  "focus-visible:ring-2 focus-visible:ring-electric/30 focus-visible:ring-offset-0",
  "transition-all duration-150",
].join(" ");

export default function Welcome() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "", password: "", firstName: "", lastName: "", phone: "", role: "customer"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const { login } = useUser();
  const { toast } = useToast();

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setRegisterData(prev => ({ ...prev, role }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', loginData);
      const data = await response.json();
      login(data.user);
      toast({ title: "Welcome back." });
    } catch {
      toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/register', registerData);
      const data = await response.json();
      login(data.user);
      toast({ title: "Welcome to AutoDash Connect." });
    } catch {
      toast({ title: "Registration failed", description: "Please check your information.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Auth screen ─────────────────────────────────────────────────────── */
  if (selectedRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Back / branding */}
          <button type="button" onClick={() => setSelectedRole(null)} className="flex items-center gap-2 mb-8 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(204 70% 53% / 0.1)" }}>
              <Zap className="w-4 h-4 text-electric" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">
              Auto<span className="text-electric">Dash</span>
              <span className="font-light text-muted-foreground"> Connect</span>
            </span>
          </button>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            {tab === "login" ? "Sign in" : "Create account"}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {selectedRole === 'customer' ? 'Find auto services near you' : 'Manage your service business'}
          </p>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "var(--surface-raised)" }}>
            {(["login", "register"] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                aria-current={tab === t ? "true" : undefined}
                className={[
                  "flex-1 py-2 text-sm font-semibold rounded-lg border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50",
                  tab === t
                    ? "bg-surface dark:bg-surface-overlay text-foreground border-border shadow-sm"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                ].join(" ")}>
                {t === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div className="space-y-1.5">
                <Label htmlFor="email" className={labelClass}>Email</Label>
                <Input id="email" type="email" value={loginData.email}
                  onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                  className={inputClass} placeholder="you@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className={labelClass}>Password</Label>
                <div className="relative">
                  <Input id="password" type={showLoginPassword ? "text" : "password"} value={loginData.password}
                    onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                    className={`${inputClass} pr-11`} placeholder="••••••••" required />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(v => !v)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50 rounded-xl"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading}
                className="w-full h-11 bg-electric text-white hover:bg-electric-dim font-semibold text-sm mt-2 rounded-xl"
                style={{ boxShadow: isLoading ? 'none' : 'var(--shadow-glow)' }}>
                {isLoading
                  ? "Signing in…"
                  : <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>}
              </Button>
            </form>
          )}

          {/* Register form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className={labelClass}>First name</Label>
                  <Input id="firstName" value={registerData.firstName}
                    onChange={e => setRegisterData(p => ({ ...p, firstName: e.target.value }))}
                    className={inputClass} placeholder="Jane" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className={labelClass}>Last name</Label>
                  <Input id="lastName" value={registerData.lastName}
                    onChange={e => setRegisterData(p => ({ ...p, lastName: e.target.value }))}
                    className={inputClass} placeholder="Smith" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="regEmail" className={labelClass}>Email</Label>
                <Input id="regEmail" type="email" value={registerData.email}
                  onChange={e => setRegisterData(p => ({ ...p, email: e.target.value }))}
                  className={inputClass} placeholder="you@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className={labelClass}>
                  Phone <span className="normal-case tracking-normal text-muted-foreground/60">(optional)</span>
                </Label>
                <Input id="phone" type="tel" value={registerData.phone}
                  onChange={e => setRegisterData(p => ({ ...p, phone: e.target.value }))}
                  className={inputClass} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="regPassword" className={labelClass}>Password</Label>
                <div className="relative">
                  <Input id="regPassword" type={showRegisterPassword ? "text" : "password"} value={registerData.password}
                    onChange={e => setRegisterData(p => ({ ...p, password: e.target.value }))}
                    className={`${inputClass} pr-11`} placeholder="••••••••" required />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(v => !v)}
                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50 rounded-xl"
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading}
                className="w-full h-11 bg-electric text-white hover:bg-electric-dim font-semibold text-sm mt-2 rounded-xl"
                style={{ boxShadow: isLoading ? 'none' : 'var(--shadow-glow)' }}>
                {isLoading
                  ? "Creating account…"
                  : <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>}
              </Button>
            </form>
          )}

          <button type="button" onClick={() => setSelectedRole(null)}
            className="mt-8 text-xs text-muted-foreground hover:text-foreground transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50">
            ← Back to role selection
          </button>
        </div>
      </div>
    );
  }

  /* ── Landing screen ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full animate-fade-in">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
            style={{ background: "hsl(204 70% 53% / 0.1)", border: "1px solid hsl(204 70% 53% / 0.2)" }}>
            <Zap className="w-7 h-7 text-electric" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3 whitespace-nowrap">
            Auto<span className="text-electric">Dash</span>
            <span className="font-light text-muted-foreground"> Connect</span>
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-xs mx-auto">
            On-demand roadside assistance &amp; mobile auto services
          </p>
        </div>

        {/* Role cards — grey tile style */}
        <div className="space-y-3">
          {[
            { role: 'customer', icon: User,   title: 'I need help',        sub: 'Request roadside or auto services' },
            { role: 'provider', icon: Wrench, title: 'I provide services', sub: 'Grow your mobile service business'  },
          ].map(({ role, icon: Icon, title, sub }) => (
            <button key={role} type="button" onClick={() => handleRoleSelect(role)}
              className="w-full group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 bg-surface-raised hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50"
              style={{ boxShadow: "var(--shadow-xs)" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-xs)')}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "hsl(204 70% 53% / 0.1)", border: "1px solid hsl(204 70% 53% / 0.2)" }}>
                  <Icon className="w-5 h-5 text-electric" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm leading-none mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-electric group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Trusted by drivers and service professionals nationwide
        </p>
      </div>
    </div>
  );
}
