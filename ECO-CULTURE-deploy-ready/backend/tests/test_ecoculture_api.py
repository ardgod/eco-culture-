import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://eco-culture.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

CLIENT_EMAIL = "cliente@ecoculture.es"
CLIENT_PASSWORD = "Cliente2026!"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def auth_session():
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": CLIENT_EMAIL, "password": CLIENT_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return sess


# Public listing
def test_products_list(s):
    r = s.get(f"{API}/products", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) > 0
    assert {"name", "slug", "category", "price"} <= set(data[0].keys())


def test_products_filter_category(s):
    r = s.get(f"{API}/products", params={"category": "hortalizas"}, timeout=15)
    assert r.status_code == 200
    assert all(p["category"] == "hortalizas" for p in r.json())


def test_products_filter_season(s):
    r = s.get(f"{API}/products", params={"season": "verano"}, timeout=15)
    assert r.status_code == 200
    seasons = {p["season"] for p in r.json()}
    assert seasons.issubset({"verano", "todo"})


def test_baskets_list(s):
    r = s.get(f"{API}/baskets", timeout=15)
    assert r.status_code == 200 and len(r.json()) >= 4


def test_courses_list(s):
    r = s.get(f"{API}/courses", timeout=15)
    assert r.status_code == 200 and len(r.json()) >= 4


# Auth flow: register -> me -> logout
def test_register_login_me_logout():
    sess = requests.Session()
    email = f"test_{uuid.uuid4().hex[:8]}@ecoculture.es"
    r = sess.post(f"{API}/auth/register", json={
        "email": email, "password": "TestPass2026!", "name": "Test User",
        "account_type": "particular"
    }, timeout=15)
    assert r.status_code == 200, r.text
    assert "access_token" in sess.cookies
    me = sess.get(f"{API}/auth/me", timeout=15)
    assert me.status_code == 200 and me.json()["email"] == email
    assert "password_hash" not in me.json()
    out = sess.post(f"{API}/auth/logout", timeout=15)
    assert out.status_code == 200
    me2 = sess.get(f"{API}/auth/me", timeout=15)
    assert me2.status_code == 401


def test_register_empresa():
    sess = requests.Session()
    email = f"emp_{uuid.uuid4().hex[:8]}@ecoculture.es"
    r = sess.post(f"{API}/auth/register", json={
        "email": email, "password": "TestPass2026!", "name": "Emp",
        "account_type": "empresa", "company_name": "ACME SL"
    }, timeout=15)
    assert r.status_code == 200
    assert r.json()["account_type"] == "empresa"


def test_login_seed_user(auth_session):
    r = auth_session.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == CLIENT_EMAIL
    assert data["loyalty_points"] >= 250


def test_login_invalid():
    r = requests.post(f"{API}/auth/login", json={"email": CLIENT_EMAIL, "password": "wrong"}, timeout=15)
    assert r.status_code == 401


# Course enrollment
def test_enroll_course(auth_session):
    courses = requests.get(f"{API}/courses", timeout=15).json()
    cid = courses[0]["id"]
    r = auth_session.post(f"{API}/courses/{cid}/enroll", timeout=15)
    assert r.status_code == 200
    assert r.json()["course_id"] == cid
    enr = auth_session.get(f"{API}/me/enrollments", timeout=15)
    assert enr.status_code == 200
    assert any(e["course_id"] == cid for e in enr.json())


def test_enroll_requires_auth():
    courses = requests.get(f"{API}/courses", timeout=15).json()
    r = requests.post(f"{API}/courses/{courses[0]['id']}/enroll", timeout=15)
    assert r.status_code == 401


# Discount logic via /checkout/quote
def _items(qty, price=5.0):
    return [{"product_id": "p1", "name": "Tomate", "price": price, "quantity": qty, "unit": "kg", "kind": "product"}]


def _payload(items):
    return {"items": items, "delivery_address": "C/ Mayor 1", "delivery_zone": "Madrid",
            "delivery_date": "2026-02-01", "delivery_slot": "10-12", "notes": ""}


def test_quote_no_discount_anon():
    r = requests.post(f"{API}/checkout/quote", json=_payload(_items(2)), timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j["subtotal"] == 10.0
    assert j["discount_pct"] == 0
    assert j["delivery_fee"] == 4.95


def test_quote_volume_10_anon():
    r = requests.post(f"{API}/checkout/quote", json=_payload(_items(10)), timeout=15)
    j = r.json()
    assert j["discount_pct"] == 5
    assert j["delivery_fee"] == 0  # subtotal=50


def test_quote_volume_20_anon():
    r = requests.post(f"{API}/checkout/quote", json=_payload(_items(20, 2.0)), timeout=15)
    j = r.json()
    assert j["discount_pct"] == 10


def test_quote_loyalty_silver(auth_session):
    # cliente has 250 loyalty -> +4%, qty 2 -> no volume
    r = auth_session.post(f"{API}/checkout/quote", json=_payload(_items(2)), timeout=15)
    j = r.json()
    assert j["discount_pct"] == 4


def test_quote_empresa_combined():
    sess = requests.Session()
    email = f"emp2_{uuid.uuid4().hex[:8]}@ecoculture.es"
    sess.post(f"{API}/auth/register", json={
        "email": email, "password": "TestPass2026!", "name": "E", "account_type": "empresa"
    }, timeout=15)
    # qty 10 -> 5% + empresa 8% = 13%
    r = sess.post(f"{API}/checkout/quote", json=_payload(_items(10)), timeout=15)
    j = r.json()
    assert j["discount_pct"] == 13


# Checkout creates order, increments loyalty
def test_checkout_creates_order(auth_session):
    me_before = auth_session.get(f"{API}/auth/me", timeout=15).json()
    pts_before = me_before["loyalty_points"]
    r = auth_session.post(f"{API}/checkout", json=_payload(_items(2, 10.0)), timeout=15)
    assert r.status_code == 200
    order = r.json()
    assert order["status"] == "confirmado"
    assert order["payment_status"] == "simulado"
    order_id = order["id"]
    total = order["total"]
    # Verify in /me/orders
    orders = auth_session.get(f"{API}/me/orders", timeout=15).json()
    assert any(o["id"] == order_id for o in orders)
    # Verify loyalty incremented
    me_after = auth_session.get(f"{API}/auth/me", timeout=15).json()
    assert me_after["loyalty_points"] == pts_before + int(total)


# Urban gardens
def test_urban_garden_register_and_list_no_leak():
    payload = {
        "community_name": f"TEST_Comunidad {uuid.uuid4().hex[:6]}",
        "address": "C/ Olivo 5", "city": "Valencia", "postal_code": "46001",
        "contact_name": "Ana", "contact_email": "ana@example.com",
        "contact_phone": "600111222", "n_neighbors": 12, "surface_m2": 80.5,
        "description": "Patio comunitario"
    }
    r = requests.post(f"{API}/urban-gardens", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    gid = r.json()["id"]
    lst = requests.get(f"{API}/urban-gardens", timeout=15).json()
    found = next((g for g in lst if g["id"] == gid), None)
    assert found is not None
    assert "contact_email" not in found
    assert "contact_phone" not in found
