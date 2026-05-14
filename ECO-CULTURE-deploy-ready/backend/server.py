from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ---------- DB ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"

app = FastAPI(title="ECO-CULTURE API")
api = APIRouter(prefix="/api")


# ---------- Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=43200, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


# ---------- Models ----------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    account_type: Literal["particular", "empresa"] = "particular"
    company_name: Optional[str] = None
    phone: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    category: str  # verduras, hortalizas, frutas, hierbas
    description: str
    price: float  # per kg or unit
    unit: str = "kg"
    image: str
    season: str  # primavera, verano, otoño, invierno, todo
    organic: bool = True
    stock: int = 100


class SeasonalBasket(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    season: str
    description: str
    contents: List[str]
    price: float
    image: str


class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    level: str  # principiante, intermedio, avanzado
    duration_hours: int
    price: float
    description: str
    instructor: str
    image: str
    modules: List[str]


class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: float
    unit: str
    image: Optional[str] = None
    kind: str = "product"  # product | basket | course


class CheckoutIn(BaseModel):
    items: List[CartItem]
    delivery_address: str
    delivery_zone: str
    delivery_date: str
    delivery_slot: str
    notes: Optional[str] = ""


class UrbanGardenIn(BaseModel):
    community_name: str
    address: str
    city: str
    postal_code: str
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    n_neighbors: int
    surface_m2: float
    description: Optional[str] = ""


# ---------- Auth ----------
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Este email ya está registrado")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "account_type": payload.account_type,
        "company_name": payload.company_name,
        "phone": payload.phone,
        "role": "user",
        "loyalty_points": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    set_auth_cookies(response, create_access_token(user_id, email), create_refresh_token(user_id))
    doc.pop("password_hash", None)
    doc.pop("_id", None)
    return doc


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    set_auth_cookies(response, create_access_token(user["id"], email), create_refresh_token(user["id"]))
    user.pop("password_hash", None)
    user.pop("_id", None)
    return user


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ---------- Products ----------
@api.get("/products", response_model=List[Product])
async def list_products(category: Optional[str] = None, season: Optional[str] = None):
    q = {}
    if category:
        q["category"] = category
    if season:
        q["season"] = {"$in": [season, "todo"]}
    items = await db.products.find(q, {"_id": 0}).to_list(500)
    return items


@api.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return p


# ---------- Baskets ----------
@api.get("/baskets", response_model=List[SeasonalBasket])
async def list_baskets():
    items = await db.baskets.find({}, {"_id": 0}).to_list(100)
    return items


# ---------- Courses ----------
@api.get("/courses", response_model=List[Course])
async def list_courses():
    items = await db.courses.find({}, {"_id": 0}).to_list(100)
    return items


@api.post("/courses/{course_id}/enroll")
async def enroll_course(course_id: str, user=Depends(get_current_user)):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    enrollment = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "course_id": course_id,
        "course_title": course["title"],
        "price": course["price"],
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
        "status": "inscrito",
    }
    await db.enrollments.insert_one(enrollment)
    enrollment.pop("_id", None)
    return enrollment


@api.get("/me/enrollments")
async def my_enrollments(user=Depends(get_current_user)):
    items = await db.enrollments.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return items


# ---------- Discounts ----------
def compute_discount(subtotal: float, total_qty: float, account_type: str, loyalty_points: int):
    """Volume + loyalty + business discounts."""
    discount_pct = 0
    reasons = []
    if total_qty >= 20:
        discount_pct += 10
        reasons.append("10% por volumen (≥20 uds/kg)")
    elif total_qty >= 10:
        discount_pct += 5
        reasons.append("5% por volumen (≥10 uds/kg)")
    if account_type == "empresa":
        discount_pct += 8
        reasons.append("8% cuenta empresa")
    if loyalty_points >= 500:
        discount_pct += 7
        reasons.append("7% fidelidad oro (≥500 pts)")
    elif loyalty_points >= 200:
        discount_pct += 4
        reasons.append("4% fidelidad plata (≥200 pts)")
    discount_pct = min(discount_pct, 25)
    discount_amount = round(subtotal * discount_pct / 100, 2)
    return discount_pct, discount_amount, reasons


