import { z } from 'zod';

export const reservationSchema = z
  .object({
    commonAreaId: z.string().uuid('Selecione uma área válida'),
    unitId: z.string().uuid('Selecione uma unidade válida'),
    startTime: z.string().refine((v) => !isNaN(Date.parse(v)), 'Data/hora inicial inválida'),
    endTime: z.string().refine((v) => !isNaN(Date.parse(v)), 'Data/hora final inválida'),
  })
  .refine((d) => new Date(d.endTime) > new Date(d.startTime), {
    message: 'O horário de término deve ser posterior ao de início',
    path: ['endTime'],
  });

export type ReservationFormValues = z.infer<typeof reservationSchema>;
