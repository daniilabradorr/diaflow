import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// Esquema de validación con Zod
const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().min(1, "El email es obligatorio").email("Formato de email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Maneja el submit del formulario
  const onSubmit = async (data) => {
    setApiError("");
    try {
      // Llamar al endpoint de registro
      await api.post("auth/register/", {
        nombre: data.name,
        email: data.email,
        password: data.password,
      });
      // Registro exitoso: redirigir a login
      navigate("/login");
    } catch (err) {
      console.error("Error en registro:", err);
      // Manejar errores de la API (por ejemplo, usuario ya existe)
      setApiError(err.response?.data?.detail || "Error al registrar. Intente de nuevo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form 
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Crear cuenta</h2>

        {apiError && <p className="text-red-600 text-sm text-center">{apiError}</p>}

        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input 
            type="text"
            className="w-full border rounded px-3 py-2 text-sm"
            {...register("name")}
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input 
            type="email"
            className="w-full border rounded px-3 py-2 text-sm"
            {...register("email")}
          />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input 
            type="password"
            className="w-full border rounded px-3 py-2 text-sm"
            {...register("password")}
          />
          {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold"
        >
          {isSubmitting ? "Creando cuenta..." : "Registrarse"}
        </button>

        <p className="text-xs text-center mt-2">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-blue-600 underline">Inicia sesión</a>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;