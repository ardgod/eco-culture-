import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { Award, Package, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      api.get("/me/orders").then((r) => setOrders(r.data));
      api.get("/me/enrollments").then((r) => setEnrollments(r.data));
    }
  }, [user]);

  if (loading || !user) return <div className="container py-20 px-6">Cargando…</div>;

  const tier = user.loyalty_points >= 500 ? "Oro" : user.loyalty_points >= 200 ? "Plata" : "Bronce";

  return (
    <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16" data-testid="dashboard-page">
      <p className="text-xs tracking-[0.25em] uppercase font-semibold text-primary">Mi panel</p>
      <h1 className="text-5xl font-bold tracking-tight mt-3" style={{ fontFamily: "Outfit" }}>Hola, {user.name}</h1>
      <p className="text-muted-foreground mt-2 capitalize">Cuenta {user.account_type} · {user.email}</p>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <Card icon={<Award className="w-5 h-5" />} label="Puntos de fidelidad" value={`${user.loyalty_points}`} sub={`Nivel ${tier}`} testid="kpi-loyalty" />
        <Card icon={<Package className="w-5 h-5" />} label="Pedidos" value={orders.length} sub="histórico" testid="kpi-orders" />
        <Card icon={<GraduationCap className="w-5 h-5" />} label="Cursos inscritos" value={enrollments.length} sub="formación" testid="kpi-courses" />
      </div>

      <div className="mt-12 grid lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-3xl p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Outfit" }}>Mis pedidos</h2>
            <Link to="/catalogo" className="text-primary text-sm font-medium hover:underline">+ Nuevo</Link>
          </div>
          <div className="mt-5 space-y-3" data-testid="orders-list">
            {orders.length === 0 && <p className="text-sm text-muted-foreground">Aún no tienes pedidos.</p>}
            {orders.map((o) => (
              <div key={o.id} className="border border-border rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                  <span className="text-primary font-semibold capitalize">{o.status}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-sm">{new Date(o.created_at).toLocaleDateString("es-ES")} · {o.items.length} items</span>
                  <span className="font-bold text-primary">{o.total.toFixed(2)} €</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Entrega: {o.delivery_date} · {o.delivery_slot} · {o.delivery_zone}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "Outfit" }}>Mis cursos</h2>
            <Link to="/formacion" className="text-primary text-sm font-medium hover:underline">+ Nuevo</Link>
          </div>
          <div className="mt-5 space-y-3" data-testid="enrollments-list">
            {enrollments.length === 0 && <p className="text-sm text-muted-foreground">Sin inscripciones todavía.</p>}
            {enrollments.map((e) => (
              <div key={e.id} className="border border-border rounded-xl p-4 flex justify-between">
                <div>
                  <h4 className="font-semibold">{e.course_title}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(e.enrolled_at).toLocaleDateString("es-ES")}</p>
                </div>
                <span className="text-xs text-primary font-semibold capitalize self-center">{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 bg-primary text-primary-foreground rounded-3xl p-10 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <Sparkles className="w-6 h-6" />
          <h3 className="text-3xl font-bold mt-3" style={{ fontFamily: "Outfit" }}>Sigue cultivando descuentos</h3>
          <p className="text-primary-foreground/80 mt-2">Cada euro gastado = 1 punto. A 200 pts subes a Plata (4% extra), a 500 pts a Oro (7% extra).</p>
        </div>
        <div className="md:text-right">
          <Link to="/catalogo"><Button className="rounded-full bg-background text-primary hover:bg-background/90 px-8 py-6">Comprar ahora</Button></Link>
        </div>
      </div>
    </section>
  );
}

function Card({ icon, label, value, sub, testid }) {
  return (
    <div data-testid={testid} className="bg-card border border-border rounded-2xl p-6">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
      <div className="mt-4 text-3xl font-bold text-primary" style={{ fontFamily: "Outfit" }}>{value}</div>
      <div className="text-sm text-foreground font-medium mt-1">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
