
# 🎬 Proyecto Web de Filmania - Pablo Vera García

Este proyecto consiste en una aplicación web desarrollada con **Laravel** (backend) y **Angular** (frontend), que permite a los usuarios explorar películas, marcar favoritas, hacer comentarios, gestionar listas personalizadas, enviar mensajes y más. Incluye además un **panel de administración** para la gestión de usuarios y contenido.

---

## 📁 Estructura del Proyecto

```
/backend        → Backend Laravel (API RESTful)
/frontend       → Frontend Angular (SPA)
/README.md      → Instrucciones del proyecto
```

---

## 🚀 Tecnologías Usadas

- **Laravel 9.19** (PHP 8.0+)
- **Angular 16**
- **MySQL / MariaDB**
- **TMDb API** para obtener datos de películas
- **Mailtrap SMTP** para pruebas de recuperación por correo

---

## ⚙️ Requisitos Previos

- PHP 8.0.30 o superior
- Composer 2.x
- Node.js + npm
- Angular CLI 17.3+ (usado Angular 16)
- MySQL / MariaDB
- Git

---

## 🔧 Instalación del Backend (Laravel)

```bash
git clone https://github.com/pablovera2735/Projecto_Pablo.git
cd Projecto_Pablo/backend
composer install
```

### Configuración del entorno:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de base de datos:

```ini
DB_DATABASE=peliculas
DB_USERNAME=root
DB_PASSWORD=tu_contraseña

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=tu_usuario
MAIL_PASSWORD=tu_contraseña
MAIL_ENCRYPTION=null
```

### Migraciones y seeders:

```bash
php artisan migrate --seed
```

### Ejecutar el servidor de desarrollo:

```bash
php artisan serve
```

---

## 🌐 Instalación del Frontend (Angular)

```bash
cd ../frontend
npm install
```

### Ejecutar servidor Angular:

```bash
ng serve o npm start
```

Accede desde el navegador en:  
📍 `http://localhost:4200`

---

## 🔑 Acceso de prueba

**Usuario normal:**
- Email: usuario2@mail.com
- Password: usuario2

**Administrador:**
- Email: admin@mail.com
- Password: admin
---

## 📜 Licencia

Este proyecto se ha desarrollado como parte del **Proyecto Integrado** del CFGS de Desarrollo de Aplicaciones Web.