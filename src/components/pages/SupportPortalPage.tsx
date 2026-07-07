"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";
import { useAuth } from "../../contexts/auth.context";
import { supportApi, supportErrorMessage } from "../../lib/support.api";
import type {
    TicketCategory, TicketPriority, TicketStatus,
    TicketListItem, TicketDetail, TicketStats,
} from "../../api/types";

// ── Static config ─────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<TicketCategory, string> = {
    duvida:    "Dúvida técnica",
    bug:       "Bug / Erro",
    melhoria:  "Melhoria",
    acesso:    "Acesso",
    outros:    "Outros",
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
    baixa:   { label: "Baixa",   color: "#6B7280" },
    media:   { label: "Média",   color: "#F59E0B" },
    alta:    { label: "Alta",    color: "#EF4444" },
    urgente: { label: "Urgente", color: "#7C3AED" },
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string }> = {
    aberto:     { label: "Aberto",      color: "#2563EB", bg: "#EFF6FF" },
    em_analise: { label: "Em análise",  color: "#D97706", bg: "#FFFBEB" },
    respondido: { label: "Respondido",  color: "#059669", bg: "#ECFDF5" },
    fechado:    { label: "Fechado",     color: "#6B7280", bg: "#F9FAFB" },
};

const KANBAN_STATUSES: TicketStatus[] = ["aberto", "em_analise", "respondido", "fechado"];

function formatDate(iso: string) {
    try { return new Date(iso).toLocaleDateString("pt-BR"); } catch { return iso; }
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function KanbanIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="11" rx="1" />
        </svg>
    );
}

function ListIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    );
}

// ── Access Denied ────────────────────────────────────────────────────────────

function AccessDenied({ f, isDark }: { f: ReturnType<typeof getFoundationByTheme>; isDark: boolean }) {
    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "60rem" }}>
            <div style={{
                backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                border: `1px solid ${f.colors.feedback.error}40`,
                borderRadius: "1.6rem", padding: "3.2rem", textAlign: "center",
            }}>
                <div style={{ fontSize: "4rem", marginBottom: "1.6rem" }}>🔒</div>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.8rem" }}>
                    Acesso restrito
                </h1>
                <p style={{ fontSize: "1.4rem", color: f.colors.text.muted, lineHeight: 1.6 }}>
                    O Portal de Suporte está disponível apenas para usuários com perfil <strong>Administrador</strong> ou <strong>Gerente</strong>.
                </p>
            </div>
        </div>
    );
}

// ── Kanban Card ───────────────────────────────────────────────────────────────

interface KanbanCardProps {
    ticket: TicketListItem;
    isDark: boolean;
    f: ReturnType<typeof getFoundationByTheme>;
    border: string;
    primary: string;
    onSelect: (t: TicketListItem) => void;
    draggingId: string | null;
    setDraggingId: (id: string | null) => void;
}

function KanbanCard({ ticket: t, isDark, f, border, primary, onSelect, draggingId, setDraggingId }: KanbanCardProps) {
    const pcfg     = PRIORITY_CONFIG[t.priority];
    const isDragging = draggingId === t.id;

    return (
        <div
            draggable
            onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setDraggingId(t.id); }}
            onDragEnd={() => setDraggingId(null)}
            onClick={() => onSelect(t)}
            style={{
                backgroundColor: isDark ? f.colors.bg.surface : "#FFFFFF",
                borderRadius: "1rem", border: `1px solid ${border}`,
                borderLeft: `4px solid ${pcfg.color}`,
                padding: "1.2rem 1.4rem",
                cursor: isDragging ? "grabbing" : "grab",
                opacity: isDragging ? 0.35 : 1,
                transition: "box-shadow 0.15s, opacity 0.1s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                userSelect: "none",
            }}
            onMouseEnter={(e) => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.10)"; }}
            onMouseLeave={(e) => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.7rem" }}>
                <span style={{ fontSize: "1.05rem", fontFamily: "monospace", color: f.colors.text.muted }}>{t.ticket_code}</span>
                <span style={{
                    fontSize: "1.0rem", padding: "0.2rem 0.65rem", borderRadius: "0.4rem",
                    backgroundColor: isDark ? `${pcfg.color}25` : `${pcfg.color}18`,
                    color: pcfg.color, fontWeight: 700, whiteSpace: "nowrap",
                }}>{pcfg.label}</span>
            </div>
            <p style={{
                fontSize: "1.3rem", fontWeight: 600, color: f.colors.text.primary,
                marginBottom: "0.5rem", lineHeight: 1.45,
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            } as React.CSSProperties}>{t.title}</p>
            <p style={{ fontSize: "1.1rem", color: f.colors.text.muted, marginBottom: "1.1rem" }}>
                {CATEGORY_LABELS[t.category]}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                        width: "2.2rem", height: "2.2rem", borderRadius: "50%",
                        backgroundColor: primary + "22",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", fontWeight: 700, color: primary,
                    }}>
                        {t.user.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: "1.15rem", color: f.colors.text.secondary, fontWeight: 500 }}>
                        {t.user.name.split(" ")[0]}
                    </span>
                </div>
                <span style={{ fontSize: "1.0rem", color: f.colors.text.muted }}>{formatDate(t.created_at)}</span>
            </div>
            {t.response_count > 0 && (
                <div style={{
                    marginTop: "0.9rem", padding: "0.4rem 0.8rem",
                    backgroundColor: isDark ? "#05966918" : "#ECFDF5",
                    borderRadius: "0.5rem",
                    fontSize: "1.05rem", color: "#059669", fontWeight: 600,
                }}>
                    ✓ {t.response_count} resposta{t.response_count > 1 ? "s" : ""}
                </div>
            )}
        </div>
    );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────

