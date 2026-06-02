"use client";

import React, { useCallback, useRef, useState } from "react";
import { Modal } from "../Modal";
import { Button } from "../../atoms/button";
import { Input } from "../../atoms/input";
import {
    INSTITUTIONS, CATEGORIES, PAYMENT_METHODS,
    type Transaction, type InstitutionId, type CategoryId, type PaymentMethod,
} from "../../../config/transactions";
import { getFoundationByTheme } from "../../../shared/styles/tokens";
import type { ThemeMode } from "../../../shared/styles/theme.types";

type ImportStep = "upload" | "processing" | "review" | "done";

type OcrResult = {
    description: string;
    amount: string;
    date: string;
    category: CategoryId;
    method: PaymentMethod;
};

const MOCK_OCR: OcrResult = {
    description: "Extrato identificado via imagem",
    amount: "1.234,56",
    date: new Date().toISOString().slice(0, 10),
    category: "outros",
    method: "pix",
};

type UploadedFile = {
    file: File;
    isImage: boolean;
};

type ImportModalProps = {
    open: boolean;
    onClose: () => void;
    onImport: (transactions: Omit<Transaction, "id">[]) => void;
    theme?: ThemeMode;
};

const ALL_ACCEPTED = [".ofx", ".csv", ".png", ".jpg", ".jpeg", ".pdf"];

function fileIsImage(file: File) {
    return file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".pdf");
}

