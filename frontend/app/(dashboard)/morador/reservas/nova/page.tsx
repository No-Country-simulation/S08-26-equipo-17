'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationSchema, ReservationFormValues } from '../reservationSchema';

interface CommonArea {
  id: string;
  name: string;
  maxCapacity: number;
  openTime: string;
  closeTime: string;
  rulesText: string | null;
}

interface ExistingReservation {
  id: string;
  startTime: string;
  endTime: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

export default function NovaReservaPage() {
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [occupied, setOccupied] = useState<ExistingReservation[]>([]);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormValues>({ resolver: zodResolver(reservationSchema) });

  const selectedAreaId = watch('commonAreaId');

  useEffect(() => {
    fetch(`${API}/api/v1/common-areas`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setAreas)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedAreaId) return;
    fetch(`${API}/api/v1/common-areas/${selectedAreaId}/reservations`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setOccupied)
      .catch(() => setOccupied([]));
  }, [selectedAreaId]);

  async function onSubmit(data: ReservationFormValues) {
    setServerError(null);
    const res = await fetch(`${API}/api/v1/reservations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        commonAreaId: data.commonAreaId,
        unitId: data.unitId,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      }),
    });

    if (res.status === 409) {
      setServerError('Este horário já está reservado. Escolha outro intervalo.');
      return;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.detail ?? 'Erro ao criar reserva. Tente novamente.');
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-green-50 border border-green-300 rounded-xl p-8 text-center max-w-sm w-full">
          <p className="text-2xl mb-2">✅</p>
          <p className="font-semibold text-green-800">Reserva confirmada!</p>
          <button
            className="mt-4 text-sm text-green-700 underline"
            onClick={() => setSuccess(false)}
          >
            Fazer outra reserva
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nova Reserva de Área Comum</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Common Area */}
        <div>
          <label className="block text-sm font-medium mb-1">Área comum</label>
          <select
            {...register('commonAreaId')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione uma área...</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — cap. {a.maxCapacity} | {a.openTime}–{a.closeTime}
              </option>
            ))}
          </select>
          {errors.commonAreaId && (
            <p className="text-red-500 text-xs mt-1">{errors.commonAreaId.message}</p>
          )}
        </div>

        {/* Rules */}
        {selectedAreaId && areas.find((a) => a.id === selectedAreaId)?.rulesText && (
          <p className="text-xs text-gray-500 bg-gray-50 border rounded p-2">
            📋 {areas.find((a) => a.id === selectedAreaId)!.rulesText}
          </p>
        )}

        {/* Occupied slots */}
        {occupied.length > 0 && (
          <div className="text-xs bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="font-semibold text-yellow-800 mb-1">Horários já reservados:</p>
            <ul className="space-y-0.5">
              {occupied.map((r) => (
                <li key={r.id} className="text-yellow-700">
                  {new Date(r.startTime).toLocaleString('pt-BR')} →{' '}
                  {new Date(r.endTime).toLocaleString('pt-BR')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unit ID */}
        <div>
          <label className="block text-sm font-medium mb-1">ID da unidade</label>
          <input
            type="text"
            placeholder="UUID da sua unidade"
            {...register('unitId')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.unitId && (
            <p className="text-red-500 text-xs mt-1">{errors.unitId.message}</p>
          )}
        </div>

        {/* Start time */}
        <div>
          <label className="block text-sm font-medium mb-1">Início</label>
          <input
            type="datetime-local"
            {...register('startTime')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startTime && (
            <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>
          )}
        </div>

        {/* End time */}
        <div>
          <label className="block text-sm font-medium mb-1">Término</label>
          <input
            type="datetime-local"
            {...register('endTime')}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.endTime && (
            <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
            ⚠️ {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Reservando...' : 'Confirmar Reserva'}
        </button>
      </form>
    </main>
  );
}