interface KanbanColumnProps {
    status: TicketStatus;
    tickets: TicketListItem[];
    isDark: boolean;
    f: ReturnType<typeof getFoundationByTheme>;
    border: string;
    primary: string;
    onSelect: (t: TicketListItem) => void;
    draggingId: string | null;
    setDraggingId: (id: string | null) => void;
    dragOverCol: TicketStatus | null;
    setDragOverCol: (s: TicketStatus | null) => void;
    onDrop: (status: TicketStatus) => void;
}

function KanbanColumn({ status, tickets, isDark, f, border, primary, onSelect, draggingId, setDraggingId, dragOverCol, setDragOverCol, onDrop }: KanbanColumnProps) {
    const cfg       = STATUS_CONFIG[status];
    const isOver    = dragOverCol === status && draggingId !== null;
    const colTickets = tickets.filter((t) => t.status === status);

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverCol(status); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}
            onDrop={(e) => { e.preventDefault(); onDrop(status); setDragOverCol(null); }}
            style={{
                minWidth: "27rem", flex: "1 1 27rem",
                display: "flex", flexDirection: "column",
                borderRadius: "1.2rem",
                border: isOver ? `2px dashed ${cfg.color}` : `1px solid ${border}`,
                backgroundColor: isDark
                    ? (isOver ? `${cfg.color}14` : f.colors.bg.elevated)
                    : (isOver ? `${cfg.color}08` : "#F8FAFC"),
                transition: "border-color 0.12s, background-color 0.12s",
                overflow: "hidden", maxHeight: "calc(100vh - 34rem)", minHeight: "22rem",
            }}
        >
            <div style={{
                padding: "1.1rem 1.4rem", borderBottom: `1px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                backgroundColor: isDark ? `${cfg.color}18` : `${cfg.color}10`, flexShrink: 0,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                    <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "50%", backgroundColor: cfg.color }} />
                    <span style={{ fontSize: "1.2rem", fontWeight: 700, color: cfg.color, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {cfg.label}
                    </span>
                </div>
                <span style={{ backgroundColor: cfg.color, color: "#fff", borderRadius: "999px", padding: "0.1rem 0.75rem", fontSize: "1.1rem", fontWeight: 700 }}>
                    {colTickets.length}
                </span>
            </div>
            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem", overflowY: "auto", flex: 1 }}>
                {colTickets.length === 0 ? (
                    <div style={{
                        padding: "2.4rem 1rem", textAlign: "center",
                        color: f.colors.text.muted, fontSize: "1.2rem",
                        border: `1.5px dashed ${border}`, borderRadius: "0.8rem", opacity: 0.6,
                    }}>
                        {isOver ? "↓ Soltar aqui" : "Sem tickets"}
                    </div>
                ) : (
                    colTickets.map((t) => (
                        <KanbanCard key={t.id} ticket={t} isDark={isDark} f={f} border={border} primary={primary}
                            onSelect={onSelect} draggingId={draggingId} setDraggingId={setDraggingId} />
                    ))
                )}
                {isOver && colTickets.length > 0 && (
                    <div style={{
                        padding: "1rem", textAlign: "center",
                        border: `1.5px dashed ${cfg.color}`, borderRadius: "0.8rem",
                        color: cfg.color, fontSize: "1.2rem", fontWeight: 600,
                        backgroundColor: `${cfg.color}10`,
                    }}>
                        ↓ Mover para {cfg.label}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Portal Content ────────────────────────────────────────────────────────────

function PortalContent({
    f, isDark, border, muted, primary, isAdmin,
}: {
    f: ReturnType<typeof getFoundationByTheme>;
    isDark: boolean; border: string; muted: string; primary: string; isAdmin: boolean;
}) {
    const [tickets, setTickets]         = useState<TicketListItem[]>([]);
    const [stats, setStats]             = useState<TicketStats | null>(null);
    const [loading, setLoading]         = useState(true);
    const [loadError, setLoadError]     = useState<string | null>(null);

    const [filterStatus,   setFilterStatus]   = useState<TicketStatus | "all">("all");
    const [filterCategory, setFilterCategory] = useState<TicketCategory | "all">("all");
    const [filterPriority, setFilterPriority] = useState<TicketPriority | "all">("all");
    const [search, setSearch]                 = useState("");
    const [viewMode, setViewMode]             = useState<"kanban" | "table">("kanban");
    const [draggingId, setDraggingId]         = useState<string | null>(null);
    const [dragOverCol, setDragOverCol]       = useState<TicketStatus | null>(null);

    // ── Detail modal ───────────────────────────────────────────────────────
    const [selected, setSelected]         = useState<TicketDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError]   = useState<string | null>(null);

    // ── Response form ──────────────────────────────────────────────────────
    const [replyMsg, setReplyMsg]         = useState("");
    const [isInternal, setIsInternal]     = useState(false);
    const [newStatus, setNewStatus]       = useState<TicketStatus>("respondido");
    const [replying, setReplying]         = useState(false);
    const [replyError, setReplyError]     = useState<string | null>(null);

    // ── Patch form ─────────────────────────────────────────────────────────
    const [patchPriority, setPatchPriority] = useState<TicketPriority>("media");
    const [patchAssigned, setPatchAssigned] = useState("");
    const [patching, setPatching]           = useState(false);
    const [patchError, setPatchError]       = useState<string | null>(null);

    // ── Delete ─────────────────────────────────────────────────────────────
    const [deleting, setDeleting]           = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // ── Load data ──────────────────────────────────────────────────────────
    const loadAll = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const [listRes, statsRes] = await Promise.all([
                supportApi.listTickets({ limit: 100, sort: "created_at:desc" }),
                supportApi.getStats(),
            ]);
            setTickets(listRes.data);
            setStats(statsRes);
        } catch (err) {
            setLoadError(supportErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    // ── Derived ────────────────────────────────────────────────────────────
    const visible = useMemo(() => {
        return tickets.filter((t) => {
            if (filterStatus   !== "all" && t.status   !== filterStatus)   return false;
            if (filterCategory !== "all" && t.category !== filterCategory) return false;
            if (filterPriority !== "all" && t.priority !== filterPriority) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    t.title.toLowerCase().includes(q) ||
                    t.user.name.toLowerCase().includes(q) ||
                    t.ticket_code.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [tickets, filterStatus, filterCategory, filterPriority, search]);

    // ── Actions ────────────────────────────────────────────────────────────

    const openDetail = async (t: TicketListItem) => {
        setDetailLoading(true);
        setDetailError(null);
        setReplyMsg("");
        setReplyError(null);
        setPatchError(null);
        setConfirmDelete(false);
        try {
            const detail = await supportApi.getTicket(t.id);
            setSelected(detail);
            setPatchPriority(detail.priority);
            setPatchAssigned(detail.assigned_to ?? "");
            setNewStatus(detail.status === "fechado" ? "fechado" : "respondido");
            setIsInternal(false);
        } catch (err) {
            setDetailError(supportErrorMessage(err));
        } finally {
            setDetailLoading(false);
        }
    };

    const closeModal = () => {
        setSelected(null);
        setDetailError(null);
        setReplyMsg("");
        setReplyError(null);
        setPatchError(null);
        setConfirmDelete(false);
    };

    const handleDragDrop = async (targetStatus: TicketStatus) => {
        if (!draggingId) return;
        const ticket = tickets.find((t) => t.id === draggingId);
        if (!ticket || ticket.status === targetStatus) { setDraggingId(null); return; }
        setTickets((prev) => prev.map((t) => t.id === draggingId ? { ...t, status: targetStatus } : t));
        setDraggingId(null);
        try {
            await supportApi.patchTicket(ticket.id, { status: targetStatus });
        } catch {
            setTickets((prev) => prev.map((t) => t.id === ticket.id ? { ...t, status: ticket.status } : t));
        }
    };

    const handleTableStatusChange = async (id: string, status: TicketStatus) => {
        const prev = tickets.find((t) => t.id === id);
        setTickets((list) => list.map((t) => t.id === id ? { ...t, status } : t));
        try {
            await supportApi.patchTicket(id, { status });
        } catch {
            if (prev) setTickets((list) => list.map((t) => t.id === id ? { ...t, status: prev.status } : t));
        }
    };

    const handlePatch = async () => {
        if (!selected) return;
        setPatching(true);
        setPatchError(null);
        try {
            const updated = await supportApi.patchTicket(selected.id, {
                priority:    patchPriority,
                assigned_to: patchAssigned.trim() || null,
            });
            setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
            setSelected((prev) => prev ? { ...prev, priority: updated.priority, assigned_to: updated.assigned_to } : null);
        } catch (err) {
            setPatchError(supportErrorMessage(err));
        } finally {
            setPatching(false);
        }
    };

    const handleReply = async () => {
        if (!selected || !replyMsg.trim()) return;
        setReplying(true);
        setReplyError(null);
        try {
            await supportApi.addResponse(selected.id, {
                message:     replyMsg.trim(),
                is_internal: isInternal,
                new_status:  newStatus,
            });
            const refreshed = await supportApi.getTicket(selected.id);
            setSelected(refreshed);
            setTickets((prev) => prev.map((t) =>
                t.id === refreshed.id
                    ? { ...t, status: refreshed.status, response_count: refreshed.responses.length, updated_at: refreshed.updated_at }
                    : t,
            ));
            setReplyMsg("");
            setIsInternal(false);
        } catch (err) {
            setReplyError(supportErrorMessage(err));
        } finally {
            setReplying(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setDeleting(true);
        try {
            await supportApi.deleteTicket(selected.id);
            setTickets((prev) => prev.filter((t) => t.id !== selected.id));
            closeModal();
        } catch (err) {
            setPatchError(supportErrorMessage(err));
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    // ── Styles ─────────────────────────────────────────────────────────────
    const cardStyle: React.CSSProperties = {
        backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
        borderRadius: "1.2rem", border: `1px solid ${border}`,
    };

    const selectStyle: React.CSSProperties = {
        height: "3.4rem", borderRadius: "0.7rem",
        border: `1px solid ${border}`, padding: "0 1rem",
        backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
        color: f.colors.text.secondary, fontSize: "1.3rem",
        fontFamily: "inherit", cursor: "pointer",
    };

    const viewBtn = (mode: "kanban" | "table", label: string, icon: React.ReactNode) => (
        <button key={mode} onClick={() => setViewMode(mode)} style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1.2rem", borderRadius: "0.6rem",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: "1.25rem", fontWeight: 600,
            backgroundColor: viewMode === mode ? primary : "transparent",
            color: viewMode === mode ? "#fff" : muted,
            transition: "all 0.15s",
        }}>
            {icon}{label}
        </button>
    );

    // ── Render ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, textAlign: "center", padding: "6rem 0", color: muted }}>
                Carregando tickets...
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "60rem" }}>
                <div style={{ ...cardStyle, padding: "2.4rem", textAlign: "center" }}>
                    <p style={{ color: f.colors.feedback.error, fontSize: "1.4rem", marginBottom: "1.6rem" }}>{loadError}</p>
                    <button onClick={loadAll} style={{ backgroundColor: primary, color: "#fff", border: "none", borderRadius: "0.8rem", padding: "0.8rem 2rem", fontSize: "1.3rem", cursor: "pointer", fontFamily: "inherit" }}>
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "140rem" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.4rem", flexWrap: "wrap", gap: "1.2rem" }}>
                <div>
                    <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: muted, marginBottom: "0.4rem" }}>
                        Administração · Suporte
                    </p>
                    <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                        Portal de Suporte
                    </h1>
                    <p style={{ fontSize: "1.4rem", color: muted }}>
                        Gerencie e responda os tickets abertos pelos usuários da plataforma.
                    </p>
                </div>
                <div style={{
                    display: "flex", alignItems: "center", gap: "0.25rem",
                    padding: "0.3rem", borderRadius: "0.8rem",
                    border: `1px solid ${border}`,
                    backgroundColor: isDark ? f.colors.bg.elevated : "#F8FAFC",
                    alignSelf: "flex-end",
                }}>
                    {viewBtn("kanban", "Kanban", <KanbanIcon />)}
                    {viewBtn("table", "Lista", <ListIcon />)}
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.2rem", marginBottom: "2.4rem" }}>
                {[
                    { label: "Total",       value: stats?.total ?? tickets.length,                   color: f.colors.text.primary },
                    { label: "Abertos",     value: stats?.by_status.aberto ?? 0,                     color: "#2563EB" },
                    { label: "Em análise",  value: stats?.by_status.em_analise ?? 0,                 color: "#D97706" },
                    { label: "Respondidos", value: stats?.by_status.respondido ?? 0,                 color: "#059669" },
                    { label: "Fechados",    value: stats?.by_status.fechado ?? 0,                    color: "#6B7280" },
                ].map((s) => (
                    <div key={s.label} style={{ ...cardStyle, padding: "1.4rem 1.8rem" }}>
                        <div style={{ fontSize: "2.4rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: "1.2rem", color: muted }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Avg resolution */}
            {stats?.avg_resolution_hours != null && (
                <div style={{ ...cardStyle, padding: "1rem 2rem", marginBottom: "1.6rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "1.3rem", color: muted }}>Tempo médio de resolução:</span>
                    <span style={{ fontSize: "1.4rem", fontWeight: 700, color: f.colors.text.primary }}>
                        {stats.avg_resolution_hours.toFixed(1)}h
                    </span>
                </div>
            )}

            {/* Filters */}
            <div style={{ ...cardStyle, padding: "1.4rem 2rem", marginBottom: "1.6rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                <input
                    placeholder="Buscar por código, título ou usuário…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1, minWidth: "20rem", height: "3.4rem",
                        borderRadius: "0.7rem", border: `1px solid ${border}`,
                        padding: "0 1.2rem",
                        backgroundColor: isDark ? f.colors.bg.surface : "#FAFAFA",
                        color: f.colors.text.primary, fontSize: "1.3rem", fontFamily: "inherit", outline: "none",
                    }}
                />
                <select style={selectStyle} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TicketStatus | "all")}>
                    <option value="all">Todos os status</option>
                    {(["aberto", "em_analise", "respondido", "fechado"] as TicketStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                </select>
                <select style={selectStyle} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as TicketCategory | "all")}>
                    <option value="all">Todas as categorias</option>
                    {(Object.keys(CATEGORY_LABELS) as TicketCategory[]).map((c) => (
                        <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                </select>
                <select style={selectStyle} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TicketPriority | "all")}>
                    <option value="all">Todas as prioridades</option>
                    {(Object.keys(PRIORITY_CONFIG) as TicketPriority[]).map((p) => (
                        <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                    ))}
                </select>
                <span style={{ fontSize: "1.25rem", color: muted, whiteSpace: "nowrap" }}>
                    {visible.length} resultado{visible.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Kanban Board ── */}
            {viewMode === "kanban" && (
                <div style={{ display: "flex", gap: "1.4rem", overflowX: "auto", paddingBottom: "1.2rem", alignItems: "flex-start" }}>
                    {KANBAN_STATUSES.map((status) => (
                        <KanbanColumn
                            key={status} status={status} tickets={visible}
                            isDark={isDark} f={f} border={border} primary={primary}
                            onSelect={openDetail}
                            draggingId={draggingId} setDraggingId={setDraggingId}
                            dragOverCol={dragOverCol} setDragOverCol={setDragOverCol}
                            onDrop={handleDragDrop}
                        />
                    ))}
                </div>
            )}

            {/* ── Table / Lista view ── */}
            {viewMode === "table" && (
                <div style={{ ...cardStyle, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1.3rem" }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${border}` }}>
                                    {["Código", "Usuário", "Título", "Categoria", "Prioridade", "Status", "Abertura", "Ações"].map((h) => (
                                        <th key={h} style={{
                                            padding: "1.2rem 1.4rem", textAlign: "left",
                                            fontSize: "1.15rem", fontWeight: 600,
                                            color: muted, textTransform: "uppercase", letterSpacing: "0.06em",
                                            whiteSpace: "nowrap",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {visible.length === 0 ? (
                                    <tr><td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: muted }}>Nenhum ticket encontrado.</td></tr>
                                ) : visible.map((t, idx) => {
                                    const scfg = STATUS_CONFIG[t.status];
                                    const pcfg = PRIORITY_CONFIG[t.priority];
                                    return (
                                        <tr key={t.id}
                                            style={{ borderBottom: idx < visible.length - 1 ? `1px solid ${border}` : "none" }}
                                            onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = isDark ? "rgba(255,255,255,0.03)" : "#FAFAFA"; }}
                                            onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent"; }}
                                        >
                                            <td style={{ padding: "1.2rem 1.4rem", fontFamily: "monospace", color: muted, whiteSpace: "nowrap" }}>{t.ticket_code}</td>
                                            <td style={{ padding: "1.2rem 1.4rem", whiteSpace: "nowrap" }}>
                                                <div style={{ fontWeight: 600, color: f.colors.text.primary }}>{t.user.name}</div>
                                                <div style={{ fontSize: "1.15rem", color: muted }}>{t.user.email}</div>
                                            </td>
                                            <td style={{ padding: "1.2rem 1.4rem", maxWidth: "28rem" }}>
                                                <div style={{ color: f.colors.text.primary, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                                            </td>
                                            <td style={{ padding: "1.2rem 1.4rem", whiteSpace: "nowrap", color: f.colors.text.secondary }}>{CATEGORY_LABELS[t.category]}</td>
                                            <td style={{ padding: "1.2rem 1.4rem", whiteSpace: "nowrap" }}>
                                                <span style={{ fontWeight: 600, color: pcfg.color }}>{pcfg.label}</span>
                                            </td>
                                            <td style={{ padding: "1.2rem 1.4rem", whiteSpace: "nowrap" }}>
                                                <select
                                                    value={t.status}
                                                    onChange={(e) => handleTableStatusChange(t.id, e.target.value as TicketStatus)}
                                                    style={{
                                                        padding: "0.3rem 0.8rem", borderRadius: "999px",
                                                        border: `1px solid ${scfg.color}40`,
                                                        backgroundColor: isDark ? `${scfg.color}22` : scfg.bg,
                                                        color: scfg.color, fontSize: "1.15rem",
                                                        fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                                    }}
                                                >
                                                    {(["aberto", "em_analise", "respondido", "fechado"] as TicketStatus[]).map((s) => (
                                                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={{ padding: "1.2rem 1.4rem", whiteSpace: "nowrap", color: muted }}>{formatDate(t.created_at)}</td>
                                            <td style={{ padding: "1.2rem 1.4rem", whiteSpace: "nowrap" }}>
                                                <button onClick={() => openDetail(t)} style={{
                                                    backgroundColor: primary, color: "#fff",
                                                    border: "none", borderRadius: "0.6rem",
                                                    padding: "0.5rem 1.2rem", fontSize: "1.2rem",
                                                    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                                }}>
                                                    Abrir
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Detail modal ── */}
            {(detailLoading || selected) && (
                <div onClick={closeModal} style={{
                    position: "fixed", inset: 0, zIndex: 1000,
                    backgroundColor: "rgba(0,0,0,0.55)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "2rem",
                }}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                        borderRadius: "1.6rem", border: `1px solid ${border}`,
                        padding: "2.4rem",
                        width: "100%", maxWidth: "68rem",
                        maxHeight: "92vh", overflowY: "auto",
                    }}>
                        {detailLoading ? (
                            <div style={{ textAlign: "center", color: muted, padding: "3rem 0", fontSize: "1.4rem" }}>
                                Carregando detalhes...
                            </div>
                        ) : detailError ? (
                            <div style={{ color: f.colors.feedback.error, padding: "2rem 0", textAlign: "center", fontSize: "1.3rem" }}>{detailError}</div>
                        ) : selected && (
                            <>
                                {/* Modal header */}
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.4rem" }}>
                                            <span style={{ fontSize: "1.2rem", color: muted, fontFamily: "monospace" }}>{selected.ticket_code}</span>
                                            <span style={{
                                                fontSize: "1.1rem", padding: "0.2rem 0.7rem", borderRadius: "0.5rem",
                                                backgroundColor: isDark ? `${PRIORITY_CONFIG[selected.priority].color}25` : `${PRIORITY_CONFIG[selected.priority].color}18`,
                                                color: PRIORITY_CONFIG[selected.priority].color, fontWeight: 700,
                                            }}>{PRIORITY_CONFIG[selected.priority].label}</span>
                                            <span style={{
                                                fontSize: "1.1rem", padding: "0.2rem 0.7rem", borderRadius: "0.5rem",
                                                backgroundColor: isDark ? `${STATUS_CONFIG[selected.status].color}22` : STATUS_CONFIG[selected.status].bg,
                                                color: STATUS_CONFIG[selected.status].color, fontWeight: 600,
                                            }}>{STATUS_CONFIG[selected.status].label}</span>
                                        </div>
                                        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.3rem" }}>{selected.title}</h2>
                                        <p style={{ fontSize: "1.3rem", color: muted }}>{selected.user.name} · {selected.user.email}</p>
                                    </div>
                                    <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: muted, alignSelf: "flex-start" }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                {/* Description */}
                                <div style={{
                                    padding: "1.4rem", borderRadius: "0.9rem", marginBottom: "2rem",
                                    backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                                    border: `1px solid ${border}`,
                                    fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.6,
                                }}>
                                    <p style={{ fontSize: "1.2rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>
                                        Descrição
                                    </p>
                                    {selected.description}
                                </div>

                                {/* Responses */}
                                {selected.responses.length > 0 && (
                                    <div style={{ marginBottom: "2rem" }}>
                                        <p style={{ fontSize: "1.2rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>
                                            Histórico ({selected.responses.length})
                                        </p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                            {selected.responses.map((r) => (
                                                <div key={r.id} style={{
                                                    padding: "1.2rem 1.4rem", borderRadius: "0.9rem",
                                                    backgroundColor: r.is_internal
                                                        ? (isDark ? "#2D1B00" : "#FFFBEB")
                                                        : (isDark ? f.colors.bg.surface : f.colors.bg.app),
                                                    border: `1px solid ${r.is_internal ? "#D9770640" : border}`,
                                                }}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                            <span style={{ fontSize: "1.2rem", fontWeight: 600, color: f.colors.text.primary }}>{r.author.name}</span>
                                                            <span style={{ fontSize: "1.1rem", color: muted }}>({r.author.role})</span>
                                                            {r.is_internal && (
                                                                <span style={{ fontSize: "1.05rem", padding: "0.1rem 0.6rem", borderRadius: "0.4rem", backgroundColor: "#D9770620", color: "#D97706", fontWeight: 600 }}>
                                                                    Nota interna
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: "1.15rem", color: muted }}>{formatDate(r.created_at)}</span>
                                                    </div>
                                                    <div style={{ fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.6 }}>{r.message}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Patch controls */}
                                <div style={{ ...cardStyle, padding: "1.6rem", marginBottom: "2rem" }}>
                                    <p style={{ fontSize: "1.2rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1.2rem" }}>
                                        Atualizar ticket
                                    </p>
                                    {patchError && (
                                        <div style={{ padding: "0.8rem 1.2rem", borderRadius: "0.7rem", marginBottom: "1rem", backgroundColor: `${f.colors.feedback.error}15`, color: f.colors.feedback.error, fontSize: "1.25rem" }}>
                                            {patchError}
                                        </div>
                                    )}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.2rem", alignItems: "flex-end" }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "1.15rem", fontWeight: 600, color: f.colors.text.secondary, marginBottom: "0.4rem" }}>Prioridade</label>
                                            <select
                                                value={patchPriority}
                                                onChange={(e) => setPatchPriority(e.target.value as TicketPriority)}
                                                style={{ ...selectStyle, height: "3.2rem" }}
                                            >
                                                {(Object.keys(PRIORITY_CONFIG) as TicketPriority[]).map((p) => (
                                                    <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ flex: 1, minWidth: "16rem" }}>
                                            <label style={{ display: "block", fontSize: "1.15rem", fontWeight: 600, color: f.colors.text.secondary, marginBottom: "0.4rem" }}>Atribuído a</label>
                                            <input
                                                value={patchAssigned}
                                                onChange={(e) => setPatchAssigned(e.target.value)}
                                                maxLength={100}
                                                placeholder="Nome do responsável (deixe vazio para desatribuir)"
                                                style={{
                                                    height: "3.2rem", borderRadius: "0.7rem",
                                                    border: `1px solid ${border}`, padding: "0 1rem",
                                                    backgroundColor: isDark ? f.colors.bg.surface : "#FAFAFA",
                                                    color: f.colors.text.primary, fontSize: "1.3rem",
                                                    fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box",
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={handlePatch}
                                            disabled={patching}
                                            style={{
                                                backgroundColor: patching ? `${primary}60` : primary,
                                                color: "#fff", border: "none", borderRadius: "0.7rem",
                                                padding: "0 1.6rem", height: "3.2rem",
                                                fontSize: "1.3rem", fontWeight: 600,
                                                cursor: patching ? "not-allowed" : "pointer", fontFamily: "inherit",
                                            }}
                                        >
                                            {patching ? "Salvando..." : "Salvar"}
                                        </button>
                                    </div>
                                </div>

                                {/* Add response */}
                                <div style={{ marginBottom: "2rem" }}>
                                    <p style={{ fontSize: "1.2rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>
                                        Responder
                                    </p>
                                    {replyError && (
                                        <div style={{ padding: "0.8rem 1.2rem", borderRadius: "0.7rem", marginBottom: "1rem", backgroundColor: `${f.colors.feedback.error}15`, color: f.colors.feedback.error, fontSize: "1.25rem" }}>
                                            {replyError}
                                        </div>
                                    )}
                                    <textarea
                                        rows={5}
                                        placeholder={isInternal ? "Nota interna (não visível ao usuário)…" : "Digite a resposta ao usuário…"}
                                        value={replyMsg}
                                        onChange={(e) => setReplyMsg(e.target.value)}
                                        style={{
                                            width: "100%", borderRadius: "0.8rem",
                                            border: `1px solid ${isInternal ? "#D97706" : border}`,
                                            padding: "1rem 1.2rem",
                                            backgroundColor: isInternal
                                                ? (isDark ? "#2D1B00" : "#FFFBEB")
                                                : (isDark ? f.colors.bg.surface : "#FAFAFA"),
                                            color: f.colors.text.primary,
                                            fontSize: "1.35rem", fontFamily: "inherit",
                                            resize: "vertical", boxSizing: "border-box", outline: "none", marginBottom: "1rem",
                                        }}
                                    />
                                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", flexWrap: "wrap" }}>
                                        {/* Internal note checkbox */}
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "1.3rem", color: f.colors.text.secondary }}>
                                            <input
                                                type="checkbox"
                                                checked={isInternal}
                                                onChange={(e) => setIsInternal(e.target.checked)}
                                                style={{ width: "1.6rem", height: "1.6rem", cursor: "pointer" }}
                                            />
                                            Nota interna
                                        </label>

                                        {/* New status */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                            <label style={{ fontSize: "1.3rem", fontWeight: 600, color: f.colors.text.secondary }}>Novo status:</label>
                                            <select
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                                                style={{ ...selectStyle, height: "3.2rem" }}
                                            >
                                                {(["aberto", "em_analise", "respondido", "fechado"] as TicketStatus[]).map((s) => (
                                                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            onClick={handleReply}
                                            disabled={replying || !replyMsg.trim()}
                                            style={{
                                                marginLeft: "auto",
                                                backgroundColor: replying || !replyMsg.trim() ? `${primary}60` : primary,
                                                color: "#fff", border: "none", borderRadius: "0.9rem",
                                                padding: "0 2rem", height: "3.8rem",
                                                fontSize: "1.4rem", fontWeight: 600,
                                                cursor: replying || !replyMsg.trim() ? "not-allowed" : "pointer",
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            {replying ? "Enviando..." : "Salvar resposta"}
                                        </button>
                                    </div>
                                </div>

                                {/* Delete (admin only) */}
                                {isAdmin && (
                                    <div style={{ borderTop: `1px solid ${border}`, paddingTop: "1.6rem" }}>
                                        {!confirmDelete ? (
                                            <button
                                                onClick={() => setConfirmDelete(true)}
                                                style={{
                                                    backgroundColor: "transparent",
                                                    color: f.colors.feedback.error,
                                                    border: `1px solid ${f.colors.feedback.error}40`,
                                                    borderRadius: "0.7rem", padding: "0.6rem 1.4rem",
                                                    fontSize: "1.25rem", cursor: "pointer", fontFamily: "inherit",
                                                }}
                                            >
                                                Excluir ticket
                                            </button>
                                        ) : (
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <span style={{ fontSize: "1.3rem", color: f.colors.text.secondary }}>
                                                    Confirmar exclusão permanente?
                                                </span>
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={deleting}
                                                    style={{
                                                        backgroundColor: f.colors.feedback.error,
                                                        color: "#fff", border: "none", borderRadius: "0.7rem",
                                                        padding: "0.6rem 1.4rem", fontSize: "1.25rem",
                                                        cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit",
                                                    }}
                                                >
                                                    {deleting ? "Excluindo..." : "Sim, excluir"}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(false)}
                                                    style={{
                                                        backgroundColor: "transparent", color: muted,
                                                        border: `1px solid ${border}`, borderRadius: "0.7rem",
                                                        padding: "0.6rem 1.4rem", fontSize: "1.25rem",
                                                        cursor: "pointer", fontFamily: "inherit",
                                                    }}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        )}
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

// ── Exported Component ────────────────────────────────────────────────────────

export function SupportPortalPage() {
    const { theme } = useTheme();
    const { user }  = useAuth();
    const f       = getFoundationByTheme(theme);
    const isDark  = theme === "dark";
    const border  = f.colors.border.default;
    const muted   = f.colors.text.muted;
    const primary = f.colors.brand.primary;

    const isAdmin   = user?.role === "admin";
    const canAccess = isAdmin || user?.role === "gerente";

    if (!canAccess) return <AccessDenied f={f} isDark={isDark} />;

    return (
        <PortalContent
            f={f} isDark={isDark} border={border}
            muted={muted} primary={primary} isAdmin={isAdmin}
        />
    );
}
