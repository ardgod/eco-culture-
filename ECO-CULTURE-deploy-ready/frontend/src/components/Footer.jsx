import { Leaf, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24" data-testid="footer">
      <div className="container mx-auto px-6 md:px-12 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5" />
            <span className="font-bold tracking-tight" style={{fontFamily:'Outfit'}}>ECO-CULTURE</span>
          </div>
          <p className="text-sm text-primary-foreground/80 leading-relaxed">
            Cultivamos hoy, conectamos el mañana. Verduras y hortalizas ecológicas a tu puerta.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] mb-4 opacity-80">Comprar</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/catalogo" className="hover:underline">Catálogo</Link></li>
            <li><Link to="/cestas" className="hover:underline">Cestas estacionales</Link></li>
            <li><Link to="/carrito" className="hover:underline">Mi carrito</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] mb-4 opacity-80">Aprender</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/formacion" className="hover:underline">Formación</Link></li>
            <li><Link to="/huertos" className="hover:underline">Huertos urbanos</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] mb-4 opacity-80">Contacto</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hola@ecoculture.es</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +34 900 123 456</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Polígono Las Quemadas, Calle Simón Carpintero 253, Córdoba</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs opacity-70">
        © {new Date().getFullYear()} ECO-CULTURE · Todos los derechos reservados
      </div>
    </footer>
  );
}
