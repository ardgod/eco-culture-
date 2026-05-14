import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";

export default function OrderSuccess() {
  const { id } = useParams();
  const { state } = useLocation();
  const order = state?.order;

  return (
    <section className="container mx-auto px-6 md:px-12 py-24 max-w-2xl text-center" data-testid="order-success-page">
      <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
      <h1 className="text-5xl font-bold mt-6" style={{ fontFamily: "Outfit" }}>¡Pedido confirmado!</h1>
      <p className="text-muted-foreground mt-3">Hemos recibido tu pedido. Te avisaremos cuando salga del huerto.</p>
      <div className="mt-8 bg-card border border-border rounded-3xl p-7 text-left">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Referencia</p>
        <p className="font-mono mt-1" data-testid="order-id">#{id}</p>
        {order && (
          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div><div className="text-muted-foreground text-xs">Total</div><div className="text-primary font-bold text-lg">{order.total.toFixed(2)} €</div></div>
            <div><div className="text-muted-foreground text-xs">Entrega</div><div>{order.delivery_date} · {order.delivery_slot}</div></div>
            <div><div className="text-muted-foreground text-xs">Zona</div><div>{order.delivery_zone}</div></div>
            <div><div className="text-muted-foreground text-xs">Estado</div><div className="capitalize">{order.status}</div></div>
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/catalogo"><Button variant="outline" className="rounded-full border-2 border-primary text-primary hover:bg-primary/10 px-6">Seguir comprando</Button></Link>
        <Link to="/dashboard"><Button className="rounded-full bg-primary hover:bg-primary/90 px-6">Ir al panel</Button></Link>
      </div>
    </section>
  );
}
