import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const ZONES = ["Centro", "Norte", "Sur", "Este", "Oeste"];
const SLOTS = ["09:00 - 12:00", "12:00 - 15:00", "16:00 - 19:00", "19:00 - 21:00"];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    delivery_address: "",
    delivery_zone: "Centro",
    delivery_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    delivery_slot: SLOTS[0],
    notes: "",
  });
  const [quote, setQuote] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    api.post("/checkout/quote", { items, ...form }).then((r) => setQuote(r.data));
  }, [items, form, user]);

  if (items.length === 0) {
    return (
      <section className="container mx-auto px-6 py-24 text-center">
        <p>Tu cesta está vacía.</p>
      </section>
    );
  }

  const u = (k) => (e) => setForm({ ...form, [k]: e.target?.value ?? e });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/checkout", { items, ...form });
      clear();
      toast.success("¡Pedido confirmado!");
      navigate(`/pedido/${data.id}`, { state: { order: data } });
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo procesar el pedido");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16" data-testid="checkout-page">
      <h1 className="text-5xl font-bold" style={{ fontFamily: "Outfit" }}>Checkout</h1>
      <p className="text-muted-foreground mt-2 inline-flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Pago simulado para demostración</p>

      <form onSubmit={submit} className="mt-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Entrega a domicilio">
            <Field label="Dirección completa">
              <Input data-testid="co-address" required value={form.delivery_address} onChange={u("delivery_address")} placeholder="Calle, número, piso, puerta" />
            </Field>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Zona">
                <Select value={form.delivery_zone} onValueChange={(v) => setForm({ ...form, delivery_zone: v })}>
                  <SelectTrigger data-testid="co-zone"><SelectValue /></SelectTrigger>
                  <SelectContent>{ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Fecha"><Input data-testid="co-date" type="date" required value={form.delivery_date} onChange={u("delivery_date")} /></Field>
              <Field label="Franja horaria">
                <Select value={form.delivery_slot} onValueChange={(v) => setForm({ ...form, delivery_slot: v })}>
                  <SelectTrigger data-testid="co-slot"><SelectValue /></SelectTrigger>
                  <SelectContent>{SLOTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Notas (opcional)"><Textarea data-testid="co-notes" rows={3} value={form.notes} onChange={u("notes")} /></Field>
          </Section>

          <Section title="Pago">
            <p className="text-sm text-muted-foreground">Pago simulado. No se cobrará nada en esta demostración.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Titular tarjeta"><Input data-testid="co-cardname" defaultValue={user?.name || ""} /></Field>
              <Field label="Número tarjeta"><Input data-testid="co-cardnum" defaultValue="4242 4242 4242 4242" /></Field>
              <Field label="Caducidad"><Input data-testid="co-cardexp" defaultValue="12/29" /></Field>
              <Field label="CVC"><Input data-testid="co-cardcvc" defaultValue="123" /></Field>
            </div>
          </Section>
        </div>

        <aside className="bg-card border border-border rounded-3xl p-6 h-fit sticky top-24">
          <h3 className="font-bold text-xl" style={{ fontFamily: "Outfit" }}>Resumen</h3>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{subtotal.toFixed(2)} €</span></div>
            {quote?.discount_pct > 0 && (
              <div data-testid="discount-row" className="flex justify-between text-primary">
                <span>Descuento ({quote.discount_pct}%)</span>
                <span>−{quote.discount_amount.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span>{quote?.delivery_fee === 0 ? "Gratis" : `${quote?.delivery_fee?.toFixed(2)} €`}</span></div>
            <div className="border-t border-border my-3"></div>
            <div className="flex justify-between text-lg"><span className="font-semibold">Total</span><span data-testid="total-amount" className="font-bold text-primary">{quote?.total?.toFixed(2) ?? subtotal.toFixed(2)} €</span></div>
          </div>
          {quote?.discount_reasons?.length > 0 && (
            <ul className="mt-4 space-y-1 text-xs text-muted-foreground" data-testid="discount-reasons">
              {quote.discount_reasons.map((r, i) => <li key={i}>· {r}</li>)}
            </ul>
          )}
          {!user && <p className="mt-3 text-xs text-accent">Inicia sesión para acumular puntos de fidelidad.</p>}
          <Button type="submit" disabled={submitting} data-testid="confirm-order" className="w-full mt-6 rounded-full bg-primary hover:bg-primary/90 py-6">
            {submitting ? "Procesando…" : "Confirmar pedido"}
          </Button>
        </aside>
      </form>
    </section>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-7 space-y-4">
      <h2 className="text-2xl font-bold" style={{ fontFamily: "Outfit" }}>{title}</h2>
      {children}
    </div>
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