@api.post("/checkout/quote")
async def checkout_quote(payload: CheckoutIn, request: Request):
    subtotal = round(sum(i.price * i.quantity for i in payload.items), 2)
    qty = sum(i.quantity for i in payload.items)
    account_type = "particular"
    loyalty = 0
    try:
        user = await get_current_user(request)
        account_type = user.get("account_type", "particular")
        loyalty = user.get("loyalty_points", 0)
    except HTTPException:
        pass
    pct, amount, reasons = compute_discount(subtotal, qty, account_type, loyalty)
    delivery_fee = 0 if subtotal >= 40 else 4.95
    total = round(subtotal - amount + delivery_fee, 2)
    return {
        "subtotal": subtotal,
        "discount_pct": pct,
        "discount_amount": amount,
        "discount_reasons": reasons,
        "delivery_fee": delivery_fee,
        "total": total,
    }


@api.post("/checkout")
async def checkout(payload: CheckoutIn, request: Request):
    user = None
    try:
        user = await get_current_user(request)
    except HTTPException:
        pass
    subtotal = round(sum(i.price * i.quantity for i in payload.items), 2)
    qty = sum(i.quantity for i in payload.items)
    account_type = user.get("account_type", "particular") if user else "particular"
    loyalty = user.get("loyalty_points", 0) if user else 0
    pct, amount, reasons = compute_discount(subtotal, qty, account_type, loyalty)
    delivery_fee = 0 if subtotal >= 40 else 4.95
    total = round(subtotal - amount + delivery_fee, 2)

    order = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"] if user else None,
        "items": [i.model_dump() for i in payload.items],
        "delivery_address": payload.delivery_address,
        "delivery_zone": payload.delivery_zone,
        "delivery_date": payload.delivery_date,
        "delivery_slot": payload.delivery_slot,
        "notes": payload.notes,
        "subtotal": subtotal,
        "discount_pct": pct,
        "discount_amount": amount,
        "discount_reasons": reasons,
        "delivery_fee": delivery_fee,
        "total": total,
        "status": "confirmado",
        "payment_status": "simulado",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(order)

    # Loyalty: 1 punto por cada 1€ gastado
    if user:
        await db.users.update_one(
            {"id": user["id"]},
            {"$inc": {"loyalty_points": int(total)}},
        )
    order.pop("_id", None)
    return order


@api.get("/me/orders")
async def my_orders(user=Depends(get_current_user)):
    items = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items


# ---------- Urban Gardens ----------
@api.post("/urban-gardens")
async def register_urban_garden(payload: UrbanGardenIn, request: Request):
    user_id = None
    try:
        user = await get_current_user(request)
        user_id = user["id"]
    except HTTPException:
        pass
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["user_id"] = user_id
    doc["status"] = "pendiente_revision"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.urban_gardens.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/urban-gardens")
async def list_urban_gardens():
    items = await db.urban_gardens.find({}, {"_id": 0, "contact_email": 0, "contact_phone": 0}).sort(
        "created_at", -1
    ).to_list(200)
    return items


