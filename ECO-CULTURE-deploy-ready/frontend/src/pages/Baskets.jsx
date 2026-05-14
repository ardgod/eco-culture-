import { useEffect, useState } from "react";
import api from "../lib/api";
import { useCart } from "../contexts/CartContext";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Check } from "lucide-react";

export default function Baskets() {
  const [baskets, setBaskets] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    api.get("/baskets").then((r) => setBaskets(r.data));
  }, []);

  const add = (b) => {
    addItem({ product_id: b.id, name: b.name, price: b.price, unit: "ud", image: b.image, kind: "basket" }, 1);
    toast.success(`${b.name} añadida a la cesta`);
  };

  return (
    <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16" data-testid="baskets-page">
      <p className="text-xs tracking-[0.25em] uppercase font-semibold text-primary">De temporada</p>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-3">Cestas estacionales</h1>
      <p className="mt-4 text-muted-foreground max-w-2xl">Cada estación tiene su cesta. Productos seleccionados por nuestros agricultores.</p>

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        {baskets.map((b) => (
          <article key={b.id} data-testid={`basket-${b.season}`} className="bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/30 transition">
            <div className="grid md:grid-cols-2">
              <div className="aspect-[4/3] md:aspect-auto bg-secondary overflow-hidden">
                <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-7">
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-accent">{b.season}</span>
                <h3 className="text-2xl font-bold mt-1" style={{ fontFamily: "Outfit" }}>{b.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{b.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {b.contents.map((c, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-primary" /> {c}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">{b.price.toFixed(2)} €</span>
                  <Button onClick={() => add(b)} data-testid={`add-basket-${b.season}`} className="rounded-full bg-primary hover:bg-primary/90">Añadir</Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
