import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const cemeteryAdminSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  cemeteryId: true,
  createdAt: true,
  updatedAt: true,
  cemetery: {
    select: {
      id: true,
      name: true,
      location: true,
    },
  },
} satisfies Prisma.UserSelect;

const optionalCemeteryIdSchema = z.union([z.string().uuid(), z.null()]).optional();

export const createCemeteryAdminSchema = z
  .object({
    email: z.string().trim().email(),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    password: z.string().min(6),
    confirmPassword: z.string().min(6).optional(),
    cemeteryId: optionalCemeteryIdSchema,
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Konfirmasi password tidak sama dengan password.',
        path: ['confirmPassword'],
      });
    }
  });

export const updateCemeteryAdminSchema = z
  .object({
    email: z.string().trim().email(),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    cemeteryId: optionalCemeteryIdSchema,
    password: z.string().min(6).optional().or(z.literal('')),
    confirmPassword: z.string().min(6).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if ((data.password || data.confirmPassword) && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Konfirmasi password tidak sama dengan password.',
        path: ['confirmPassword'],
      });
    }
  });

export const resetCemeteryAdminPasswordSchema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Konfirmasi password tidak sama dengan password.',
        path: ['confirmPassword'],
      });
    }
  });

export function normalizeCemeteryId(cemeteryId: string | null | undefined) {
  return cemeteryId ?? null;
}
