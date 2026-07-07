"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "../Modal";
import { Button } from "../../atoms/button";
import { Input } from "../../atoms/input";
import {
    INSTITUTIONS, CATEGORIES, PAYMENT_METHODS,
    type InstitutionId, type CategoryId, type PaymentMethod,
} from "../../../config/transactions";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import { resolveCategoryColor } from "../../../config/categoryPalette";
import type { ThemeMode } from "../../../shared/styles/theme.types";
import { importService } from "../../../services/movimentation/movement.service";
import { parseMoney, maskCurrencyInput } from "../../../lib/money";
import type { OcrPreviewResult } from "../../../api/types";

type ImportStep = "upload" | "processing" | "review" | "done" | "error";

type ImportModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void | Promise<void>;
    theme?: ThemeMode;
};

const ALL_ACCEPTED = [".ofx", ".csv", ".png", ".jpg", ".jpeg", ".pdf"];

function fileIsImage(file: File) {
    return file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".pdf");
}

export function ImportModal({ open, onClose, onSuccess, theme = "dark" }: ImportModalProps) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [step, setStep] = useState<ImportStep>("upload");
    const [selectedInstitution, setSelectedInstitution] = useState<InstitutionId | "">("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isImage, setIsImage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [jobId, setJobId] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // OCR review state
    const [ocrData, setOcrData] = useState({ description: "", amount: "", date: "" });
    const [ocrCategory, setOcrCategory] = useState<CategoryId>("outros");
    const [ocrMethod, setOcrMethod] = useState<PaymentMethod>("pix");

    const primary = f.colors.brand.primary;
    const border = f.colors.border.default;
    const muted = f.colors.text.muted;
    const surfaceBg = isDark ? f.colors.bg.surface : f.colors.bg.elevated;

    const chipBase: React.CSSProperties = {
        display: "inline-flex", alignItems: "center",
        padding: "0.4rem 1rem", borderRadius: "999px",
        fontSize: "1.2rem", fontWeight: 500, cursor: "pointer",
        border: "1.5px solid", transition: "all 0.15s ease",
        fontFamily: f.typography.fontFamily.base,
        background: "none",
    };
    const inactiveChipStyle: React.CSSProperties = { ...chipBase, borderColor: border, color: muted };
    const activeChipStyle = (color: string): React.CSSProperties => ({
        ...chipBase, backgroundColor: isDark ? `${color}22` : `${color}15`, borderColor: color, color,
    });

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    // Poll job status
    useEffect(() => {
        if (step !== "processing" || !jobId) return;

        pollingRef.current = setInterval(async () => {
            try {
                const status = await importService.getJobStatus(jobId);

                if (status.status === "failed") {
                    stopPolling();
                    setErrorMsg("O processamento do arquivo falhou. Tente novamente.");
                    setStep("error");
                    return;
                }

                if (status.status === "completed" || status.status === "ready") {
                    stopPolling();
                    if (isImage) {
                        // OCR flow: populate review fields
                        const ocr = status as unknown as OcrPreviewResult;
                        if (ocr.extracted) {
                            setOcrData({
                                description: ocr.extracted.description,
                                amount: String(ocr.extracted.amount),
                                date: ocr.extracted.date,
                            });
                            setOcrCategory(ocr.extracted.category);
                            setOcrMethod(ocr.extracted.method);
                        }
                        setStep("review");
                    } else {
                        // File import flow: auto-confirm
                        await importService.confirmFileImport(jobId);
                        await onSuccess();
                        setStep("done");
                    }
                }
            } catch {
                stopPolling();
                setErrorMsg("Erro ao verificar status da importação.");
                setStep("error");
            }
        }, 2000);

        return () => stopPolling();
    }, [step, jobId, isImage, onSuccess, stopPolling]);

    const handleFile = useCallback(async (file: File) => {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALL_ACCEPTED.includes(ext)) return;

        const img = fileIsImage(file);
        setUploadedFile(file);
        setIsImage(img);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleClose = () => {
        stopPolling();
        setStep("upload");
        setUploadedFile(null);
        setSelectedInstitution("");
        setIsDragging(false);
        setJobId("");
        setErrorMsg("");
        onClose();
    };

    const handleUpload = async () => {
        if (!uploadedFile) return;
        setStep("processing");
        try {
            const res = await importService.upload(uploadedFile);
            setJobId(res.jobId);
        } catch (err: unknown) {
            setErrorMsg((err as { message?: string })?.message ?? "Falha ao enviar o arquivo.");
            setStep("error");
        }
    };

    const handleConfirmOcr = async () => {
        try {
            const parsedAmount = parseMoney(ocrData.amount);
            await importService.confirmOcr(jobId, {
                description: ocrData.description,
                amount: isNaN(parsedAmount) ? 0 : parsedAmount,
                date: ocrData.date,
                category: ocrCategory,
                method: ocrMethod,
                institution: (selectedInstitution || undefined) as InstitutionId | undefined,
            });
            await onSuccess();
            setStep("done");
        } catch (err: unknown) {
            setErrorMsg((err as { message?: string })?.message ?? "Erro ao confirmar importação.");
            setStep("error");
        }
    };

    // ── Footer by step ──────────────────────────────────────────────
    const cancelStyle: React.CSSProperties = {
        background: "none", border: "none", color: muted,
        fontSize: "1.4rem", cursor: "pointer",
        fontFamily: "inherit", padding: "0 1.2rem",
    };

    let footer: React.ReactNode = null;
    if (step === "upload") {
        footer = (
            <>
                <button type="button" onClick={handleClose} style={cancelStyle}>Cancelar</button>
                <Button label={isImage ? "Processar imagem" : "Importar dados"} type="button" theme={theme} variant="primary" size="md"
                    disabled={!uploadedFile} onClick={handleUpload}
                    styleConfig={{ backgroudColor: primary, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }}
                />
            </>
        );
    } else if (step === "review") {
        footer = (
            <>
                <button type="button" onClick={() => { setStep("upload"); setUploadedFile(null); }} style={cancelStyle}>← Refazer</button>
                <Button label="Confirmar e importar" type="button" theme={theme} variant="primary" size="md"
                    onClick={handleConfirmOcr}
                    styleConfig={{ backgroudColor: f.colors.feedback.success, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }}
                />
            </>
        );
    } else if (step === "error") {
        footer = (
            <>
                <button type="button" onClick={handleClose} style={cancelStyle}>Fechar</button>
                <Button label="Tentar novamente" type="button" theme={theme} variant="primary" size="md"
                    onClick={() => { setStep("upload"); setUploadedFile(null); setErrorMsg(""); }}
                    styleConfig={{ backgroudColor: primary, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }}
                />
            </>
        );
    } else if (step === "done") {
        footer = (
            <Button label="Fechar" type="button" theme={theme} variant="primary" size="md"
                onClick={handleClose}
                styleConfig={{ backgroudColor: primary, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }}
            />
        );
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Importar Extrato Bancário"
            subtitle="Sistema de Importação"
            size="md"
            theme={theme}
            footer={footer ?? undefined}
        >
            {/* ── STEP: upload ─────────────────────────────────────── */}
            {step === "upload" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Institution selector */}
                    <div>
                        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "1rem" }}>
                            Selecione a instituição financeira
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
                            {INSTITUTIONS.map((inst) => {
                                const isActive = selectedInstitution === inst.id;
                                return (
                                    <button key={inst.id} type="button" title={inst.label}
                                        onClick={() => setSelectedInstitution(inst.id)}
                                        aria-pressed={isActive} aria-label={inst.label}
                                        style={{
                                            width: "4rem", height: "4rem", borderRadius: "0.8rem",
                                            border: `2px solid ${isActive ? inst.color : border}`,
                                            backgroundColor: isActive ? inst.color : surfaceBg,
                                            color: isActive ? "#fff" : muted,
                                            fontSize: "1.0rem", fontWeight: 700,
                                            cursor: "pointer", transition: "all 0.15s ease",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontFamily: "inherit", flexShrink: 0,
                                        }}
                                    >
                                        {inst.abbr}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                        aria-label="Área de upload — clique ou arraste um arquivo"
                        style={{
                            border: `2px dashed ${isDragging ? primary : border}`,
                            borderRadius: "1.2rem", padding: "3.2rem 2rem",
                            textAlign: "center", cursor: "pointer",
                            backgroundColor: isDragging ? `${primary}10` : surfaceBg,
                            transition: "all 0.2s ease",
                        }}
                    >
                        <input
                            ref={fileInputRef} type="file"
                            accept={ALL_ACCEPTED.join(",")}
                            style={{ display: "none" }}
                            onChange={(e) => { const fi = e.target.files?.[0]; if (fi) handleFile(fi); }}
                        />
                        <div style={{ color: primary, marginBottom: "1.2rem" }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="12" y1="18" x2="12" y2="12" />
                                <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                        </div>
                        <p style={{ fontSize: "1.4rem", color: f.colors.text.secondary, marginBottom: "0.4rem" }}>
                            Arraste o arquivo OFX, CSV ou imagem aqui
                        </p>
                        <p style={{ fontSize: "1.3rem", color: muted }}>
                            ou <span style={{ color: primary, fontWeight: 600 }}>clique para selecionar</span>
                        </p>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.6rem", marginTop: "1.2rem", flexWrap: "wrap" }}>
                            {[".OFX", ".CSV", ".PNG/.JPG"].map((ext) => (
                                <span key={ext} style={{
                                    padding: "0.2rem 0.8rem", borderRadius: "0.4rem",
                                    border: `1px solid ${border}`, fontSize: "1.1rem",
                                    color: muted, fontFamily: f.typography.fontFamily.mono,
                                }}>{ext}</span>
                            ))}
                        </div>
                    </div>

                    {uploadedFile && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: "1.2rem",
                            padding: "1.2rem 1.4rem", borderRadius: "0.8rem",
                            border: `1px solid ${border}`,
                            backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                        }}>
                            <span style={{ color: primary, flexShrink: 0 }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "1.3rem", fontWeight: 600, color: f.colors.text.primary }}>{uploadedFile.name}</div>
                                <div style={{ fontSize: "1.1rem", color: muted }}>
                                    {(uploadedFile.size / 1024).toFixed(1)} KB •{" "}
                                    <span style={{ color: isImage ? f.colors.feedback.warning : f.colors.feedback.success }}>
                                        {isImage ? "Processamento OCR ativado" : "Pronto para importar"}
                                    </span>
                                </div>
                            </div>
                            <button type="button"
                                onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                                style={{ background: "none", border: "none", color: muted, cursor: "pointer", padding: "0.2rem" }}
                                aria-label="Remover arquivo"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {!uploadedFile && (
                        <div style={{
                            display: "flex", alignItems: "flex-start", gap: "0.8rem",
                            padding: "1rem 1.2rem", borderRadius: "0.8rem",
                            backgroundColor: isDark ? f.colors.feedback.infoBg : "#E0EEF9",
                            border: `1px solid ${primary}30`,
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "0.1rem" }}>
                                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                            </svg>
                            <p style={{ fontSize: "1.2rem", color: f.colors.text.secondary, lineHeight: 1.5 }}>
                                <strong>Imagem de extrato?</strong> Envie uma foto ou print do extrato — faremos a leitura automática dos dados (OCR) e você poderá revisar antes de confirmar.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── STEP: processing ─────────────────────────────────── */}
            {step === "processing" && (
                <div style={{ textAlign: "center", padding: "5rem 0" }}>
                    <div style={{ display: "inline-block", marginBottom: "2rem" }}>
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
                            stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ animation: "spin 1s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                    <h3 style={{ fontSize: "1.8rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.8rem" }}>
                        {isImage ? "Identificando dados da imagem..." : "Processando arquivo..."}
                    </h3>
                    <p style={{ fontSize: "1.4rem", color: muted, lineHeight: 1.6 }}>
                        {isImage ? "Estamos lendo as informações do extrato." : "Analisando e importando as transações."}<br />Isso leva apenas alguns segundos.
                    </p>
                </div>
            )}

            {/* ── STEP: review (OCR) ───────────────────────────────── */}
            {step === "review" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                    <div style={{
                        display: "flex", alignItems: "flex-start", gap: "1rem",
                        padding: "1.2rem 1.4rem", borderRadius: "0.8rem",
                        backgroundColor: isDark ? f.colors.feedback.warningBg : "#FFF3E0",
                        border: `1px solid ${f.colors.feedback.warning}50`,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke={f.colors.feedback.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ flexShrink: 0, marginTop: "0.1rem" }}>
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <path d="M12 9v4M12 17h.01" />
                        </svg>
                        <div>
                            <p style={{ fontSize: "1.3rem", fontWeight: 600, color: f.colors.feedback.warning, marginBottom: "0.2rem" }}>
                                Dados extraídos via OCR — revise antes de confirmar
                            </p>
                            <p style={{ fontSize: "1.2rem", color: muted }}>
                                A leitura automática pode conter imprecisões. Edite os campos abaixo se necessário.
                            </p>
                        </div>
                    </div>

                    <Input id="ocr-description" name="description" label="Descrição identificada"
                        type="text" value={ocrData.description} theme={theme}
                        onChange={(e) => setOcrData((p) => ({ ...p, description: e.target.value }))}
                    />
                    <div className="grid-pair" style={{ gap: "1.2rem" }}>
                        <Input id="ocr-amount" name="amount" label="Valor (R$)"
                            type="text" inputMode="decimal" value={ocrData.amount} theme={theme}
                            onChange={(e) => setOcrData((p) => ({ ...p, amount: maskCurrencyInput(e.target.value) }))}
                        />
                        <Input id="ocr-date" name="date" label="Data"
                            type="date" value={ocrData.date} theme={theme}
                            onChange={(e) => setOcrData((p) => ({ ...p, date: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.8rem" }}>Categoria</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {CATEGORIES.map((cat) => (
                                <button key={cat.id} type="button" onClick={() => setOcrCategory(cat.id)}
                                    style={ocrCategory === cat.id ? activeChipStyle(resolveCategoryColor(cat.id, theme, cat.color).fg) : inactiveChipStyle}>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.8rem" }}>Método de pagamento</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {PAYMENT_METHODS.map((m) => (
                                <button key={m.id} type="button" onClick={() => setOcrMethod(m.id)}
                                    style={ocrMethod === m.id ? activeChipStyle(primary) : inactiveChipStyle}>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP: done ───────────────────────────────────────── */}
            {step === "done" && (
                <div style={{ textAlign: "center", padding: "3.2rem 0" }}>
                    <div style={{
                        width: "6.4rem", height: "6.4rem", borderRadius: "50%",
                        backgroundColor: isDark ? f.colors.feedback.successBg : "#E6F4ED",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 2rem",
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                            stroke={f.colors.feedback.success} strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.8rem" }}>
                        Importação concluída!
                    </h3>
                    <p style={{ fontSize: "1.4rem", color: muted }}>
                        Os dados foram importados com sucesso para suas movimentações.
                    </p>
                </div>
            )}

            {/* ── STEP: error ──────────────────────────────────────── */}
            {step === "error" && (
                <div style={{ textAlign: "center", padding: "3.2rem 0" }}>
                    <div style={{
                        width: "6.4rem", height: "6.4rem", borderRadius: "50%",
                        backgroundColor: isDark ? f.colors.feedback.errorBg : "#FEE2E2",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 2rem",
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                            stroke={f.colors.feedback.error} strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.8rem" }}>
                        Falha na importação
                    </h3>
                    <p style={{ fontSize: "1.4rem", color: muted }}>{errorMsg}</p>
                </div>
            )}
        </Modal>
    );
}
