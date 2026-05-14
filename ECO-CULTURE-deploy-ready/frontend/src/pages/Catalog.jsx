import { useEffect, useState } from "react";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";

const CATS = [
  { v: "", l: "Todo" },
  { v: "verduras", l: "Verduras" },
  { v: "hortalizas", l: "Hortalizas" },
  { v: "frutas", l: "Frutas" },
  { v: "hierbas", l: "Hierbas" },
];
const SEASONS = [
  { v: "", l: "Cualquier estación" },
  { v: "primavera", l: "Primavera" },
  { v: "verano", l: "Verano" },
  { v: "otono", l: "Otoño" },
  { v: "invierno", l: "Invierno" },
];

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [cat, setCat] = useState("");
  const [season, setSeason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (cat) params.category = cat;
    if (season) params.season = season;
    api.get("/products", { params }).then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, [cat, season]);

  return (
    <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16" data-testid="catalog-page">
      <p className="text-xs tracking-[0.25em] uppercase font-semibold text-primary">Catálogo</p>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-3">Verduras de la huerta</h1>
      <p className="mt-4 text-muted-foreground max-w-2xl">Selecciona por categoría o estación. Todos los productos son ecológicos certificados.</p>

      <div className="mt-10 flex flex-wrap gap-2 items-center">
        <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2">Categoría</span>
        {CATS.map((c) => (
          <button
            key={c.v}
            onClick={() => setCat(c.v)}
            data-testid={`filter-cat-${c.v || "all"}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${cat === c.v ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary"}`}
          >
            {c.l}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2">Estación</span>
        {SEASONS.map((s) => (
          <button
            key={s.v}
            onClick={() => setSeason(s.v)}
            data-testid={`filter-season-${s.v || "all"}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${season === s.v ? "bg-accent text-accent-foreground border-accent" : "bg-background border-border hover:border-accent"}`}
          >
            {s.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-16 text-muted-foreground">Cargando productos…</div>
      ) : (
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
          {products.length === 0 && <p className="text-muted-foreground col-span-full">No hay productos para esta selección.</p>}
        </div>
      )}
    </section>
  );
}
