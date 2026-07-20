"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";
import { useAuth } from "../../contexts/auth.context";
import { supportApi, supportErrorMessage, ALL_ACCEPTED_MIME, maxBytesForMime, isVideoMime } from "../../lib/support.api";
import { TicketAttachments } from "../organisms/TicketAttachments/TicketAttachments";
import type {
    TicketCategory, TicketPriority, TicketStatus,
    TicketListItem, TicketDetail,
} from "../../api/types";

// ── Static config ─────────────────────────────────────────────────────────────

const CATEGORIES: { value: TicketCategory; label: string }[] = [
    { value: "duvida",   label: "Dúvida técnica" },
    { value: "bug",      label: "Bug / Erro no sistema" },
    { value: "melhoria", label: "Solicitação de melhoria" },
    { value: "acesso",   label: "Acesso / Permissão" },
    { value: "outros",   label: "Outros" },
];

const PRIORITIES: { value: TicketPriority; label: string; color: string }[] = [
    { value: "baixa",   label: "Baixa",   color: "#6B7280" },
    { value: "media",   label: "Média",   color: "#F59E0B" },
    { value: "alta",    label: "Alta",    color: "#EF4444" },
    { value: "urgente", label: "Urgente", color: "#7C3AED" },
];

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string }> = {
    aberto:     { label: "Aberto",      color: "#2563EB", bg: "#EFF6FF" },
    em_analise: { label: "Em análise",  color: "#D97706", bg: "#FFFBEB" },
    respondido: { label: "Respondido",  color: "#059669", bg: "#ECFDF5" },
    fechado:    { label: "Fechado",     color: "#6B7280", bg: "#F9FAFB" },
};

