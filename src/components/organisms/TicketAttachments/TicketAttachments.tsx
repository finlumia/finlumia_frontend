"use client";

import React, { useEffect, useRef, useState } from "react";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import {
    supportApi, supportErrorMessage,
    ALL_ACCEPTED_MIME, isVideoMime, maxBytesForMime,
} from "../../../lib/support.api";
import type { TicketAttachment } from "../../../api/types";

// Ticket detail é re-consultado enquanto houver vídeo pending/processing —
// a conversão roda assíncrona no backend, não há webhook/SSE para nos avisar.
const POLL_INTERVAL_MS = 4000;

// O backend devolve `url`/`thumbnail_url` como path relativo à raiz da API
// real (ex.: "/api/v1/support/tickets/:id/attachments/:attId/download") — o
// browser não tem acesso direto a esse host, só ao proxy Next.js. Precisa
// prefixar com "/proxy/support" antes de usar como src de <video>/<img>.
function toSupportProxyPath(path: string): string {
    return path.startsWith("/proxy/") ? path : `/proxy/support${path}`;
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
    ticketId:    string;
    attachments: TicketAttachment[];
    /** Parent re-busca o ticket e atualiza `attachments` — usado após upload e durante o polling. */
    onRefresh:   () => void | Promise<void>;
    canUpload:   boolean;
    f:           ReturnType<typeof getFoundationByTheme>;
    isDark:      boolean;
    border:      string;
    muted:       string;
    primary:     string;
};

export function TicketAttachments({ ticketId, attachments, onRefresh, canUpload, f, isDark, border, muted, primary }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploadPct, setUploadPct]     = useState(0);
    const [uploading, setUploading]     = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // ── Polling enquanto algum vídeo estiver pending/processing ────────────
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        const hasPending = attachments.some(
            (a) => a.conversion_status === "pending" || a.conversion_status === "processing",
        );
        if (!hasPending) {
            if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
            return;
        }
        if (pollingRef.current) return;
        pollingRef.current = setInterval(() => { onRefresh(); }, POLL_INTERVAL_MS);
        return () => {
            if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attachments]);

    const handleFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
        const file = ev.target.files?.[0];
        if (!file) return;

        if (!ALL_ACCEPTED_MIME.includes(file.type)) {
            setUploadError("Tipo de arquivo não suportado.");
            if (fileRef.current) fileRef.current.value = "";
            return;
        }
        const maxBytes = maxBytesForMime(file.type);
        if (file.size > maxBytes) {
            setUploadError(`Arquivo muito grande. Limite: ${formatBytes(maxBytes)}.`);
            if (fileRef.current) fileRef.current.value = "";
            return;
        }

        setUploading(true);
        setUploadPct(0);
        setUploadError(null);
        try {
            await supportApi.uploadAttachment(ticketId, file, undefined, setUploadPct);
            await onRefresh();
        } catch (err) {
            setUploadError(supportErrorMessage(err));
        } finally {
            setUploading(false);
            setUploadPct(0);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const handleDownload = (attachmentId: string, fileName: string) => {
        supportApi.downloadAttachment(ticketId, attachmentId, fileName).catch((err) => {
            setUploadError(supportErrorMessage(err));
        });
    };

    const rowStyle: React.CSSProperties = {
        display: "flex", alignItems: "center", gap: "1rem",
        padding: "0.9rem 1.2rem", borderRadius: "0.8rem",
        border: `1px solid ${border}`,
        backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
    };

    return (
        <div>
            {attachments.length > 0 && (
                <div style={{ marginBottom: "1.6rem" }}>
                    <p style={{ fontSize: "1.2rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>
                        Anexos ({attachments.length})
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {attachments.map((a) => {
                            const video = isVideoMime(a.mime_type);
                            const processing = video && (a.conversion_status === "pending" || a.conversion_status === "processing");
                            const failed = video && a.conversion_status === "failed";
                            const ready = !video || a.conversion_status === "completed";

                            return (
                                <div key={a.id} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                    <div style={rowStyle}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                            {video
                                                ? <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></>
                                                : <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>
                                            }
                                        </svg>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.file_name}</div>
                                            <div style={{ fontSize: "1.15rem", color: processing ? f.colors.feedback.warning : failed ? f.colors.feedback.error : muted }}>
                                                {processing ? "Processando vídeo…" : failed ? "Falha ao processar o vídeo." : formatBytes(a.file_size_bytes)}
                                            </div>
                                        </div>
                                        {ready && (
                                            <button
                                                onClick={() => handleDownload(a.id, a.file_name)}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: primary, fontSize: "1.25rem", fontFamily: "inherit", fontWeight: 600, padding: "0.4rem 0.8rem", borderRadius: "0.5rem", flexShrink: 0 }}
                                            >
                                                Download
                                            </button>
                                        )}
                                    </div>

                                    {video && a.conversion_status === "completed" && (
                                        <video
                                            controls
                                            preload="none"
                                            poster={a.thumbnail_url ? toSupportProxyPath(a.thumbnail_url) : undefined}
                                            src={toSupportProxyPath(a.url)}
                                            style={{ width: "100%", maxHeight: "24rem", borderRadius: "0.8rem", backgroundColor: "#000" }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {canUpload && (
                <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "1.15rem", color: muted, marginBottom: "0.5rem" }}>
                        Anexar arquivo (imagem/documento até 10 MB, vídeo até 100 MB)
                    </p>
                    {uploadError && (
                        <div style={{ fontSize: "1.2rem", color: f.colors.feedback.error, marginBottom: "0.5rem" }}>{uploadError}</div>
                    )}
                    {uploading && (
                        <div style={{ marginBottom: "0.8rem" }}>
                            <div style={{ height: "0.6rem", borderRadius: "999px", backgroundColor: isDark ? f.colors.bg.surface : "#E5E7EB", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${uploadPct}%`, backgroundColor: primary, transition: "width 0.2s" }} />
                            </div>
                            <span style={{ fontSize: "1.15rem", color: muted }}>{uploadPct}%</span>
                        </div>
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        accept={ALL_ACCEPTED_MIME.join(",")}
                        onChange={handleFileChange}
                        disabled={uploading}
                        style={{ fontSize: "1.2rem", color: f.colors.text.secondary, cursor: "pointer" }}
                    />
                </div>
            )}
        </div>
    );
}
