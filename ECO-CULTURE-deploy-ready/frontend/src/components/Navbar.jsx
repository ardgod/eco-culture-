import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBasket, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

const LOGO = "https://customer-assets.emergentagent.com/job_eco-culture/artifacts/firkcoif_LOGOTIPO.png";

const links = [
  { to: "/catalogo", label: "Catálogo" },
  { to: "/cestas", label: "Cestas" },
  { to: "/formacion", label: "Formación" },
  { to: "/huertos", label: "Huertos urbanos" },
];

export default function Navbar() {
  const { totalQty } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-border/40">
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12 py-3">
        <Link to="/" className="flex items-center gap-3" data-testid="brand-logo-link">
          <img src={LOGO} alt="ECO-CULTURE" className="h-12 w-12 object-contain" />
          <div className="leading-tight hidden sm:block">
            <div className="font-bold text-primary tracking-tight" style={{fontFamily:'Outfit'}}>ECO-CULTURE</div>
            <div className="text-[10px] text-muted-foreground tracking-[0.18em] uppercase">Cultivamos hoy</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.to.slice(1)}`}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-foreground/70 hover:text-primary"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/carrito" className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition" data-testid="cart-link">
            <ShoppingBasket className="w-5 h-5 text-primary" />
            {totalQty > 0 && (
              <span data-testid="cart-badge" className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {Math.round(totalQty)}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline" data-testid="dashboard-link">
                <User className="w-4 h-4" /> {user.name?.split(" ")[0]}
              </Link>
              <Button variant="ghost" size="icon" onClick={async ()=>{ await logout(); navigate("/"); }} data-testid="logout-btn">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium hover:text-primary" data-testid="login-link">Entrar</Link>
              <Link to="/registro" data-testid="register-link">
                <Button className="rounded-full bg-primary hover:bg-primary/90 px-5">Crear cuenta</Button>
              </Link>
            </div>
          )}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 px-6 py-4 space-y-3" data-testid="mobile-menu">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-medium" data-testid={`mobile-nav-${l.to.slice(1)}`}>
              {l.label}
            </Link>
          ))}
          {!user ? (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2 border rounded-full text-sm">Entrar</Link>
              <Link to="/registro" onClick={() => setOpen(false)} className="flex-1 text-center py-2 bg-primary text-white rounded-full text-sm">Crear cuenta</Link>
            </div>
          ) : (
            <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-primary">Mi panel</Link>
          )}
        </div>
      )}
    </header>
  );
}
