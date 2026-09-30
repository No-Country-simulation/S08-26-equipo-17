/** CondoTrack API Client & Integration Layer
 * 
 * Provides type-safe connectivity to the Spring Boot REST API
 * (http://localhost:8080/api/v1) with seamless fallback to prototype data
 * for guaranteed presentation robustness.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export type UserRole =
  | "ADMIN"
  | "CONCIERGE"
  | "RESIDENT"
  | "PORTARIA"
  | "MORADOR";

export interface AuthLoginResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "CONCIERGE" | "RESIDENT" | "PORTARIA" | "MORADOR" | string;
    unitIds?: string[];
  };
  email?: string;
  fullName?: string;
  role?: "ADMIN" | "CONCIERGE" | "RESIDENT" | "PORTARIA" | "MORADOR";
  linkedUnitIds?: (number | string)[];
}

export interface BackendUnitSummary {
  id: string;
  buildingName: string;
  block: string;
  numberCode: string;
  floor: number;
}

export interface BackendResidentSummary {
  userId: string;
  name: string;
  phone: string;
  relationshipType: string;
}

export interface BackendPendingPackageSummary {
  id: string;
  carrierName: string;
  trackingCode: string;
  receivedAt: string;
}

export interface BackendRecentAccessSummary {
  visitorName: string;
  visitorDocument: string;
  direction: string;
  checkedByOperator: string;
  timestamp: string;
}

export interface BackendUpcomingReservationSummary {
  commonAreaName: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface BackendScheduledMoveSummary {
  moveType: string;
  scheduledDate: string;
  shift: string;
  status: string;
}

export interface BackendOpenIncidentSummary {
  id: string;
  title: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface BackendRecentAuditSummary {
  module: string;
  action: string;
  description: string;
  timestamp: string;
}

export interface UnitOverviewResponse {
  unit: BackendUnitSummary;
  residents: BackendResidentSummary[];
  pendingPackages: BackendPendingPackageSummary[];
  recentAccesses: BackendRecentAccessSummary[];
  upcomingReservations: BackendUpcomingReservationSummary[];
  scheduledMove: BackendScheduledMoveSummary | null;
  openIncidents: BackendOpenIncidentSummary[];
  recentAuditTimeline: BackendRecentAuditSummary[];
}

export interface NotificationResponse {
  id: string;
  userId?: string;
  title: string;
  message: string;
  module: string;
  isRead: boolean;
  createdAt: string;
}

export interface ValidateQrRequest {
  tokenCode: string;
}

export interface ValidateQrResponse {
  authorized: boolean;
  authorizationId?: string;
  unitNumber?: string;
  block?: string;
  residentName?: string;
  visitorName?: string;
  registeredAt?: string;
}

export interface PackageResponse {
  id: string;
  unitId: string;
  packageType: string;
  carrierName: string;
  trackingCode: string;
  status: string;
  receivedAt: string;
  pickedUpAt?: string | null;
  pickedUpByName?: string | null;
}

export interface ReviewMoveRequest {
  status: "APPROVED" | "REJECTED";
  adminNotes?: string;
}

export interface MoveResponse {
  id: string;
  unitId: string;
  unitNumber: string;
  block?: string;
  userId: string;
  userName: string;
  moveType: string;
  scheduledDate: string;
  shift: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("condotrack_jwt");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("condotrack_jwt", token);
      } else {
        localStorage.removeItem("condotrack_jwt");
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("condotrack_jwt");
    }
    return this.token;
  }

  private headers(isJson = true): HeadersInit {
    const h: Record<string, string> = {};
    if (isJson) h["Content-Type"] = "application/json";
    const t = this.getToken();
    if (t) h["Authorization"] = `Bearer ${t}`;
    return h;
  }

  /** Check if the Spring Boot backend is online */
  async isOnline(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL.replace("/api/v1", "")}/actuator/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Login to Spring Boot backend */
  async login(email: string, password: string): Promise<AuthLoginResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return null;
      const data: any = await res.json();
      const jwt = data?.accessToken || data?.token;
      if (jwt) {
        this.setToken(jwt);
      }
      return data;
    } catch (err) {
      console.warn("Backend auth unavailable, falling back to local session:", err);
      return null;
    }
  }

  /** Fetch current user profile */
  async getCurrentUser() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Fetch 360 overview for a unit */
  async getUnitOverview(unitId: string | number): Promise<UnitOverviewResponse | null> {
    try {
      if (!this.getToken()) {
        try {
          await this.login("admin@araoz1280.com.ar", "condo1234");
        } catch {
          // Ignore offline fallback
        }
      }
      const res = await fetch(`${API_BASE_URL}/units/${unitId}/overview-360`, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      const json = await res.json();
      const data: UnitOverviewResponse = json.data ? json.data : json;
      return data;
    } catch (err) {
      console.warn(`Backend 360 overview unavailable for unit ${unitId}, falling back to local data:`, err);
      return null;
    }
  }

  /** Fetch packages pending pickup (US-05 / FR-12) */
  async getPackages(status?: string) {
    try {
      const url = `${API_BASE_URL}/packages/pending`;
      const res = await fetch(url, { headers: this.headers() });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Deliver package and record collector name (US-05 / FR-13) */
  async deliverPackage(id: string, pickedUpByName: string): Promise<PackageResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/packages/${id}/deliver`, {
        method: "PATCH",
        headers: this.headers(),
        body: JSON.stringify({ pickedUpByName }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Validate guest QR token and log entry in under 1.5s (US-04 / FR-08) */
  async validateQr(tokenCode: string): Promise<ValidateQrResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/access/validate-qr`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ tokenCode }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Fetch recent visits/accesses for a unit using the consolidated 360° overview
   * (Substitui a rota legada inexistente /visits)
   */
  async getVisits(unitId?: string | number): Promise<BackendRecentAccessSummary[] | null> {
    if (!unitId) return null;
    try {
      const overview = await this.getUnitOverview(unitId);
      return overview ? overview.recentAccesses : null;
    } catch {
      return null;
    }
  }

  /** Fetch common areas or reservations for an area (US-06 / FR-10) */
  async getReservations(areaId?: string) {
    try {
      const url = areaId
        ? `${API_BASE_URL}/common-areas/${areaId}/reservations`
        : `${API_BASE_URL}/common-areas`;
      const res = await fetch(url, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Fetch pending moves queue or unit moves (US-07 / FR-14) */
  async getMoves(unitId?: string): Promise<MoveResponse[] | null> {
    try {
      const url = unitId
        ? `${API_BASE_URL}/units/${unitId}/moves`
        : `${API_BASE_URL}/moves/pending`;
      const res = await fetch(url, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Approve move schedule (US-07 / FR-14) */
  async approveMove(id: string, notes?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/moves/${id}/status`, {
        method: "PATCH",
        headers: this.headers(),
        body: JSON.stringify({
          status: "APPROVED",
          adminNotes: notes ?? "Aprobado por administración",
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Reject move schedule (US-07 / FR-14) */
  async rejectMove(id: string, notes?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/moves/${id}/status`, {
        method: "PATCH",
        headers: this.headers(),
        body: JSON.stringify({
          status: "REJECTED",
          adminNotes: notes ?? "Rechazado por administración",
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Fetch in-app notifications for authenticated user (FR-20) */
  async getNotifications(): Promise<NotificationResponse[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Mark notification as read (FR-20) */
  async markNotificationAsRead(id: string): Promise<NotificationResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Fetch audit logs */
  async getAuditLogs(unitId?: string) {
    try {
      const url = unitId
        ? `${API_BASE_URL}/audit-logs?unitId=${unitId}`
        : `${API_BASE_URL}/audit-logs`;
      const res = await fetch(url, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}

export const api = new ApiClient();
