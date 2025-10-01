import { z } from 'zod';

/**
 * Validaciones Zod para Links
 */

// URLs permitidas (http/https)
const urlRegex = /^https?:\/\/.+/;

export const linkSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(100, 'Máximo 100 caracteres'),
  url: z
    .string()
    .min(1, 'URL requerida')
    .regex(urlRegex, 'URL debe comenzar con http:// o https://')
    .url('URL inválida'),
  description: z.string().max(200, 'Máximo 200 caracteres').optional(),
  icon: z.string().max(100).optional(),
});

export type LinkFormData = z.infer<typeof linkSchema>;