export function ImportModal({ open, onClose, onImport, theme = "dark" }: ImportModalProps) {
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<ImportStep>("upload");
    const [selectedInstitution, setSelectedInstitution] = useState<InstitutionId | "">("");
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [ocr, setOcr] = useState<OcrResult>(MOCK_OCR);
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
        ...chipBase,
        backgroundColor: isDark ? `${color}22` : `${color}15`,
        borderColor: color,
        color,
    });

    const handleFile = useCallback((file: File) => {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALL_ACCEPTED.includes(ext)) return;

        const img = fileIsImage(file);
        setUploadedFile({ file, isImage: img });

        if (img) {
            setStep("processing");
            setTimeout(() => {
                setOcr(MOCK_OCR);
                setOcrCategory(MOCK_OCR.category);
                setOcrMethod(MOCK_OCR.method);
                setStep("review");
            }, 2200);
        }
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleClose = () => {
        setStep("upload");
        setUploadedFile(null);
        setSelectedInstitution("");
        setIsDragging(false);
        onClose();
    };

    const handleConfirmOcr = () => {
        const raw = ocr.amount.replace(/\./g, "").replace(",", ".");
        const amt = parseFloat(raw);
        onImport([{
            type: "despesa",
            method: ocrMethod,
            institution: (selectedInstitution || "nubank") as InstitutionId,
            date: ocr.date,
            category: ocrCategory,
            description: ocr.description,
            amount: isNaN(amt) ? 0 : amt,
        }]);
        setStep("done");
    };

    const handleImportFile = () => {
        onImport([]);
        setStep("done");
    };

    // ── Footer by step ──────────────────────────────────────────────
    const renderFooter = () => {
        const cancelBtn = (label: string, onClick: () => void) => (
            <button type="button" onClick={onClick} style={{
                background: "none", border: "none", color: muted,
                fontSize: "1.4rem", cursor: "pointer",
                fontFamily: "inherit", padding: "0 1.2rem",
            }}>{label}</button>
        );

        if (step === "upload") {
            const canImport = !!uploadedFile && !uploadedFile.isImage;
            return (
                <>
                    {cancelBtn("Cancelar", handleClose)}
                    <Button label="Importar Dados" type="button" theme={theme} variant="primary" size="md"
                        disabled={!canImport} onClick={handleImportFile}
                        styleConfig={{ backgroudColor: primary, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }}
                    />
                </>
            );
        }
        if (step === "review") {
            return (
                <>
                    {cancelBtn("← Refazer", () => { setStep("upload"); setUploadedFile(null); })}
                    <Button label="Confirmar e Importar" type="button" theme={theme} variant="primary" size="md"
                        onClick={handleConfirmOcr}
                        styleConfig={{ backgroudColor: f.colors.feedback.success, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }}
                    />
                </>
            );
        }
        if (step === "done") {
            return (
                <Button label="Fechar" type="button" theme={theme} variant="primary" size="md"
                    onClick={handleClose}
                    styleConfig={{ backgroudColor: primary, textColor: "#fff", border: "none", borderRadius: "0.8rem", padding: "0 2.4rem" }}
                />
            );
        }
        return null;
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Importar Extrato Bancário"
            subtitle="Sistema de Importação"
            size="md"
            theme={theme}
            footer={renderFooter() ?? undefined}
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
                            <button type="button" title="Outra instituição"
                                style={{
                                    width: "4rem", height: "4rem", borderRadius: "0.8rem",
                                    border: `2px dashed ${border}`, backgroundColor: "transparent",
                                    color: muted, fontSize: "1.8rem", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}
                            >+</button>
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
                            ou{" "}
                            <span style={{ color: primary, fontWeight: 600 }}>clique para selecionar</span>
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

                    <p style={{ fontSize: "1.2rem", color: muted, textAlign: "center", marginTop: "-1rem" }}>
                        Tamanho máximo do arquivo: 10MB
                    </p>

                    {/* Uploaded file row */}
                    {uploadedFile && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: "1.2rem",
                            padding: "1.2rem 1.4rem", borderRadius: "0.8rem",
                            border: `1px solid ${border}`,
                            backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                        }}>
                            <span style={{ color: primary, flexShrink: 0 }}>
                                {uploadedFile.isImage ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" />
                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                )}
                            </span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "1.3rem", fontWeight: 600, color: f.colors.text.primary }}>
                                    {uploadedFile.file.name}
                                </div>
                                <div style={{ fontSize: "1.1rem", color: muted }}>
                                    {(uploadedFile.file.size / 1024).toFixed(1)} KB •{" "}
                                    <span style={{ color: uploadedFile.isImage ? f.colors.feedback.warning : f.colors.feedback.success }}>
                                        {uploadedFile.isImage ? "Processamento OCR ativado" : "Pronto para importar"}
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

                    {/* Info: image flow */}
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
                        Identificando dados da imagem...
                    </h3>
                    <p style={{ fontSize: "1.4rem", color: muted, lineHeight: 1.6 }}>
                        Estamos lendo as informações do extrato.
                        <br />Isso leva apenas alguns segundos.
                    </p>
                    <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.6rem", alignItems: "flex-start", maxWidth: "28rem", margin: "2rem auto 0" }}>
                        {["Analisando estrutura do documento...", "Extraindo campos: data, valor, descrição...", "Identificando categoria..."].map((msg, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "1.2rem", color: muted }}>
                                <div style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", backgroundColor: primary, flexShrink: 0 }} />
                                {msg}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── STEP: review ─────────────────────────────────────── */}
            {step === "review" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                    {/* Warning banner */}
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
                        type="text" value={ocr.description} theme={theme}
                        onChange={(e) => setOcr((p) => ({ ...p, description: e.target.value }))}
                    />

                    <div className="grid-pair" style={{ gap: "1.2rem" }}>
                        <Input id="ocr-amount" name="amount" label="Valor (R$)"
                            type="text" value={ocr.amount} theme={theme}
                            onChange={(e) => setOcr((p) => ({ ...p, amount: e.target.value }))}
                        />
                        <Input id="ocr-date" name="date" label="Data"
                            type="text" value={ocr.date} theme={theme}
                            onChange={(e) => setOcr((p) => ({ ...p, date: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.8rem" }}>
                            Categoria
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {CATEGORIES.map((cat) => {
                                const isActive = ocrCategory === cat.id;
                                return (
                                    <button key={cat.id} type="button"
                                        onClick={() => setOcrCategory(cat.id)}
                                        style={isActive
                                            ? activeChipStyle(cat.color)
                                            : inactiveChipStyle
                                        }
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "1.3rem", fontWeight: 500, color: f.colors.text.secondary, marginBottom: "0.8rem" }}>
                            Método de pagamento
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {PAYMENT_METHODS.map((m) => {
                                const isActive = ocrMethod === m.id;
                                return (
                                    <button key={m.id} type="button"
                                        onClick={() => setOcrMethod(m.id)}
                                        style={isActive ? activeChipStyle(primary) : inactiveChipStyle}
                                    >
                                        {m.label}
                                    </button>
                                );
                            })}
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
        </Modal>
    );
}
