/**
 * Client-side API functions for the Helpdesk support module.
 * All calls go through the Next.js proxy (/proxy/support/*) which adds
 * the real backend URL server-side.
 */

import { http } from "./http-client";
import { buildUrl, API_ENDPOINTS } from "@/api/Endpoints";
import type {
  TicketListItem,
  TicketDetail,
  TicketStats,
  TicketResponse,
  TicketAttachment,
  SupportPaginatedResponse,
  CreateTicketBody,
  PatchTicketBody,
  CreateResponseBody,
} from "@/api/types";

const e = API_ENDPOINTS.support;

export type TicketFilters = {
  status?:   string;
  category?: string;
  priority?: string;
  search?:   string;
  user_id?:  string;
  page?:     number;
  limit?:    number;
  sort?:     string;
};

function buildQs(filters: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const supportApi = {
  listTickets(filters: TicketFilters = {}) {
    return http.get<SupportPaginatedResponse<TicketListItem>>(
      `${e.listTickets.url}${buildQs(filters)}`,
    );
  },

  createTicket(body: CreateTicketBody) {
    return http.post<TicketListItem>(e.createTicket.url, body);
  },

  getStats(from?: string, to?: string) {
    return http.get<TicketStats>(
      `${e.getStats.url}${buildQs({ from, to })}`,
    );
  },

  getTicket(id: string) {
    return http.get<TicketDetail>(buildUrl(e.getTicket, { id }));
  },

  patchTicket(id: string, body: PatchTicketBody) {
    return http.patch<TicketListItem>(buildUrl(e.patchTicket, { id }), body);
  },

  deleteTicket(id: string) {
    return http.delete<void>(buildUrl(e.deleteTicket, { id }));
  },

  listResponses(ticketId: string) {
    return http.get<TicketResponse[]>(buildUrl(e.listResponses, { ticketId }));
  },

  addResponse(ticketId: string, body: CreateResponseBody) {
    return http.post<TicketResponse>(buildUrl(e.addResponse, { ticketId }), body);
  },

  uploadAttachment(
    ticketId: string,
    file: File,
    responseId?: string,
    onProgress?: (pct: number) => void,
  ): Promise<TicketAttachment> {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      if (responseId) form.append("response_id", responseId);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", buildUrl(e.addAttachment, { ticketId }));
      // O cookie HttpOnly é incluído automaticamente com withCredentials=true.
      // O proxy injeta o Authorization header antes de encaminhar ao backend.
      xhr.withCredentials = true;

      if (onProgress) {
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) onProgress(Math.round((ev.loaded / ev.total) * 100));
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as TicketAttachment);
        } else {
          try { reject(JSON.parse(xhr.responseText)); }
          catch { reject({ mensage: "Erro no upload." }); }
        }
      };
      xhr.onerror = () => reject({ mensage: "Erro de rede durante o upload." });
      xhr.send(form);
    });
  },

  async downloadAttachment(ticketId: string, attachmentId: string, fileName: string) {
    const url = buildUrl(e.downloadAttachment, { ticketId, attachmentId });
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error("Falha no download.");
    const blob   = await res.blob();
    const anchor = document.createElement("a");
    anchor.href  = URL.createObjectURL(blob);
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  },
};

// ── Error helper ───────────────────────────────────────────────────────────

export function supportErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.mensage === "string") return e.mensage;
    if (typeof e.message === "string") return e.message;
    if (typeof e.title === "string")   return e.title;
  }
  return "Ocorreu um erro inesperado.";
}

export const ACCEPTED_MIME = [
  "image/png", "image/jpeg", "image/webp",
  "application/pdf", "text/plain", "text/csv",
];
export const MAX_FILE_BYTES = 10_485_760;
