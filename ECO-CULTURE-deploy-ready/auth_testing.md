# ECO-CULTURE Auth Testing

## Endpoints
- `POST /api/auth/register` — body `{email, password, name, account_type, company_name?, phone?}`
- `POST /api/auth/login` — body `{email, password}`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

Tokens are issued as httpOnly cookies (`access_token` 12h, `refresh_token` 7d).

## Credentials
- Admin: `admin@ecoculture.es` / `EcoAdmin2026!`
- User:  `cliente@ecoculture.es` / `Cliente2026!`

## Manual smoke
```
curl -c c.txt -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"cliente@ecoculture.es","password":"Cliente2026!"}'
curl -b c.txt $BASE/api/auth/me
```
