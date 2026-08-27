# 🚀 Guía de Despliegue en Supabase y Vercel (Paso a Paso)

Esta guía te permitirá desplegar el sistema de turnos de **ACE Masajes** en producción de forma **100% gratuita**.

---

## 📦 PASO 1: Crear la Base de Datos en Supabase (2 minutos)

1. Ingresa a **[https://supabase.com](https://supabase.com)** y regístrate o inicia sesión con tu cuenta de GitHub / Google.
2. Haz clic en **"New Project"**.
3. Completa los datos:
   - **Name**: `ace-masajes`
   - **Database Password**: Genera una contraseña segura (guárdala).
   - **Region**: Elige `South America (São Paulo)` o `US East`.
   - Haz clic en **"Create new project"**.
4. Una vez creado el proyecto, ve al menú izquierdo y entra en **"SQL Editor"** (ícono de terminal/consola).
5. Haz clic en **"New Query"**, abre el archivo `supabase_schema.sql` de este proyecto, copia todo su contenido y pégalo allí.
6. Presiona el botón verde **"Run"** (o `Ctrl + Enter`).
   > 🎉 ¡Listo! Se habrán creado todas las tablas con los 6 masajes a $40.000, los datos de la cuenta de Reba para la seña y el usuario administrador `jpanadisi`.
7. Ve a **Project Settings** (ícono de engranaje) -> **API**:
   - Copia la **Project URL** (ejemplo: `https://xyzcompany.supabase.co`).
   - Copia la **anon / public key** (o `service_role key`).

---

## ⚡ PASO 2: Subir el Proyecto a GitHub (1 minuto)

Si aún no lo tienes en GitHub:
1. Crea un repositorio en **[https://github.com/new](https://github.com/new)** (ejemplo: `turnos-masajes-ace`).
2. En tu terminal / consola en la carpeta del proyecto:
   ```bash
   git init
   git add .
   git commit -m "ACE Masajes - Sistema de Turnos Listo para Produccion"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/turnos-masajes-ace.git
   git push -u origin main
   ```

---

## ▲ PASO 3: Desplegar en Vercel (2 minutos)

1. Ingresa a **[https://vercel.com](https://vercel.com)** e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** -> **"Project"**.
3. Selecciona tu repositorio `turnos-masajes-ace` y haz clic en **"Import"**.
4. En la sección **Environment Variables**, agrega las siguientes 3 variables:
   - `SUPABASE_URL` = *(La URL de tu proyecto Supabase que copiaste en el Paso 1)*
   - `SUPABASE_KEY` = *(La clave anon o service_role de Supabase)*
   - `JWT_SECRET` = `ace_masajes_secreto_super_seguro_2026`
5. Haz clic en el botón **"Deploy"**.
6. En menos de 1 minuto Vercel compilará el frontend React y creará las funciones Serverless para la API.

---

## 🌐 ¡Listo! Tu web estará online en tu dominio Vercel

Tu sistema estará disponible en una URL como:
👉 **`https://turnos-masajes-ace.vercel.app`**

- **Portal de Clientes**: Reserva en 4 pasos con cálculo de seña de $10.000 y envío de comprobante.
- **Acceso Administrador**: Botón *"Admin"* con usuario `jpanadisi` y contraseña `Taxi1781!`.
- **Cron Jobs**: Vercel ejecutará automáticamente la revisión de recordatorios a 30 minutos según lo configurado en `vercel.json`.
