import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Clock, GraduationCap, User } from "lucide-react";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { api.get("/courses").then((r) => setCourses(r.data)); }, []);

  const enroll = async (id, title) => {
    if (!user) {
      toast.error("Inicia sesión para inscribirte");
      navigate("/login");
      return;
    }
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success(`Inscrito en "${title}"`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo inscribir");
    }
  };

  return (
    <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16" data-testid="courses-page">
      <p className="text-xs tracking-[0.25em] uppercase font-semibold text-primary">Formación</p>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-3">Aprende cultivo ecológico</h1>
      <p className="mt-4 text-muted-foreground max-w-2xl">Cursos online y presenciales impartidos por agricultores y técnicos certificados.</p>

      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <article key={c.id} data-testid={`course-${c.id}`} className="bg-card rounded-2xl border border-border overflow-hidden hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 flex flex-col">
            <div className="aspect-video bg-secondary overflow-hidden">
              <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="capitalize bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{c.level}</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{c.duration_hours}h</span>
              </div>
              <h3 className="font-bold text-xl mt-3" style={{ fontFamily: "Outfit" }}>{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" /> {c.instructor}
              </div>
              <ul className="mt-3 space-y-1">
                {c.modules.slice(0, 3).map((m, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <GraduationCap className="w-3 h-3 mt-0.5 text-primary" /> {m}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5 flex items-center justify-between border-t border-border mt-5">
                <span className="text-2xl font-bold text-primary">{c.price.toFixed(0)} €</span>
                <Button onClick={() => enroll(c.id, c.title)} data-testid={`enroll-${c.id}`} className="rounded-full bg-primary hover:bg-primary/90">Inscribirme</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
