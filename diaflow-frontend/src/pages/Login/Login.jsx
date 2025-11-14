import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "../../auth/AuthProvider";

const schema = z.object({
  username: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

function Login() {
  const { login } = useContext(AuthContext);
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data) {
    setApiError("");
    try {
      await login(data.username, data.password);
    } catch (e) {
      console.error(e);
      setApiError("Usuario o contraseña incorrectos.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Iniciar sesión</h2>

        {apiError && <p className="text-red-600 text-sm">{apiError}</p>}

        <div>
          <label className="block text-sm mb-1">Usuario</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-red-600 text-xs mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2 text-sm"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-600 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold"
        >
          {isSubmitting ? "Accediendo..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default Login;
