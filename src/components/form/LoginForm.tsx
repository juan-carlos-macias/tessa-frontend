'use client'

import { JSX, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import Input from "@/components/ui/input";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase/auth";
import safeAsync from "@/utils/safeAsync/safeAsync";

export function LoginForm(): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const [user, err] = await safeAsync(loginWithEmail(email, password));
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    if (user) {
    
      window.location.href = "/dashboard";
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    const [user, err] = await safeAsync(loginWithGoogle());
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    if (user) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-gray-400">
            Ingresa tu correo electrónico y contraseña para acceder
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email" className="text-gray-300 text-sm font-normal">
                Correo electrónico
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@ejemplo.com"
                required
                disabled={loading}
                className="bg-black border-0 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-gray-600 h-11"
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password" className="text-gray-300 text-sm font-normal">
                  Contraseña
                </FieldLabel>
                <a
                  href="#"
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                disabled={loading}
                className="bg-black border-0 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-gray-600 h-11"
              />
            </Field>
            {error && (
              <div className="rounded-md bg-red-950/50 border border-red-900/50 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-gray-200 h-11 font-medium" 
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Continuar"}
            </Button>
          </FieldGroup>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0a0a] px-2 text-gray-500">O</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-black border-gray-800 text-white hover:bg-gray-900 hover:text-white h-11 font-medium"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar con Google
        </Button>

        <p className="text-center text-xs text-gray-500">
          ¿No tienes una cuenta?{" "}
          <a href="/signup" className="text-white hover:underline">
            Regístrate
          </a>
        </p>
      </div>

      <p className="text-center text-xs text-gray-600">
        Al continuar, aceptas nuestros{" "}
        <a href="#" className="hover:text-gray-400 transition-colors">
          Términos de Servicio
        </a>{" "}
        y{" "}
        <a href="#" className="hover:text-gray-400 transition-colors">
          Política de Privacidad
        </a>
        .
      </p>
    </div>
  );
}

export default LoginForm;
