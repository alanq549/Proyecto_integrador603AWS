# API_FULLSTACK
# 🅿️ Sistema de Estacionamiento Híbrido con Sincronización Bidireccional

Este proyecto es un sistema de gestión de estacionamiento inteligente, diseñado para operar tanto **localmente** como en la **nube**, con sincronización de datos **bidireccional y automática** entre ambas instancias. Ideal para entornos donde la conectividad no siempre es confiable.

---

## 🚀 Características principales

- 📡 **Base de datos híbrida (Local + AWS RDS)**
- 🔁 **Sincronización bidireccional automática**
- ⚠️ **Failover automático** si falla una de las dos bases
- 🧠 Lógica de sincronización con comparación de `updatedAt`
- ⏳ Tareas programadas (cron jobs) para mantener integridad y limpieza de datos
- 📦 Contenedorizado con **Docker**
- ⚙️ Backend robusto con **Node.js**, **Prisma ORM**, y **TypeScript**
- 🌐 Frontend con **React.js**, Tailwind y componentes personalizados

---

## 🧠 Arquitectura de Alta Disponibilidad

- El backend selecciona automáticamente el cliente de Prisma según disponibilidad.
- Si la base en AWS falla, se usa la local.
- Los cambios se sincronizan en ambos sentidos cada cierto tiempo.

---

## ⚙️ Tecnologías utilizadas

- **Frontend:** React.js · Tailwind CSS
- **Backend:** Node.js · TypeScript · Express
- **ORM:** Prisma (con múltiples esquemas)
- **Base de datos:** MySQL (local y AWS RDS)
- **Infraestructura:** Docker · AWS EC2/RDS
- **Sincronización:** Jobs programados con lógica personalizada
- **Otros:** Git · GitHub Actions (opcional para CI/CD)

---

Este proyecto fue desarrollado como ejercicio técnico semiempresarial. Puedes usarlo como base para tus propios desarrollos, mejorar la lógica de sincronización, o escalarlo a producción real.
MIT License

Alan y Bryan — Estudiantes de Ingeniería Informática | Desarrollador Full Stack en formación
✨ Proyecto desarrollado con apoyo de herramientas IA y enfoque profesional

"Si se cae la nube, seguimos trabajando en tierra firme."