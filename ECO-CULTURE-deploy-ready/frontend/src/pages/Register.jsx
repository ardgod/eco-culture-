import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { formatError } from "../lib/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", account_type: "particular", company_name: "", phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const u = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(formatError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-6 md:px-12 py-20 max-w-xl" data-testid="register-page">
      <h1 className="text-4xl font-bold tracking-tight text-center" style={{ fontFamily: "Outfit" }}>Crear cuenta</h1>
      <p className="text-center text-muted-foreground mt-3">Únete a la comunidad ECO-CULTURE.</p>

      <div className="mt-8 grid grid-cols-2 gap-2 p-1 rounded-full bg-secondary max-w-sm mx-auto">
        {["particular", "empresa"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm({ ...form, account_type: t })}
            data-testid={`register-type-${t}`}
            className={`py-2 rounded-full text-sm font-medium capitalize transition ${form.account_type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nombre</Label>
            <Input data-testid="reg-name" required value={form.name} onChange={u("name")} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Teléfono</Label>
            <Input data-testid="reg-phone" value={form.phone} onChange={u("phone")} />
          </div>
          {form.account_type === "empresa" && (
            <div className="md:col-span-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nombre empresa</Label>
              <Input data-testid="reg-company" value={form.company_name} onChange={u("company_name")} />
            </div>
          )}
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input data-testid="reg-email" type="email" required value={form.email} onChange={u("email")} />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Contraseña (mín. 6)</Label>
            <Input data-testid="reg-password" type="password" minLength={6} required value={form.password} onChange={u("password")} />
          </div>
        </div>
        {error && <p data-testid="register-error" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} data-testid="register-submit" className="w-full rounded-full bg-primary hover:bg-primary/90 py-6">
          {loading ? "Creando…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        ¿Ya tienes cuenta? <Link to="/login" className="text-primary font-semibold hover:underline">Entra</Link>
      </p>
    </section>
  );
}
