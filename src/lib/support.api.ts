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
  PresignAttachmentResponse,
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

  // Fluxo em 3 chamadas: 1) presign (pede URL assinada) 2) PUT direto no
  // storage (fora do proxy — o Content-Length do arquivo tem que bater
  // exatamente com fileSizeBytes enviado no passo 1) 3) complete (confirma
  // o upload e recebe o TicketAttachment já com conversion_status).
  async uploadAttachment(
    ticketId: string,
    file: File,
    responseId?: string,
    onProgress?: (pct: number) => void,
  ): Promise<TicketAttachment> {
    const presigned = await http.post<PresignAttachmentResponse>(
      buildUrl(e.presignAttachment, { ticketId }),
      { fileName: file.name, mimeType: file.type, fileSizeBytes: file.size, responseId: responseId ?? null },
    );

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presigned.upload_url);
      xhr.setRequestHeader("Content-Type", file.type);

      if (onProgress) {
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) onProgress(Math.round((ev.loaded / ev.total) * 90));
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject({ status: xhr.status, message: "Falha ao enviar arquivo para o armazenamento." });
      };
      xhr.onerror = () => reject({ message: "Erro de rede durante o upload." });
      xhr.send(file);
    });

    onProgress?.(95);
    const attachment = await http.post<TicketAttachment>(
      buildUrl(e.completeAttachment, { ticketId, attachmentId: presigned.attachment_id }),
      { fileName: file.name, mimeType: file.type, responseId: responseId ?? null },
    );
    onProgress?.(100);
    return attachment;
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
    const status = typeof e.status === "number" ? e.status : undefined;
    // 415/413 têm mensagem amigável fixa — a API pode devolver um texto
    // técnico (ex.: "Unsupported Media Type") que não ajuda o usuário final.
    if (status === 415) return "Tipo de arquivo não suportado";
    if (status === 413) return "Arquivo muito grande";
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
export const MAX_FILE_BYTES = 10_485_760; // 10 MB

export const ACCEPTED_VIDEO_MIME = ["video/mp4", "video/quicktime", "video/webm"];
export const MAX_VIDEO_BYTES = 104_857_600; // 100 MB — teto do proxy/CDN em produção

export const ALL_ACCEPTED_MIME = [...ACCEPTED_MIME, ...ACCEPTED_VIDEO_MIME];

export function isVideoMime(mimeType: string): boolean {
  return (ACCEPTED_VIDEO_MIME as string[]).includes(mimeType);
}

export function maxBytesForMime(mimeType: string): number {
  return isVideoMime(mimeType) ? MAX_VIDEO_BYTES : MAX_FILE_BYTES;
}
