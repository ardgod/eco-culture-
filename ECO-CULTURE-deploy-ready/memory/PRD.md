# ECO-CULTURE — PRD

## Original Problem Statement
Aplicación para compra de verduras y hortalizas ecológicas, con servicio a particulares y empresas, que ofrezca entre sus servicios un programa de formación en cultivo ecológico, con un sistema de reparto a domicilio, descuentos por compras en grandes cantidades o por fidelidad, ofertas de cesta de productos estacionales, registro de huertos urbanos por comunidades de vecinos. Nombre: ECO-CULTURE.

## User Personas
- **Particular**: hogar comprometido con alimentación ecológica.
- **Empresa**: restaurante / oficina (descuento +8%).
- **Comunidad de vecinos**: registra huerto urbano colectivo.
- **Aprendiz**: se inscribe en cursos de cultivo ecológico.

## Core Requirements (static)
- Catálogo de verduras/hortalizas/frutas/hierbas con filtros categoría + estación.
- Cestas estacionales (4: primavera, verano, otoño, invierno).
- Catálogo de cursos (formación en cultivo eco) con inscripción.
- Reparto a domicilio: dirección, zona, fecha, franja horaria.
- Descuentos por volumen (≥10 u → 5%, ≥20 u → 10%), empresa (+8%), fidelidad (≥200 → 4%, ≥500 → 7%). Cap 25%.
- Envío gratis ≥40€, si no 4,95€.
- Programa de fidelidad: 1 punto = 1€ gastado.
- Registro de huertos urbanos vecinales (con datos de comunidad y superficie).
- Auth JWT email/password (httpOnly cookies), particular vs empresa.
- Checkout simulado.

## Implemented (2026-02)
- Backend FastAPI con Mongo: auth (register/login/me/logout), products (filtros), baskets, courses + enrollments, /me/orders, /me/enrollments, urban-gardens, /checkout/quote y /checkout (con descuentos + fidelidad), seed automático de admin, cliente demo, 12 productos, 4 cestas, 6 cursos.
- Frontend React (rutas: /, /catalogo, /cestas, /formacion, /huertos, /carrito, /checkout, /login, /registro, /dashboard, /pedido/:id). Diseño moderno minimalista con paleta verde bosque + bone white, fuentes Outfit + Manrope, glassmorphism navbar, logo de marca, sonner toasts.
- Tests: 18/18 backend pytest passing, frontend e2e validado por testing agent.

## Backlog
- **P1**: Login social Google (Emergent Auth), enviar emails de confirmación de pedido, panel admin, integración Stripe real.
- **P2**: Tracking pedido en mapa, vídeos de cursos integrados (object storage), gestión de stock por producto, suscripción mensual a cesta.
- **P2**: Lockout brute-force /auth/login, rate-limit, switch cookies a `secure=true; samesite=none`.

## Test Credentials
- Admin: admin@ecoculture.es / EcoAdmin2026!
- Cliente: cliente@ecoculture.es / Cliente2026!