function formatDate(iso: string) {
    try { return new Date(iso).toLocaleDateString("pt-BR"); } catch { return iso; }
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PostCreateUpload = { name: string; status: "uploading" | "done" | "error"; error?: string };

// ── Staging de anexos (antes do ticket existir) ────────────────────────────
// Não existe endpoint que crie o ticket já com anexo — os arquivos ficam em
// memória aqui e só sobem (presign→PUT→complete, um por um) depois que o
// POST de criação do ticket retorna o id.
function AttachmentStagingArea({
    files, errors, isDragging,
    onFiles, onRemove, onDragOver, onDragLeave, onDrop,
    f, isDark, border, muted,
}: {
    files: File[];
    errors: string[];
    isDragging: boolean;
    onFiles: (files: FileList | File[]) => void;
    onRemove: (idx: number) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    f: ReturnType<typeof getFoundationByTheme>;
    isDark: boolean;
    border: string;
    muted: string;
}) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div>
            <label style={{ display: "block", fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.secondary, marginBottom: "0.5rem" }}>
                Anexos (opcional)
            </label>

            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                style={{
                    borderRadius: "0.9rem",
                    border: `1.5px dashed ${isDragging ? f.colors.brand.primary : border}`,
                    backgroundColor: isDragging
                        ? `${f.colors.brand.primary}0D`
                        : (isDark ? f.colors.bg.surface : "#FAFAFA"),
                    padding: "1.6rem", textAlign: "center", cursor: "pointer",
                    transition: "border-color 0.15s, background-color 0.15s",
                }}
            >
                <p style={{ fontSize: "1.3rem", color: f.colors.text.secondary, marginBottom: "0.2rem" }}>
                    Arraste arquivos aqui, clique para selecionar ou cole um print (Ctrl+V)
                </p>
                <p style={{ fontSize: "1.15rem", color: muted }}>
                    Imagem/documento até 10 MB · Vídeo até 100 MB
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={ALL_ACCEPTED_MIME.join(",")}
                    onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ""; }}
                    style={{ display: "none" }}
                />
            </div>

            {errors.length > 0 && (
                <div style={{ marginTop: "0.6rem" }}>
                    {errors.map((err, i) => (
                        <p key={i} style={{ fontSize: "1.15rem", color: f.colors.feedback.error, margin: "0.2rem 0" }}>{err}</p>
                    ))}
                </div>
            )}

            {files.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
                    {files.map((file, idx) => (
                        <div key={`${file.name}-${idx}`} style={{
                            display: "flex", alignItems: "center", gap: "0.8rem",
                            padding: "0.6rem 1rem", borderRadius: "0.7rem",
                            border: `1px solid ${border}`,
                            backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                {isVideoMime(file.type)
                                    ? <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></>
                                    : <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>
                                }
                            </svg>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "1.25rem", color: f.colors.text.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                                <div style={{ fontSize: "1.1rem", color: muted }}>{formatBytes(file.size)}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: "0.3rem", flexShrink: 0, display: "flex" }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SupportTicketPage() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const f       = getFoundationByTheme(theme);
    const isDark  = theme === "dark";
    const border  = f.colors.border.default;
    const muted   = f.colors.text.muted;
    const primary = f.colors.brand.primary;

    // ── Tickets list state ─────────────────────────────────────────────────
    const [tickets, setTickets]       = useState<TicketListItem[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError]   = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");

    // ── Create form state ──────────────────────────────────────────────────
    const [form, setForm] = useState({
        title:       "",
        category:    "" as TicketCategory | "",
        priority:    "media" as TicketPriority,
        description: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted]   = useState(false);
    const [errors, setErrors]         = useState<Record<string, string>>({});
    const [formError, setFormError]   = useState<string | null>(null);

    // ── Attachment staging (antes do ticket existir) ───────────────────────
    const [stagedFiles, setStagedFiles]   = useState<File[]>([]);
    const [stageErrors, setStageErrors]   = useState<string[]>([]);
    const [isDragging, setIsDragging]     = useState(false);
    const [postCreateUploads, setPostCreateUploads] = useState<PostCreateUpload[]>([]);

    // ── Detail modal state ─────────────────────────────────────────────────
    const [selectedDetail, setSelectedDetail] = useState<TicketDetail | null>(null);
    const [detailLoading, setDetailLoading]   = useState(false);
    const [detailError, setDetailError]       = useState<string | null>(null);

    // ── Reply state ────────────────────────────────────────────────────────
    const [replyMsg, setReplyMsg]     = useState("");
    const [replying, setReplying]     = useState(false);
    const [replyError, setReplyError] = useState<string | null>(null);

    // ── Load tickets ───────────────────────────────────────────────────────
    useEffect(() => {
        setListLoading(true);
        supportApi.listTickets({ limit: 50, sort: "created_at:desc" })
            .then((res) => { setTickets(res.data); setListError(null); })
            .catch((err) => setListError(supportErrorMessage(err)))
            .finally(() => setListLoading(false));
    }, []);

    // ── Helpers ────────────────────────────────────────────────────────────
    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.title.trim() || form.title.length < 5)
            e.title = "Título deve ter pelo menos 5 caracteres.";
        if (form.title.length > 255)
            e.title = "Título pode ter no máximo 255 caracteres.";
        if (!form.category)
            e.category = "Selecione uma categoria.";
        if (!form.description.trim() || form.description.length < 20)
            e.description = "Descreva o problema com pelo menos 20 caracteres.";
        return e;
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
        borderRadius: "1.2rem",
        border: `1px solid ${border}`,
        padding: "2rem",
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", height: "3.8rem",
        borderRadius: "0.8rem", border: `1px solid ${border}`,
        padding: "0 1.2rem",
        backgroundColor: isDark ? f.colors.bg.surface : "#FAFAFA",
        color: f.colors.text.primary,
        fontSize: "1.35rem", fontFamily: "inherit",
        outline: "none", boxSizing: "border-box",
    };

    const labelStyle: React.CSSProperties = {
        display: "block", fontSize: "1.2rem", fontWeight: 600,
        color: f.colors.text.secondary, marginBottom: "0.5rem",
    };

    // ── Actions ────────────────────────────────────────────────────────────

    const addStagedFiles = (incoming: FileList | File[]) => {
        const list = Array.from(incoming);
        const errs: string[] = [];
        const valid: File[] = [];
        for (const file of list) {
            if (!ALL_ACCEPTED_MIME.includes(file.type)) {
                errs.push(`"${file.name}": tipo de arquivo não suportado.`);
                continue;
            }
            const max = maxBytesForMime(file.type);
            if (file.size > max) {
                errs.push(`"${file.name}": muito grande (limite ${formatBytes(max)}).`);
                continue;
            }
            valid.push(file);
        }
        if (valid.length) setStagedFiles((prev) => [...prev, ...valid]);
        setStageErrors(errs);
    };

    const removeStagedFile = (idx: number) => {
        setStagedFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) addStagedFiles(e.dataTransfer.files);
    };

    // Cola print (Ctrl+V) em qualquer lugar do formulário — só intercepta
    // itens de arquivo/imagem; colar texto normal nos campos segue intacto.
    const handleFormPaste = (e: React.ClipboardEvent<HTMLFormElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        const files: File[] = [];
        for (const item of Array.from(items)) {
            if (item.kind === "file" && item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }
        if (files.length) addStagedFiles(files);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        setFormError(null);
        try {
            const ticket = await supportApi.createTicket({
                title:       form.title.trim(),
                category:    form.category as TicketCategory,
                priority:    form.priority,
                description: form.description.trim(),
            });
            setTickets((prev) => [ticket, ...prev]);
            setForm({ title: "", category: "", priority: "media", description: "" });
            setErrors({});
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 4000);

            // Anexos sobem depois — falha de um arquivo não desfaz o ticket já criado.
            const files = stagedFiles;
            setStagedFiles([]);
            setStageErrors([]);
            if (files.length > 0) {
                setPostCreateUploads(files.map((file) => ({ name: file.name, status: "uploading" })));
                for (const file of files) {
                    try {
                        await supportApi.uploadAttachment(ticket.id, file);
                        setPostCreateUploads((prev) => prev.map((u) =>
                            u.name === file.name && u.status === "uploading" ? { ...u, status: "done" } : u,
                        ));
                    } catch (err) {
                        setPostCreateUploads((prev) => prev.map((u) =>
                            u.name === file.name && u.status === "uploading" ? { ...u, status: "error", error: supportErrorMessage(err) } : u,
                        ));
                    }
                }
            }
        } catch (err) {
            setFormError(supportErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const openDetail = async (id: string) => {
        setDetailLoading(true);
        setDetailError(null);
        setReplyMsg("");
        setReplyError(null);
        try {
            const detail = await supportApi.getTicket(id);
            setSelectedDetail(detail);
        } catch (err) {
            setDetailError(supportErrorMessage(err));
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setSelectedDetail(null);
        setDetailError(null);
        setReplyMsg("");
        setReplyError(null);
    };

    // Identidade estável (deps vazias) — usada pelo polling de conversion_status
    // dentro de <TicketAttachments>, que re-dispara o efeito toda vez que a
    // referência de onRefresh mudar.
    const refreshDetail = useCallback(async () => {
        setSelectedDetail((prev) => {
            if (!prev) return prev;
            supportApi.getTicket(prev.id).then(setSelectedDetail).catch(() => {});
            return prev;
        });
    }, []);

    const handleReply = async () => {
        if (!selectedDetail || !replyMsg.trim()) return;
        setReplying(true);
        setReplyError(null);
        try {
            await supportApi.addResponse(selectedDetail.id, { message: replyMsg.trim() });
            const refreshed = await supportApi.getTicket(selectedDetail.id);
            setSelectedDetail(refreshed);
            setTickets((prev) => prev.map((t) =>
                t.id === refreshed.id
                    ? { ...t, status: refreshed.status, response_count: refreshed.responses.length, updated_at: refreshed.updated_at }
                    : t,
            ));
            setReplyMsg("");
        } catch (err) {
            setReplyError(supportErrorMessage(err));
        } finally {
            setReplying(false);
        }
    };

    // ── Derived ────────────────────────────────────────────────────────────
    const visible = filterStatus === "all"
        ? tickets
        : tickets.filter((t) => t.status === filterStatus);

    const statusCounts = tickets.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1;
        return acc;
    }, {} as Record<TicketStatus, number>);

    const isClosed = selectedDetail?.status === "fechado";

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "110rem" }}>

            {/* Header */}
            <div style={{ marginBottom: "2.4rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: muted, marginBottom: "0.4rem" }}>
                    Ajuda &amp; Suporte
                </p>
                <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                    Tickets de suporte
                </h1>
                <p style={{ fontSize: "1.4rem", color: muted }}>
                    Abra uma solicitação e acompanhe o progresso da sua dúvida ou problema.
                </p>
            </div>

            {/* Success banner */}
            {submitted && (
                <div style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    padding: "1.2rem 1.6rem", borderRadius: "1rem", marginBottom: "2rem",
                    backgroundColor: "#ECFDF5", border: "1px solid #059669",
                    color: "#059669", fontSize: "1.35rem", fontWeight: 500,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Chamado aberto! Você vai receber um e-mail de confirmação em breve.
                </div>
            )}

            {/* Post-create attachment upload status */}
            {postCreateUploads.length > 0 && (
                <div style={{
                    padding: "1.2rem 1.6rem", borderRadius: "1rem", marginBottom: "2rem",
                    border: `1px solid ${border}`,
                    backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                    display: "flex", flexDirection: "column", gap: "0.6rem",
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "1.2rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Envio dos anexos
                        </span>
                        <button
                            onClick={() => setPostCreateUploads([])}
                            style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: "0.2rem" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {postCreateUploads.map((u, i) => (
                        <div key={`${u.name}-${i}`} style={{ fontSize: "1.25rem", color: u.status === "error" ? f.colors.feedback.error : u.status === "done" ? f.colors.feedback.success : f.colors.text.secondary }}>
                            {u.status === "uploading" && `Enviando "${u.name}"...`}
                            {u.status === "done" && `✓ "${u.name}" enviado.`}
                            {u.status === "error" && `✗ "${u.name}": ${u.error ?? "falha no envio"}. Abra o ticket em "Meus tickets" pra tentar de novo.`}
                        </div>
                    ))}
                </div>
            )}

            <div className="grid-responsive" style={{ ["--grid-cols" as string]: "minmax(0,2fr) minmax(0,1.4fr)", gap: "2rem", alignItems: "start" } as React.CSSProperties}>

                {/* ── Create form ── */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: "1.7rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.6rem" }}>
                        Abrir novo ticket
                    </h2>
                    <p style={{ fontSize: "1.3rem", color: muted, marginBottom: "2rem" }}>
                        Preencha os campos abaixo com o máximo de detalhes possível.
                    </p>

                    {formError && (
                        <div style={{ padding: "1rem 1.4rem", borderRadius: "0.8rem", marginBottom: "1.6rem", backgroundColor: `${f.colors.feedback.error}15`, border: `1px solid ${f.colors.feedback.error}40`, color: f.colors.feedback.error, fontSize: "1.3rem" }}>
                            {formError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} onPaste={handleFormPaste} noValidate>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>

                            {/* Title */}
                            <div>
                                <label style={labelStyle}>Título <span style={{ color: f.colors.feedback.error }}>*</span></label>
                                <input
                                    style={{ ...inputStyle, borderColor: errors.title ? f.colors.feedback.error : border }}
                                    placeholder="Ex.: Erro ao importar extrato do mês de maio"
                                    value={form.title}
                                    maxLength={255}
                                    onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setErrors((p) => ({ ...p, title: "" })); }}
                                />
                                {errors.title && <p style={{ fontSize: "1.15rem", color: f.colors.feedback.error, marginTop: "0.4rem" }}>{errors.title}</p>}
                            </div>

                            {/* Category + Priority */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                                <div>
                                    <label style={labelStyle}>Categoria <span style={{ color: f.colors.feedback.error }}>*</span></label>
                                    <select
                                        style={{ ...inputStyle, borderColor: errors.category ? f.colors.feedback.error : border, cursor: "pointer" }}
                                        value={form.category}
                                        onChange={(e) => { setForm((p) => ({ ...p, category: e.target.value as TicketCategory })); setErrors((p) => ({ ...p, category: "" })); }}
                                    >
                                        <option value="">Selecione...</option>
                                        {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    {errors.category && <p style={{ fontSize: "1.15rem", color: f.colors.feedback.error, marginTop: "0.4rem" }}>{errors.category}</p>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Prioridade</label>
                                    <select
                                        style={{ ...inputStyle, cursor: "pointer" }}
                                        value={form.priority}
                                        onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TicketPriority }))}
                                    >
                                        {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label style={labelStyle}>Descrição detalhada <span style={{ color: f.colors.feedback.error }}>*</span></label>
                                <textarea
                                    rows={6}
                                    placeholder="Descreva o problema ou dúvida com detalhes: o que aconteceu, quais passos você seguiu e o que esperava que acontecesse."
                                    value={form.description}
                                    onChange={(e) => { setForm((p) => ({ ...p, description: e.target.value })); setErrors((p) => ({ ...p, description: "" })); }}
                                    style={{
                                        width: "100%", borderRadius: "0.8rem",
                                        border: `1px solid ${errors.description ? f.colors.feedback.error : border}`,
                                        padding: "1rem 1.2rem",
                                        backgroundColor: isDark ? f.colors.bg.surface : "#FAFAFA",
                                        color: f.colors.text.primary,
                                        fontSize: "1.35rem", fontFamily: "inherit",
                                        resize: "vertical", boxSizing: "border-box", outline: "none",
                                    }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem" }}>
                                    {errors.description
                                        ? <p style={{ fontSize: "1.15rem", color: f.colors.feedback.error }}>{errors.description}</p>
                                        : <span />
                                    }
                                    <span style={{ fontSize: "1.15rem", color: form.description.length < 20 ? f.colors.feedback.error : muted }}>
                                        {form.description.length} caracteres
                                    </span>
                                </div>
                            </div>

                            {/* Attachment staging */}
                            <AttachmentStagingArea
                                files={stagedFiles}
                                errors={stageErrors}
                                isDragging={isDragging}
                                onFiles={addStagedFiles}
                                onRemove={removeStagedFile}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                f={f} isDark={isDark} border={border} muted={muted}
                            />

                            {/* User info (read-only) */}
                            <div style={{
                                padding: "1.2rem", borderRadius: "0.8rem",
                                backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                                border: `1px solid ${border}`,
                                display: "flex", alignItems: "center", gap: "1rem",
                            }}>
                                <div style={{
                                    width: "3.2rem", height: "3.2rem", borderRadius: "50%",
                                    backgroundColor: primary, color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.3rem", fontWeight: 700, flexShrink: 0,
                                }}>
                                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                                </div>
                                <div>
                                    <div style={{ fontSize: "1.3rem", fontWeight: 600, color: f.colors.text.primary }}>{user?.name ?? "Usuário"}</div>
                                    <div style={{ fontSize: "1.2rem", color: muted }}>{user?.email ?? ""} · Ticket será associado à sua conta</div>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        backgroundColor: submitting ? `${primary}80` : primary,
                                        color: "#fff", border: "none", borderRadius: "0.9rem",
                                        padding: "0 2.4rem", height: "4rem",
                                        fontSize: "1.4rem", fontWeight: 600,
                                        cursor: submitting ? "not-allowed" : "pointer",
                                        fontFamily: "inherit",
                                        display: "flex", alignItems: "center", gap: "0.8rem",
                                    }}
                                >
                                    {submitting ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    )}
                                    {submitting ? "Enviando..." : "Enviar ticket"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* ── My Tickets ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>

                    {/* Status counts */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {(["aberto", "em_analise", "respondido", "fechado"] as TicketStatus[]).map((s) => {
                            const cfg = STATUS_CONFIG[s];
                            return (
                                <div key={s} style={{
                                    backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                                    border: `1px solid ${border}`, borderRadius: "1rem",
                                    padding: "1.2rem 1.4rem",
                                }}>
                                    <div style={{ fontSize: "2rem", fontWeight: 700, color: cfg.color }}>{statusCounts[s] ?? 0}</div>
                                    <div style={{ fontSize: "1.2rem", color: muted }}>{cfg.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tickets list */}
                    <div style={cardStyle}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.4rem" }}>
                            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: f.colors.text.primary }}>Meus tickets</h2>
                            <select
                                style={{
                                    height: "3rem", borderRadius: "0.7rem",
                                    border: `1px solid ${border}`, padding: "0 1rem",
                                    backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                                    color: f.colors.text.secondary, fontSize: "1.25rem",
                                    fontFamily: "inherit", cursor: "pointer",
                                }}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as TicketStatus | "all")}
                            >
                                <option value="all">Todos</option>
                                {(["aberto", "em_analise", "respondido", "fechado"] as TicketStatus[]).map((s) => (
                                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                ))}
                            </select>
                        </div>

                        {listLoading ? (
                            <div style={{ textAlign: "center", color: muted, fontSize: "1.35rem", padding: "3rem 0" }}>
                                Carregando tickets...
                            </div>
                        ) : listError ? (
                            <div style={{ textAlign: "center", color: f.colors.feedback.error, fontSize: "1.3rem", padding: "2rem 0" }}>
                                {listError}
                            </div>
                        ) : visible.length === 0 ? (
                            <div style={{ textAlign: "center", color: muted, fontSize: "1.35rem", padding: "3rem 0" }}>
                                Nenhum ticket encontrado.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                {visible.map((t) => {
                                    const scfg = STATUS_CONFIG[t.status];
                                    const prio = PRIORITIES.find((p) => p.value === t.priority);
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => openDetail(t.id)}
                                            style={{
                                                textAlign: "left", width: "100%",
                                                borderRadius: "0.9rem", border: `1px solid ${border}`,
                                                padding: "1.1rem 1.3rem",
                                                backgroundColor: "transparent",
                                                cursor: "pointer", fontFamily: "inherit",
                                            }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? "rgba(255,255,255,0.05)" : "#F9FAFB"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", marginBottom: "0.5rem" }}>
                                                <span style={{ fontSize: "1.1rem", color: muted, fontFamily: "monospace" }}>{t.ticket_code}</span>
                                                <span style={{
                                                    fontSize: "1.1rem", fontWeight: 600,
                                                    padding: "0.2rem 0.7rem", borderRadius: "999px",
                                                    color: scfg.color,
                                                    backgroundColor: isDark ? `${scfg.color}22` : scfg.bg,
                                                    whiteSpace: "nowrap",
                                                }}>{scfg.label}</span>
                                            </div>
                                            <div style={{ fontSize: "1.35rem", fontWeight: 600, color: f.colors.text.primary, marginBottom: "0.4rem" }}>{t.title}</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <span style={{ fontSize: "1.15rem", color: muted }}>{CATEGORIES.find((c) => c.value === t.category)?.label}</span>
                                                <span style={{ fontSize: "1.1rem", fontWeight: 600, color: prio?.color }}>{prio?.label}</span>
                                                {t.response_count > 0 && (
                                                    <span style={{ fontSize: "1.1rem", color: "#059669", fontWeight: 600 }}>
                                                        {t.response_count} resposta{t.response_count > 1 ? "s" : ""}
                                                    </span>
                                                )}
                                                <span style={{ fontSize: "1.1rem", color: muted, marginLeft: "auto" }}>{formatDate(t.created_at)}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Detail modal overlay ── */}
            {(detailLoading || selectedDetail) && (
                <div
                    onClick={closeDetail}
                    style={{
                        position: "fixed", inset: 0, zIndex: 1000,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "2rem",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                            borderRadius: "1.6rem", border: `1px solid ${border}`,
                            padding: "2.4rem",
                            width: "100%", maxWidth: "64rem",
                            maxHeight: "90vh", overflowY: "auto",
                        }}
                    >
                        {detailLoading ? (
                            <div style={{ textAlign: "center", color: muted, padding: "3rem 0", fontSize: "1.4rem" }}>
                                Carregando detalhes...
                            </div>
                        ) : detailError ? (
                            <div style={{ color: f.colors.feedback.error, padding: "2rem 0", textAlign: "center", fontSize: "1.3rem" }}>
                                {detailError}
                            </div>
                        ) : selectedDetail && (
                            <>
                                {/* Modal header */}
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
                                    <div>
                                        <span style={{ fontSize: "1.2rem", color: muted, fontFamily: "monospace" }}>{selectedDetail.ticket_code}</span>
                                        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: f.colors.text.primary, marginTop: "0.4rem" }}>{selectedDetail.title}</h2>
                                    </div>
                                    <button onClick={closeDetail} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: "0.4rem" }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                {/* Badges */}
                                <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginBottom: "1.6rem" }}>
                                    {([
                                        { label: STATUS_CONFIG[selectedDetail.status].label, color: STATUS_CONFIG[selectedDetail.status].color, bg: STATUS_CONFIG[selectedDetail.status].bg },
                                        { label: CATEGORIES.find((c) => c.value === selectedDetail.category)?.label ?? "", color: f.colors.text.secondary, bg: isDark ? f.colors.bg.surface : f.colors.bg.app },
                                        { label: PRIORITIES.find((p) => p.value === selectedDetail.priority)?.label ?? "", color: PRIORITIES.find((p) => p.value === selectedDetail.priority)?.color ?? muted, bg: isDark ? f.colors.bg.surface : f.colors.bg.app },
                                    ] as { label: string; color: string; bg: string }[]).map((tag) => (
                                        <span key={tag.label} style={{
                                            padding: "0.3rem 1rem", borderRadius: "999px", fontSize: "1.2rem", fontWeight: 600,
                                            color: tag.color, backgroundColor: isDark ? `${tag.color}22` : tag.bg,
                                            border: `1px solid ${tag.color}40`,
                                        }}>{tag.label}</span>
                                    ))}
                                    <span style={{ marginLeft: "auto", fontSize: "1.2rem", color: muted }}>Aberto em {formatDate(selectedDetail.created_at)}</span>
                                </div>

                                {/* Description */}
                                <div style={{ marginBottom: "1.6rem" }}>
                                    <p style={{ fontSize: "1.2rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>Descrição</p>
                                    <div style={{
                                        padding: "1.4rem", borderRadius: "0.9rem",
                                        backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                                        border: `1px solid ${border}`,
                                        fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.6,
                                    }}>
                                        {selectedDetail.description}
                                    </div>
                                </div>

                                {/* Responses */}
                                {selectedDetail.responses.length > 0 && (
                                    <div style={{ marginBottom: "1.6rem" }}>
                                        <p style={{ fontSize: "1.2rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>
                                            Respostas ({selectedDetail.responses.length})
                                        </p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                            {selectedDetail.responses.map((r) => (
                                                <div key={r.id} style={{
                                                    padding: "1.4rem", borderRadius: "0.9rem",
                                                    backgroundColor: isDark ? "#0D2E1D" : "#ECFDF5",
                                                    border: `1px solid ${f.colors.feedback.success}40`,
                                                }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                                                        <span style={{ fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.primary }}>{r.author.name}</span>
                                                        <span style={{ fontSize: "1.15rem", color: muted }}>{formatDate(r.created_at)}</span>
                                                    </div>
                                                    <div style={{ fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.6 }}>{r.message}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Attachments (lista + upload; upload só quando o ticket aceita resposta) */}
                                <TicketAttachments
                                    ticketId={selectedDetail.id}
                                    attachments={selectedDetail.attachments}
                                    onRefresh={refreshDetail}
                                    canUpload={!isClosed}
                                    f={f} isDark={isDark} border={border} muted={muted} primary={primary}
                                />

                                {/* Add reply */}
                                {!isClosed ? (
                                    <div style={{ borderTop: `1px solid ${border}`, paddingTop: "1.6rem" }}>
                                        <p style={{ fontSize: "1.2rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>
                                            Adicionar mensagem
                                        </p>
                                        {replyError && (
                                            <div style={{ padding: "0.8rem 1.2rem", borderRadius: "0.7rem", marginBottom: "1rem", backgroundColor: `${f.colors.feedback.error}15`, color: f.colors.feedback.error, fontSize: "1.25rem" }}>
                                                {replyError}
                                            </div>
                                        )}
                                        <textarea
                                            rows={4}
                                            placeholder="Escreva uma mensagem de acompanhamento..."
                                            value={replyMsg}
                                            onChange={(e) => setReplyMsg(e.target.value)}
                                            style={{
                                                width: "100%", borderRadius: "0.8rem",
                                                border: `1px solid ${border}`,
                                                padding: "1rem 1.2rem",
                                                backgroundColor: isDark ? f.colors.bg.surface : "#FAFAFA",
                                                color: f.colors.text.primary,
                                                fontSize: "1.35rem", fontFamily: "inherit",
                                                resize: "vertical", boxSizing: "border-box", outline: "none", marginBottom: "1rem",
                                            }}
                                        />

                                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                            <button
                                                onClick={handleReply}
                                                disabled={replying || !replyMsg.trim()}
                                                style={{
                                                    backgroundColor: replying || !replyMsg.trim() ? `${primary}60` : primary,
                                                    color: "#fff", border: "none", borderRadius: "0.9rem",
                                                    padding: "0 2rem", height: "3.8rem",
                                                    fontSize: "1.4rem", fontWeight: 600,
                                                    cursor: replying || !replyMsg.trim() ? "not-allowed" : "pointer",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                {replying ? "Enviando..." : "Enviar mensagem"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        borderTop: `1px solid ${border}`, paddingTop: "1.4rem",
                                        textAlign: "center", color: muted, fontSize: "1.3rem",
                                    }}>
                                        Este ticket está fechado e não aceita mais respostas.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
