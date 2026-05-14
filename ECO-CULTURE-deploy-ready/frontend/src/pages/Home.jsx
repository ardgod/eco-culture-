import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Truck, GraduationCap, Building2, Sparkles, BadgePercent } from "lucide-react";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";

const HERO = "https://static.prod-images.emergentagent.com/jobs/b742545c-242c-4342-8b77-a0e69e3cbf92/images/d220ccc8de6ddc9e254885b7f8ba310a13aac9951a969afb9ccbb2198ca4c228.png";
const URBAN = "https://images.unsplash.com/photo-1759692071961-f71efda3691f?w=1200";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  useEffect(() => {
    api.get("/products").then((r) => setFeatured(r.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase font-semibold text-primary mb-6">Verduras · Hortalizas · Ecológico</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-foreground">
              Cultivamos hoy,<br/>
              <span className="text-primary">conectamos</span> el mañana.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Verduras y hortalizas 100% ecológicas, recogidas a primera hora y entregadas en tu puerta. Para particulares y empresas, con descuentos por volumen y un programa de fidelidad que cuida tu bolsillo.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/catalogo" data-testid="cta-shop">
                <Button className="rounded-full bg-primary hover:bg-primary/90 px-8 py-6 text-base">
                  Ver catálogo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/cestas" data-testid="cta-baskets">
                <Button variant="outline" className="rounded-full border-2 border-primary text-primary hover:bg-primary/10 px-8 py-6 text-base">
                  Cestas estacionales
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              <Stat n="100%" l="Ecológico" />
              <Stat n="24h" l="Entrega" />
              <Stat n="+1.5k" l="Familias" />
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden">
              <img src={HERO} alt="Verduras frescas" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-5 shadow-xl max-w-xs hidden md:block">
              <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest font-bold mb-2">
                <Sparkles className="w-4 h-4" /> Fidelidad
              </div>
              <p className="text-sm font-medium">Hasta <span className="text-primary font-bold">25% de descuento</span> combinando volumen y fidelidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios bento */}
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-20">
        <p className="text-xs tracking-[0.25em] uppercase font-semibold text-primary">Qué ofrecemos</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-3 max-w-2xl">Un ecosistema completo alrededor del huerto.</h2>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Feature icon={<Truck className="w-5 h-5" />} title="Reparto a domicilio" desc="Selecciona tu zona y franja. Entregas frescas en menos de 24h." />
          <Feature icon={<BadgePercent className="w-5 h-5" />} title="Descuentos volumen y fidelidad" desc="Hasta 25% combinando compras grandes, fidelidad y cuenta empresa." />
          <Feature icon={<Leaf className="w-5 h-5" />} title="Cestas estacionales" desc="Selecciones del agricultor según la temporada en curso." />
          <Feature icon={<GraduationCap className="w-5 h-5" />} title="Formación en cultivo eco" desc="Catálogo de cursos: huerto, permacultura, semillas y más." />
          <Feature icon={<Building2 className="w-5 h-5" />} title="Huertos urbanos" desc="Registra tu comunidad de vecinos y monta su huerto." />
          <Feature icon={<Sparkles className="w-5 h-5" />} title="B2B empresas" desc="Cuenta empresa con descuentos automáticos y facturación." />
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-20 border-t border-border">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase font-semibold text-primary">Recogido hoy</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-3">Lo más fresco</h2>
          </div>
          <Link to="/catalogo" className="text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all" data-testid="see-all-products">
            Ver todo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => (<ProductCard key={p.id} product={p} />))}
        </div>
      </section>

      {/* Urban gardens */}
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden">
            <img src={URBAN} alt="Huerto urbano comunitario" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs tracking-[0.25em] uppercase font-semibold text-primary">Comunidad</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-3">Huertos urbanos para tu comunidad de vecinos.</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Te ayudamos a registrar, diseñar y mantener un huerto compartido en azoteas, patios o solares. Asesoría técnica, semillas y formación incluidas.
            </p>
            <Link to="/huertos" className="mt-8 inline-block" data-testid="cta-gardens">
              <Button className="rounded-full bg-primary hover:bg-primary/90 px-8 py-6 text-base">
                Registrar mi comunidad <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div>
      <div className="text-3xl font-bold text-primary" style={{ fontFamily: "Outfit" }}>{n}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-7 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">{icon}</div>
      <h3 className="text-xl font-semibold" style={{ fontFamily: "Outfit" }}>{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}
