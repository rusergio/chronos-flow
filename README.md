<div align="center">
<h1 style="font-size: 72px; font-weight: bold; color: #1E759B;">CF</h1>
</div>

# ChronosFlow - Sistema de Gestión de Tiempo

Aplicação para gestão de horas de trabalho e planificação de horas de estudo.

Sistema de seguimiento de tiempo y planificación de objetivos con autenticación de usuarios.

## Características

- 🔐 Autenticación con email/contraseña (almacenamiento local para pruebas)
- 👤 Tres tipos de usuarios: Empregado, Patrão, Estudante
- ⏱️ Registro y seguimiento de horas trabajadas
- 📅 Calendario mensual interactivo para visualizar horas registradas
- 📊 Dashboard con visualizaciones
- 💰 Calculadora de salario basada en horas acumuladas
- 📚 Calculadora de horas de estudio diarias
- 🎨 Interfaz moderna con Tailwind CSS

## Configuración

### Prerrequisitos

- Node.js instalado

### Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar la aplicación:
   ```bash
   npm run dev
   ```

## Uso

1. **Registro**: Al abrir la aplicación, podrás registrarte seleccionando tu(s) categoría(s) (Empregado, Patrão y/o Estudante)
2. **Autenticación**: Puedes registrarte con email/contraseña (los datos se almacenan localmente para pruebas)
3. **Inicio de sesión**: Si ya tienes cuenta, puedes iniciar sesión directamente
4. **Dashboard**: Accede a tu dashboard según tu rol y gestiona tus horas

## Tecnologías

- React + TypeScript
- Vite
- Tailwind CSS
- Local Storage (para pruebas)
