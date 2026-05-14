import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { formatError } from "../lib/api";
import { Leaf } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(formatError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-6 md:px-12 py-20 max-w-md" data-testid="login-page">
      <div className="flex items-center gap-2 text-primary mb-8 justify-center">
        <Leaf className="w-5 h-5" /> <span className="text-xs uppercase tracking-[0.25em] font-semibold">Acceso clientes</span>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-center" style={{ fontFamily: "Outfit" }}>Bienvenido de vuelta</h1>
      <p className="text-center text-muted-foreground mt-3">Entra para ver tus pedidos, cursos y huerto.</p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
          <Input data-testid="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Contraseña</Label>
          <Input data-testid="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p data-testid="login-error" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} data-testid="login-submit" className="w-full rounded-full bg-primary hover:bg-primary/90 py-6">
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        ¿Aún no tienes cuenta? <Link to="/registro" className="text-primary font-semibold hover:underline">Regístrate</Link>
      </p>
      <div className="mt-6 p-4 rounded-xl bg-secondary text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Cuenta demo</p>
        cliente@ecoculture.es / Cliente2026!
      </div>
    </section>
  );
}
