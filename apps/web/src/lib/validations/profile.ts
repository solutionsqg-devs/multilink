import { z } from 'zod';

/**
 * Validaciones Zod para Profile
 */

// Username: alfanumérico, guiones, 3-30 caracteres
const usernameRegex = /^[a-zA-Z0-9_-]+$/;

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(usernameRegex, 'Solo letras, números, guiones y guión bajo'),
  displayName: z.string().min(1, 'Nombre requerido').max(100, 'Máximo 100 caracteres'),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
  avatar: z.string().url('URL inválida').optional().or(z.literal('')),
  theme: z.enum(['default', 'dark', 'modern', 'minimal']),
  customCss: z.string().max(5000, 'CSS muy largo').optional(),
  metaTitle: z.string().max(60, 'Máximo 60 caracteres').optional(),
  metaDescription: z.string().max(160, 'Máximo 160 caracteres').optional(),
  ogImage: z.string().url('URL inválida').optional().or(z.literal('')),
  customDomain: z.string().optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
