import { useState, useCallback } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/use-auth";

// Validation schema using Zod
const loginSchema = z
  .object({
    email: z
      .string()
      .nonempty("El correo es obligatorio")
      .email("Correo inválido"),
    password: z
      .string()
      .nonempty("La contraseña es obligatoria")
      .min(6, "Mínimo 6 caracteres"),
  })
  .required();

type LoginFormInputs = z.infer<typeof loginSchema>;

/**
 * Login page component.
 */
export default function LoginPage() {
  const { login } = useAuth();

  // Local UI state for loading and form errors
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Initialize form handling with validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  /**
   * Handles form submission.
   */
  const onSubmit = useCallback(
    async (data: LoginFormInputs) => {
      setFormError("");
      setLoading(true);
      try {
        // Trim inputs to avoid validation issues
        await login(data.email.trim(), data.password);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error de login:", err);
        setFormError(
          err?.message || "Error al iniciar sesión. Inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  return (
    <Container component="main" maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-busy={loading}
      >
        {/* Email input field */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Correo electrónico"
              fullWidth
              margin="normal"
              required
              autoComplete="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              aria-invalid={Boolean(errors.email)}
            />
          )}
        />

        {/* Password input field */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Contraseña"
              type="password"
              fullWidth
              margin="normal"
              required
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              aria-invalid={Boolean(errors.password)}
            />
          )}
        />

        {/* Display submission error */}
        {formError && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {formError}
          </Typography>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Iniciar sesión"}
        </Button>
      </Box>
    </Container>
  );
}
