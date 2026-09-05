# CondoTrack — Frontend Routes & Screen Architecture (Next.js) / Rutas del Frontend / Rotas do Frontend

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Code & Component Snippets](#4-code-and-component-snippets)

---

## 1. English

### 1.1 Next.js App Router Tree
The frontend leverages Next.js 14+ **Route Groups** `(group)` to isolate role layouts and access permissions:
* `(auth)/login`: Clean public login page.
* `(dashboard)/admin`: Property management modules (buildings, units, user directory, move approvals, incident board, full audit trail).
* `(dashboard)/portaria`: Concierge operations (camera QR scanner, unscheduled entry logging, package reception and delivery sign-off).
* `(dashboard)/morador`: Resident portal (guest QR generator, package notifications, amenity booking calendar, move scheduler, incident reporting).
* `(dashboard)/unidades/[id]/visao-360`: **Core MVP Screen:** 360° consolidated dossier for the selected unit.

### 1.2 Route Catalog by Role
| Route | Role | Description | Key UI Components |
| :--- | :--- | :--- | :--- |
| `/login` | Public | Email and password authentication | `Card`, `LoginForm` (Zod), `Button` |
| `/portaria/scanner` | `PORTARIA`, `ADMIN` | Camera QR scanner ($< 1.5$s response) with manual code fallback | `QrScannerCamera`, `VisitorApprovedDialog` |
| `/portaria/encomendas/receber` | `PORTARIA`, `ADMIN` | Quick parcel reception with carrier and unit search | `UnitCombobox`, `Select`, `Button` |
| `/portaria/encomendas/entregar`| `PORTARIA`, `ADMIN` | Pending parcel pickup list and handover confirmation | `Table`, `Badge`, `HandoverDialog` |
| `/morador/acessos/novo-qr` | `MORADOR` | Issues guest pass with QR code generation | `DatePicker`, `QrCodeDisplay`, `WhatsAppShareButton` |
| `/morador/reservas/nova` | `MORADOR` | Amenity booking with real-time conflict prevention | `Calendar`, `TimeSlotPicker`, `ConflictAlert` |
| `/unidades/[id]/visao-360` | `ADMIN`, `PORTARIA` | **MVP 360° Unit Overview:** Integrated cards and timeline | `UnitHeader`, `PackageAlert`, `VisitorHistory`, `Timeline` |

---

## 2. Español

### 2.1 Estructura del App Router de Next.js
El frontend organiza las pantallas mediante **Grupos de Rutas** `(grupo)` para aislar permisos y layouts:
* `(auth)/login`: Pantalla de inicio de sesión pública.
* `(dashboard)/admin`: Módulos de administración (edificios, unidades, usuarios, mudanzas, mantenimiento, auditoría).
* `(dashboard)/portaria`: Módulos de portería (escáner QR, ingresos imprevistos, paquetería y bajas).
* `(dashboard)/morador`: Portal del residente (emisión de QR, paquetes, reservas, mudanzas y reclamos).
* `(dashboard)/unidades/[id]/visao-360`: **Pantalla Principal del MVP:** Panel 360° consolidado por unidad.

### 2.2 Catálogo de Rutas por Perfil
| Ruta | Rol | Descripción | Componentes UI |
| :--- | :--- | :--- | :--- |
| `/login` | Público | Autenticación con correo y contraseña | `Card`, `LoginForm` (Zod), `Button` |
| `/portaria/scanner` | `PORTARIA`, `ADMIN` | Lector de QR por cámara con respuesta en $< 1.5$s | `QrScannerCamera`, `VisitorApprovedDialog` |
| `/portaria/encomendas/receber` | `PORTARIA`, `ADMIN` | Registro ágil de paquetes con alerta inmediata | `UnitCombobox`, `Select`, `Button` |
| `/portaria/encomendas/entregar`| `PORTARIA`, `ADMIN` | Lista de paquetes pendientes y entrega presencial | `Table`, `Badge`, `HandoverDialog` |
| `/morador/acessos/novo-qr` | `MORADOR` | Creación de autorizaciones de visita con código QR | `DatePicker`, `QrCodeDisplay`, `WhatsAppShareButton` |
| `/morador/reservas/nova` | `MORADOR` | Reserva de amenidades con bloqueo de solapamientos | `Calendar`, `TimeSlotPicker`, `ConflictAlert` |
| `/unidades/[id]/visao-360` | `ADMIN`, `PORTARIA` | **Vista 360° de la Unidad:** Panel integrado y auditoría | `UnitHeader`, `PackageAlert`, `VisitorHistory`, `Timeline` |

---

## 3. Português (pt-BR)

### 3.1 Estrutura do App Router do Next.js
O frontend organiza as páginas por meio de **Grupos de Rotas** `(grupo)` para segmentar layouts e regras de RBAC:
* `(auth)/login`: Tela de login limpa e responsiva.
* `(dashboard)/admin`: Módulos administrativos (condomínios, unidades, moradores, mudanças, chamados, auditoria).
* `(dashboard)/portaria`: Rotinas de portaria (scanner QR, entrada manual, recepção e baixa de entregas).
* `(dashboard)/morador`: Área do morador (gerador de QR Code, minhas encomendas, reservas, chamados).
* `(dashboard)/unidades/[id]/visao-360`: **Tela Chave do MVP:** Painel 360° integrado da unidade.

### 3.2 Catálogo de Telas por Perfil
| Rota | Perfil | Descrição | Componentes Principais |
| :--- | :--- | :--- | :--- |
| `/login` | Público | Login unificado com e-mail e senha | `Card`, `LoginForm` (Zod), `Button` |
| `/portaria/scanner` | `PORTARIA`, `ADMIN` | Leitor de QR Code via câmera ($< 1.5$s) com contingência manual | `QrScannerCamera`, `VisitorApprovedDialog` |
| `/portaria/encomendas/receber` | `PORTARIA`, `ADMIN` | Cadastro rápido de encomendas com disparo de notificação | `UnitCombobox`, `Select`, `Button` |
| `/portaria/encomendas/entregar`| `PORTARIA`, `ADMIN` | Fila de pacotes aguardando retirada e confirmação de entrega | `Table`, `Badge`, `HandoverDialog` |
| `/morador/acessos/novo-qr` | `MORADOR` | Formulário para emissão de convite com QR Code | `DatePicker`, `QrCodeDisplay`, `WhatsAppShareButton` |
| `/morador/reservas/nova` | `MORADOR` | Agendamento de áreas sociais com checagem de conflito | `Calendar`, `TimeSlotPicker`, `ConflictAlert` |
| `/unidades/[id]/visao-360` | `ADMIN`, `PORTARIA` | **Visão 360° da Unidade:** Dossiê integrado e timeline cronológica | `UnitHeader`, `PackageAlert`, `VisitorHistory`, `Timeline` |

---

## 4. Code and Component Snippets

### 4.1 Camera QR Code Scanner (`QrScannerCamera.tsx`)
```tsx
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

interface QrScannerProps {
  onScanSuccess: (token: string) => void;
}

export function QrScannerCamera({ onScanSuccess }: QrScannerProps) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (error) => {
        // Continuous scan in progress
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScanSuccess]);

  return <div id="qr-reader" className="w-full max-w-md mx-auto rounded-lg overflow-hidden" />;
}
```

### 4.2 Guest QR Code Display (`QrCodeDisplay.tsx`)
```tsx
import QRCode from 'qrcode.react';

export function QrCodeDisplay({ token, visitorName }: { token: string; visitorName: string }) {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md border">
      <QRCode value={`CONDOTRACK:${token}`} size={220} level="H" includeMargin />
      <p className="mt-4 font-semibold text-gray-800">Visitante / Visitor: {visitorName}</p>
      <span className="text-xs text-muted-foreground mt-1">Apresente este código na portaria</span>
    </div>
  );
}
```

### 4.3 Form Schema Validation with Zod (`visitorAuthorizationSchema.ts`)
```typescript
import { z } from 'zod';

export const visitorAuthorizationSchema = z.object({
  unitId: z.string().uuid("Selecione uma unidade válida / Select a valid unit"),
  visitorName: z.string().min(3, "Nome mínimo de 3 caracteres / Name min 3 chars"),
  visitorDocument: z.string().optional(),
  validFrom: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inicial inválida / Invalid start date"),
  validUntil: z.string().refine((val) => !isNaN(Date.parse(val)), "Data final inválida / Invalid end date"),
}).refine((data) => new Date(data.validUntil) > new Date(data.validFrom), {
  message: "Validade final deve ser posterior à inicial / End date must be after start date",
  path: ["validUntil"],
});
```
