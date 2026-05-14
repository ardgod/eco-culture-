import { useEffect, useState } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Users, Sprout } from "lucide-react";

const empty = {
  community_name: "", address: "", city: "", postal_code: "",
  contact_name: "", contact_email: "", contact_phone: "",
  n_neighbors: 10, surface_m2: 50, description: "",
};

export default function UrbanGardens() {
  const [form, setForm] = useState(empty);
  const [list, setList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get("/urban-gardens").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/urban-gardens", { ...form, n_neighbors: Number(form.n_neighbors), surface_m2: Number(form.surface_m2) });
      toast.success("¡Gracias! Hemos registrado tu comunidad. Te contactaremos en 48h.");
      setForm(empty);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo registrar");
    } finally {
      setSubmitting(false);
    }
  };

  const u = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16" data-testid="gardens-page">
      <p className="text-xs tracking-[0.25em] uppercase font-semibold text-primary">Comunidad</p>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-3">Huertos urbanos vecinales</h1>
      <p className="mt-4 text-muted-foreground max-w-2xl">Registra tu comunidad de vecinos y te ayudamos a montar y mantener un huerto comunitario.</p>

      <div className="mt-12 grid lg:grid-cols-5 gap-10">
        <form onSubmit={submit} data-testid="garden-form" className="lg:col-span-3 bg-card border border-border rounded-3xl p-8 space-y-5">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "Outfit" }}>Datos de la comunidad</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nombre de la comunidad"><Input data-testid="g-community" required value={form.community_name} onChange={u("community_name")} /></Field>
            <Field label="Ciudad"><Input data-testid="g-city" required value={form.city} onChange={u("city")} /></Field>
            <Field label="Dirección"><Input data-testid="g-address" required value={form.address} onChange={u("address")} /></Field>
            <Field label="Código postal"><Input data-testid="g-cp" required value={form.postal_code} onChange={u("postal_code")} /></Field>
            <Field label="Persona de contacto"><Input data-testid="g-name" required value={form.contact_name} onChange={u("contact_name")} /></Field>
            <Field label="Teléfono"><Input data-testid="g-phone" required value={form.contact_phone} onChange={u("contact_phone")} /></Field>
            <Field label="Email"><Input data-testid="g-email" type="email" required value={form.contact_email} onChange={u("contact_email")} /></Field>
            <Field label="Nº de vecinos interesados"><Input data-testid="g-neighbors" type="number" min="1" required value={form.n_neighbors} onChange={u("n_neighbors")} /></Field>
            <Field label="Superficie disponible (m²)"><Input data-testid="g-surface" type="number" min="1" required value={form.surface_m2} onChange={u("surface_m2")} /></Field>
          </div>
          <Field label="Cuéntanos sobre vuestro espacio"><Textarea data-testid="g-desc" rows={4} value={form.description} onChange={u("description")} placeholder="Azotea, patio, terraza, exposición solar…" /></Field>

          <Button type="submit" data-testid="g-submit" disabled={submitting} className="rounded-full bg-primary hover:bg-primary/90 px-8 py-6 text-base">
            {submitting ? "Enviando…" : "Registrar comunidad"}
          </Button>
        </form>

        <aside className="lg:col-span-2 space-y-4">
          <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Comunidades registradas</h3>
          {list.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay comunidades públicas.</p>}
          {list.slice(0, 6).map((g) => (
            <div key={g.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs text-primary uppercase tracking-widest font-semibold">
                <Sprout className="w-3 h-3" /> {g.status?.replace("_", " ")}
              </div>
              <h4 className="font-semibold mt-1" style={{ fontFamily: "Outfit" }}>{g.community_name}</h4>
              <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {g.city}
              </p>
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {g.n_neighbors} vecinos</span>
                <span>·</span>
                <span>{g.surface_m2} m²</span>
              </p>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
