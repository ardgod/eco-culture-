import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Minus, Plus, Trash2, ShoppingBasket } from "lucide-react";

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-24 text-center" data-testid="cart-empty">
        <ShoppingBasket className="w-12 h-12 text-primary mx-auto" />
        <h1 className="text-4xl font-bold mt-6" style={{ fontFamily: "Outfit" }}>Tu cesta está vacía</h1>
        <p className="text-muted-foreground mt-2">Empieza a llenarla con verduras de temporada.</p>
        <Link to="/catalogo" className="inline-block mt-8">
          <Button className="rounded-full bg-primary hover:bg-primary/90 px-8 py-6">Ir al catálogo</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16" data-testid="cart-page">
      <h1 className="text-5xl font-bold" style={{ fontFamily: "Outfit" }}>Tu cesta</h1>

      <div className="mt-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((i) => (
            <div key={`${i.kind}-${i.product_id}`} data-testid={`cart-item-${i.product_id}`} className="bg-card border border-border rounded-2xl p-4 flex gap-4 items-center">
              <img src={i.image} alt={i.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold" style={{ fontFamily: "Outfit" }}>{i.name}</h3>
                <p className="text-sm text-muted-foreground">{i.price.toFixed(2)} € / {i.unit}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(i.product_id, i.kind, Math.max(0, i.quantity - 1))} className="w-8 h-8 rounded-full border border-border hover:bg-secondary flex items-center justify-center" data-testid={`dec-${i.product_id}`}>
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-medium" data-testid={`qty-${i.product_id}`}>{i.quantity}</span>
                <button onClick={() => updateQty(i.product_id, i.kind, i.quantity + 1)} className="w-8 h-8 rounded-full border border-border hover:bg-secondary flex items-center justify-center" data-testid={`inc-${i.product_id}`}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-right w-20">
                <div className="font-bold text-primary">{(i.price * i.quantity).toFixed(2)} €</div>
                <button onClick={() => removeItem(i.product_id, i.kind)} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1 mt-1" data-testid={`remove-${i.product_id}`}>
                  <Trash2 className="w-3 h-3" /> quitar
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-card border border-border rounded-3xl p-6 h-fit sticky top-24">
          <h3 className="font-bold text-xl" style={{ fontFamily: "Outfit" }}>Resumen</h3>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{subtotal.toFixed(2)} €</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span className="text-primary">Calculado en checkout</span></div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Los descuentos por volumen, fidelidad y empresa se aplican en checkout.</p>
          <Link to="/checkout" className="block mt-6">
            <Button data-testid="go-checkout" className="w-full rounded-full bg-primary hover:bg-primary/90 py-6">Ir a checkout</Button>
          </Link>
        </aside>
      </div>
    </section>
  );
}