@api.get("/")
async def root():
    return {"app": "ECO-CULTURE", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ecoculture")


# ---------- Seed ----------
SEED_PRODUCTS = [
    {"name": "Tomate Raf ecológico", "slug": "tomate-raf", "category": "hortalizas", "description": "Tomate raf de cultivo ecológico, sabor intenso, ideal para ensaladas.", "price": 5.90, "unit": "kg", "image": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600", "season": "verano"},
    {"name": "Lechuga romana", "slug": "lechuga-romana", "category": "verduras", "description": "Lechuga romana fresca, hojas crujientes recogidas a primera hora.", "price": 1.80, "unit": "ud", "image": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600", "season": "todo"},
    {"name": "Zanahoria morada", "slug": "zanahoria-morada", "category": "hortalizas", "description": "Variedad ancestral, dulce y rica en antioxidantes.", "price": 2.40, "unit": "kg", "image": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600", "season": "otono"},
    {"name": "Calabacín verde", "slug": "calabacin-verde", "category": "hortalizas", "description": "Calabacín tierno, perfecto para cremas y salteados.", "price": 1.95, "unit": "kg", "image": "https://images.unsplash.com/photo-1596496181871-9681eacf9764?w=600", "season": "verano"},
    {"name": "Espinaca baby", "slug": "espinaca-baby", "category": "verduras", "description": "Hoja tierna baby ideal para ensaladas y batidos.", "price": 3.20, "unit": "kg", "image": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600", "season": "primavera"},
    {"name": "Pimiento rojo", "slug": "pimiento-rojo", "category": "hortalizas", "description": "Pimiento rojo carnoso de huerta local.", "price": 3.50, "unit": "kg", "image": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600", "season": "verano"},
    {"name": "Manzana Reineta", "slug": "manzana-reineta", "category": "frutas", "description": "Manzana reineta de la sierra, ácida y aromática.", "price": 2.80, "unit": "kg", "image": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600", "season": "otono"},
    {"name": "Albahaca fresca", "slug": "albahaca-fresca", "category": "hierbas", "description": "Manojo de albahaca recién cortada, aroma intenso.", "price": 1.50, "unit": "ud", "image": "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=600", "season": "todo"},
    {"name": "Brócoli verde", "slug": "brocoli-verde", "category": "verduras", "description": "Brócoli denso y crujiente, recogido en su punto.", "price": 2.95, "unit": "kg", "image": "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=600", "season": "invierno"},
    {"name": "Pepino holandés", "slug": "pepino-holandes", "category": "hortalizas", "description": "Pepino largo, piel fina y sabor suave.", "price": 1.60, "unit": "ud", "image": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=600", "season": "verano"},
    {"name": "Cebolla morada", "slug": "cebolla-morada", "category": "hortalizas", "description": "Cebolla morada dulce, ideal para ensaladas frescas.", "price": 1.90, "unit": "kg", "image": "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=600", "season": "todo"},
    {"name": "Acelga arcoiris", "slug": "acelga-arcoiris", "category": "verduras", "description": "Variedad multicolor, alta en fibra y minerales.", "price": 2.60, "unit": "kg", "image": "https://images.unsplash.com/photo-1576181256399-834e3b3a49bf?w=600", "season": "invierno"},
]

SEED_BASKETS = [
    {"name": "Cesta Primavera Verde", "season": "primavera", "description": "Selección de brotes tiernos y hortalizas de temporada.", "contents": ["Espinaca baby 500g", "Lechuga romana 2 ud", "Rabanitos 1 manojo", "Acelga arcoiris 600g", "Albahaca fresca", "Fresas 500g"], "price": 24.90, "image": "https://static.prod-images.emergentagent.com/jobs/b742545c-242c-4342-8b77-a0e69e3cbf92/images/be19d7eaf066b18e07c61105ab54ad8b23d8bd853cd5a2f8735e53c65ec13638.png"},
    {"name": "Cesta Verano Mediterráneo", "season": "verano", "description": "Lo mejor del huerto en pleno verano.", "contents": ["Tomate raf 1.5 kg", "Pimiento rojo 800g", "Calabacín 1 kg", "Pepino 3 ud", "Albahaca fresca", "Sandía 1 ud"], "price": 28.50, "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"},
    {"name": "Cesta Otoño Raíces", "season": "otono", "description": "Productos de raíz y frutas de otoño.", "contents": ["Zanahoria morada 1 kg", "Calabaza 1.5 kg", "Manzana Reineta 1 kg", "Cebolla morada 800g", "Nueces 250g", "Setas variadas 400g"], "price": 26.00, "image": "https://images.unsplash.com/photo-1571689936114-b16146c9570a?w=800"},
    {"name": "Cesta Invierno Cálido", "season": "invierno", "description": "Cocido y guisos con sabor a tradición.", "contents": ["Brócoli 800g", "Acelga 1 kg", "Coliflor 1 ud", "Puerro 500g", "Naranjas 2 kg", "Patata violeta 1 kg"], "price": 25.40, "image": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800"},
]

SEED_COURSES = [
    {"title": "Iniciación al huerto ecológico", "level": "principiante", "duration_hours": 12, "price": 89.00, "description": "Aprende los fundamentos del cultivo ecológico desde cero. Compostaje, rotaciones y siembra básica.", "instructor": "Lucía Ferrer", "image": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800", "modules": ["Suelo vivo y compost", "Planificación del huerto", "Siembra y semilleros", "Riego eficiente"]},
    {"title": "Control biológico de plagas", "level": "intermedio", "duration_hours": 8, "price": 69.00, "description": "Maneja plagas sin químicos: insectos auxiliares, trampas y plantas aromáticas aliadas.", "instructor": "Marc Gispert", "image": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800", "modules": ["Identificación de plagas", "Insectos beneficiosos", "Preparados naturales", "Plantas trampa"]},
    {"title": "Permacultura urbana", "level": "intermedio", "duration_hours": 16, "price": 129.00, "description": "Diseña sistemas productivos en azoteas, balcones y patios comunitarios.", "instructor": "Inés Vallcorba", "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800", "modules": ["Principios de permacultura", "Diseño de espacios", "Recogida de aguas", "Comunidad y huertos vecinales"]},
    {"title": "Semillas y biodiversidad", "level": "avanzado", "duration_hours": 10, "price": 99.00, "description": "Recupera variedades locales, técnicas de extracción y banco de semillas comunitario.", "instructor": "Pau Domingo", "image": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800", "modules": ["Selección genética", "Extracción y secado", "Conservación", "Intercambio de semillas"]},
    {"title": "Cocina de la huerta", "level": "principiante", "duration_hours": 6, "price": 55.00, "description": "Saca el máximo partido a tu cosecha: fermentados, conservas y recetas estacionales.", "instructor": "Sara Codina", "image": "https://images.unsplash.com/photo-1547592180-85f173990554?w=800", "modules": ["Lacto-fermentación", "Conservas en vinagre", "Deshidratado", "Recetas de temporada"]},
    {"title": "Huerto educativo en escuelas", "level": "intermedio", "duration_hours": 8, "price": 75.00, "description": "Crea y dinamiza huertos pedagógicos para colegios y AMPAs.", "instructor": "Daniel Rius", "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800", "modules": ["Diseño pedagógico", "Actividades por edades", "Calendario escolar", "Implicación familiar"]},
]


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@ecoculture.es").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "EcoAdmin2026!")
    if not await db.users.find_one({"email": admin_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrador",
            "account_type": "particular",
            "role": "admin",
            "loyalty_points": 1000,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Seed test user
    test_email = "cliente@ecoculture.es"
    if not await db.users.find_one({"email": test_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": test_email,
            "password_hash": hash_password("Cliente2026!"),
            "name": "María García",
            "account_type": "particular",
            "role": "user",
            "loyalty_points": 250,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    # Seed products
    if await db.products.count_documents({}) == 0:
        for p in SEED_PRODUCTS:
            await db.products.insert_one({**p, "id": str(uuid.uuid4()), "organic": True, "stock": 100})

    if await db.baskets.count_documents({}) == 0:
        for b in SEED_BASKETS:
            await db.baskets.insert_one({**b, "id": str(uuid.uuid4())})

    if await db.courses.count_documents({}) == 0:
        for c in SEED_COURSES:
            await db.courses.insert_one({**c, "id": str(uuid.uuid4())})

    logger.info("ECO-CULTURE backend ready")


@app.on_event("shutdown")
async def shutdown():
    client.close()
