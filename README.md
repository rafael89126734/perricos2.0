# 🐾 Perricos — Tienda de mascotas (Full-Stack)

Tienda completa con catálogo, carrito, sugerencias y **panel de administrador** con CRUD de
productos/categorías, registro de ventas y **analíticas por día, semana, mes y año**.

- **Frontend:** React 18 + Vite + Tailwind CSS 3 + Recharts (gráficas) + lucide-react
- **Backend:** Node.js + Express + PostgreSQL (driver `pg`)
- **Auth:** JWT (Bearer) + bcrypt
- **Imágenes:** se suben a `server/uploads/` y se sirven estático

```
perricos-app/
├── package.json          # scripts raíz (install:all, dev, build, start)
├── client/               # React + Vite  (puerto 5173 en dev)
│   └── src/
│       ├── api.js                    # cliente HTTP con JWT
│       ├── components/ Tienda.jsx, Carrito.jsx, Sugerencias.jsx
│       └── components/admin/ Dashboard, ProductosTab, AnaliticasTab,
│                             CategoriasTab, VentasTab, SugerenciasTab, CuentaTab
└── server/               # Express API (puerto 4000)
    ├── database/ schema.sql + seed.sql
    ├── src/routes/ auth, categorias, productos, ventas, sugerencias, analiticas
    └── uploads/          # imágenes subidas (servidas en /uploads)
```

---

## 1) Requisitos

- **Node.js 18+** (recomendado 20) → https://nodejs.org
- **PostgreSQL 14+** instalado y corriendo → https://www.postgresql.org/download/windows/
  - Durante la instalación guarda la contraseña del usuario `postgres`.
- **Visual Studio Code** → https://code.visualstudio.com

## 2) Crear la base de datos

Abre **pgAdmin** (o una terminal con `psql`) y ejecuta:

```sql
CREATE DATABASE perricos;
```

Luego, desde la carpeta del proyecto:

```bash
cd perricos-app/server
npm run db:init     # aplica schema.sql + seed.sql y crea el admin inicial
```

## 3) Configurar variables de entorno

Copia el ejemplo y edítalo:

```bash
cd perricos-app/server
copy .env.example .env        # (en PowerShell: cp .env.example .env)
```

Edita `.env` con tus datos de PostgreSQL:

```env
PORT=4000
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=tu_password_de_postgres
PGDATABASE=perricos
JWT_SECRET=cambia_esto_por_algo_largo_y_aleatorio
ADMIN_EMAIL=admin@perricos.com
ADMIN_PASSWORD=admin123
ADMIN_NOMBRE=Admin
```

> El `ADMIN_PASSWORD` es la contraseña inicial del panel admin. Cámbiala luego desde
> el panel (pestaña **Cuenta**).

## 4) Instalar dependencias

Desde la **raíz** del proyecto:

```bash
cd perricos-app
npm run install:all
```

## 5) Correr en desarrollo (VS Code)

Abre la carpeta `perricos-app` en VS Code (`File > Open Folder`), abre una terminal
integrada (`Ctrl+`` `) y ejecuta:

```bash
npm run dev
```

Esto levanta **ambos** servicios a la vez:
- API → http://localhost:4000
- Web → http://localhost:5173 (con proxy hacia la API)

Abre http://localhost:5173 en el navegador.

### Panel de administrador
- Haz clic en el **candado** (esquina inferior derecha de la tienda) e inicia sesión con:
  - Email: `admin@perricos.com`
  - Contraseña: la de tu `.env` (`admin123` por defecto)
- Ahí puedes: ver el **Dashboard** con gráficas, crear/editar/eliminar **Productos** y
  **Categorías**, registrar **Ventas** (descuenta stock automático), leer el **Buzón** de
  sugerencias y editar tu **Cuenta**.

## 6) Producción

```bash
npm run build        # compila el frontend a client/dist
npm start            # sirve la API + el frontend compilado en http://localhost:4000
```

## Notas de seguridad
- `.env` está en `.gitignore` — **nunca lo subas** a GitHub.
- Cambia `JWT_SECRET` y la contraseña del admin antes de producción.
- Para exponerla en internet, usa HTTPS (por ejemplo con Nginx o un servicio como Railway/Render).

## Datos incluidos
El `seed.sql` carga tus **28 productos reales** con categorías (Perros, Gatos, Peces y Varios)
y stock inicial. Los que son a granel (hojuelas/aserrín) vienen marcados como `gramos`.
