<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ChronosFlow - Sistema de Gestión de Tiempo

Sistema de seguimiento de tiempo y planificación de objetivos con autenticación de usuarios.

## Características

- 🔐 Autenticación con email/contraseña y Google
- 👤 Tres tipos de usuarios: Empregado, Patrão, Estudante
- ⏱️ Registro y seguimiento de horas trabajadas
- 📊 Dashboard con visualizaciones
- 🤖 Asistente de IA para planificación

## Configuración

### Prerrequisitos

- Node.js instalado
- Cuenta de Firebase (para autenticación)

### Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar Firebase:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita Authentication > Sign-in method > Email/Password y Google
   - Obtén las credenciales de tu proyecto Firebase
   - Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```env
   VITE_FIREBASE_API_KEY=tu-api-key
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-project-id
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=tu-app-id
   ```

3. (Opcional) Configurar Gemini API Key para el asistente de IA:
   ```env
   VITE_GEMINI_API_KEY=tu-gemini-api-key
   ```

4. Ejecutar la aplicación:
   ```bash
   npm run dev
   ```

## Uso

1. **Registro**: Al abrir la aplicación, podrás registrarte seleccionando tu categoría (Empregado, Patrão o Estudante)
2. **Autenticación**: Puedes registrarte con email/contraseña o usar "Continuar con Google"
3. **Inicio de sesión**: Si ya tienes cuenta, puedes iniciar sesión directamente

## Tecnologías

- React + TypeScript
- Firebase Authentication
- Vite
- Tailwind CSS
