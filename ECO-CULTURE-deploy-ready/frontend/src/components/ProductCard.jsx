import { Plus } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { toast } from "sonner";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const handleAdd = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
      kind: "product",
    }, 1);
    toast.success(`${product.name} añadido a la cesta`);
  };
  return (
    <article
      data-testid={`product-card-${product.slug}`}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full">
          Eco
        </span>
        <span className="absolute top-3 right-3 bg-background/90 text-foreground text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full capitalize">
          {product.season}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
        <h3 className="font-semibold text-lg mt-1" style={{ fontFamily: "Outfit" }}>{product.name}</h3>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-xl text-primary">{product.price.toFixed(2)} €</span>
            <span className="text-xs text-muted-foreground"> / {product.unit}</span>
          </div>
          <button
            onClick={handleAdd}
            data-testid={`add-to-cart-${product.slug}`}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition"
            aria-label="Añadir a la cesta"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
