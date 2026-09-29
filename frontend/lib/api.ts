/** CondoTrack API Client & Integration Layer
 * 
 * Provides type-safe connectivity to the Spring Boot REST API
 * (http://localhost:8080/api/v1) with seamless fallback to prototype data
 * for guaranteed presentation robustness.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface AuthLoginResponse {
  token: string;
  type: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "CONCIERGE" | "RESIDENT";
  linkedUnitIds: number[];
}

export interface UnitOverviewResponse {
  unitId: number;
  unitIdentifier: string;
  unitFloor: string;
  buildingName: string;
  residents: Array<{
    id: number;
    fullName: string;
    email: string;
    phone: string;
    isOwner: boolean;
  }>;
  activeVisits: Array<{
    id: number;
    visitorName: string;
    visitorDni: string;
    visitDate: string;
    status: string;
  }>;
  pendingPackages: Array<{
    id: number;
    trackingCode: string;
    courier: string;
    status: string;
    receivedAt: string;
  }>;
  upcomingReservations: Array<{
    id: number;
    amenityName: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  moves: Array<{
    id: number;
    moveDate: string;
    direction: string;
    status: string;
  }>;
  incidents: Array<{
    id: number;
    title: string;
    status: string;
    reportedAt: string;
  }>;
  recentAuditLogs: Array<{
    id: number;
    action: string;
    entityName: string;
    entityId: string;
    username: string;
    timestamp: string;
    details: string;
  }>;
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
      const data: AuthLoginResponse = await res.json();
      if (data?.token) {
        this.setToken(data.token);
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
  async getUnitOverview(unitId: number): Promise<UnitOverviewResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/units/${unitId}/overview-360`, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Fetch packages */
  async getPackages(status?: string) {
    try {
      const url = status
        ? `${API_BASE_URL}/packages?status=${status}`
        : `${API_BASE_URL}/packages`;
      const res = await fetch(url, { headers: this.headers() });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Fetch visits */
  async getVisits(date?: string) {
    try {
      const url = date
        ? `${API_BASE_URL}/visits?date=${date}`
        : `${API_BASE_URL}/visits`;
      const res = await fetch(url, { headers: this.headers() });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Fetch reservations */
  async getReservations() {
    try {
      const res = await fetch(`${API_BASE_URL}/reservations`, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Fetch moves */
  async getMoves() {
    try {
      const res = await fetch(`${API_BASE_URL}/moves`, {
        headers: this.headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Approve move */
  async approveMove(id: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/moves/${id}/approve`, {
        method: "POST",
        headers: this.headers(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Reject move */
  async rejectMove(id: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/moves/${id}/reject`, {
        method: "POST",
        headers: this.headers(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Fetch audit logs */
  async getAuditLogs() {
    try {
      const res = await fetch(`${API_BASE_URL}/audit-logs`, {
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
