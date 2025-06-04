import { defineConfig } from "auth-astro";
import Google from '@auth/core/providers/google'

// Obtener correos permitidos desde variables de entorno
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS?.split(',') || [];

export default defineConfig({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Verificar si el correo está en la lista de permitidos
      if (!user.email || !ALLOWED_EMAILS.includes(user.email)) {
        return false; // Rechazar el inicio de sesión
      }
      return true; // Permitir el inicio de sesión
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=unauthorized", // Página de error personalizada
  },
});
