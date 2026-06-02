"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";

type Step = "token" | "password" | "success";

export function ResetPasswordPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [step, setStep] = useState<Step>("token");
    const [token, setToken] = useState(["", "", "", "", "", ""]);
    const [tokenError, setTokenError] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const cardBg = isDark ? f.colors.bg.surface : "#FFFFFF";
    const borderColor = f.colors.border.default;
    const primaryColor = f.colors.brand.primary;
    const mutedColor = f.colors.text.muted;

    const handleTokenInput = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...token];
        next[index] = value;
        setToken(next);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleTokenKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !token[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const validateToken = () => {
        if (token.join("").length < 6) {
            setTokenError("Digite o código completo de 6 dígitos.");
            return false;
        }
        setTokenError("");
        return true;
    };

    const validatePassword = () => {
        let valid = true;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError("Mínimo 8 caracteres, com letra maiúscula e número.");
            valid = false;
        } else {
            setPasswordError("");
        }
        if (password !== confirm) {
            setConfirmError("As senhas não coincidem.");
            valid = false;
        } else {
            setConfirmError("");
        }
        return valid;
    };

    const passwordStrength = (): { label: string; color: string; width: string } => {
        if (password.length === 0) return { label: "", color: "transparent", width: "0%" };
        if (password.length < 6) return { label: "Fraca", color: f.colors.feedback.error, width: "25%" };
        if (password.length < 8 || !/[A-Z]/.test(password)) return { label: "Média", color: f.colors.feedback.warning, width: "50%" };
        if (!/\d/.test(password) || !/[!@#$%^&*]/.test(password)) return { label: "Boa", color: f.colors.brand.primary, width: "75%" };
        return { label: "Forte", color: f.colors.feedback.success, width: "100%" };
    };

    const strength = passwordStrength();

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: f.colors.bg.app,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.4rem 1.6rem",
            fontFamily: f.typography.fontFamily.base,
        }}>
            <div style={{ width: "100%", maxWidth: "44rem" }}>
                {step !== "success" && (
                    <button
                        type="button"
                        onClick={() => step === "password" ? setStep("token") : router.push("/forgot-password")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            background: "none",
                            border: "none",
                            color: mutedColor,
                            fontSize: "1.3rem",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            marginBottom: "2rem",
                            padding: 0,
                        }}
                    >
                        ← Voltar
                    </button>
                )}

                <div style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "1.2rem",
                    padding: "3.2rem",
                    boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.08)",
                }}>
                    {/* Step: Token */}
                    {step === "token" && (
                        <>
                            <div style={{
                                width: "5.6rem", height: "5.6rem", borderRadius: "1.2rem",
                                backgroundColor: isDark ? f.colors.feedback.infoBg : "#E0EEF9",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                marginBottom: "2rem",
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>

                            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.6rem" }}>
                                Código de verificação
                            </h1>
                            <p style={{ fontSize: "1.4rem", color: mutedColor, marginBottom: "2.8rem", lineHeight: 1.6 }}>
                                Digite os 6 dígitos enviados para o seu e-mail.
                            </p>

                            {/* OTP Input */}
                            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", marginBottom: "0.8rem" }}>
                                {token.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleTokenInput(i, e.target.value)}
                                        onKeyDown={(e) => handleTokenKeyDown(i, e)}
                                        aria-label={`Dígito ${i + 1} do código`}
                                        style={{
                                            width: "4.8rem",
                                            height: "5.6rem",
                                            textAlign: "center",
                                            fontSize: "2rem",
                                            fontWeight: 700,
                                            borderRadius: "0.8rem",
                                            border: `2px solid ${tokenError ? f.colors.feedback.error : digit ? primaryColor : borderColor}`,
                                            backgroundColor: isDark ? f.colors.bg.elevated : "#F5F7FA",
                                            color: f.colors.text.primary,
                                            fontFamily: "inherit",
                                            outline: "none",
                                            transition: "border-color 0.15s ease",
                                        }}
                                    />
                                ))}
                            </div>

                            {tokenError && (
                                <p style={{ color: f.colors.feedback.error, fontSize: "1.2rem", textAlign: "center", marginBottom: "1.2rem" }}>
                                    ⚠ {tokenError}
                                </p>
                            )}

                            <Button
                                label="Verificar código"
                                type="button"
                                theme={theme}
                                variant="primary"
                                size="lg"
                                onClick={() => { if (validateToken()) setStep("password"); }}
                                styleConfig={{
                                    width: "100%",
                                    backgroudColor: primaryColor,
                                    textColor: "#FFFFFF",
                                    border: "none",
                                    borderRadius: "0.8rem",
                                    height: "4.4rem",
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                    display: "flex",
                                }}
                            />
                        </>
                    )}

                    {/* Step: New Password */}
                    {step === "password" && (
                        <>
                            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.6rem" }}>
                                Nova senha
                            </h1>
                            <p style={{ fontSize: "1.4rem", color: mutedColor, marginBottom: "2.4rem", lineHeight: 1.6 }}>
                                Escolha uma senha segura para proteger sua conta.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                                <div>
                                    <Input
                                        id="new-password"
                                        name="password"
                                        label="Nova senha"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        required
                                        theme={theme}
                                        error={passwordError}
                                        autoComplete="new-password"
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    {/* Strength meter */}
                                    {password.length > 0 && (
                                        <div style={{ marginTop: "0.6rem" }}>
                                            <div style={{ height: "4px", backgroundColor: borderColor, borderRadius: "2px", overflow: "hidden" }}>
                                                <div style={{
                                                    height: "100%",
                                                    width: strength.width,
                                                    backgroundColor: strength.color,
                                                    borderRadius: "2px",
                                                    transition: "width 0.3s ease, background-color 0.3s ease",
                                                }} />
                                            </div>
                                            <span style={{ fontSize: "1.1rem", color: strength.color, fontWeight: 600 }}>
                                                {strength.label}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Input
                                    id="confirm-password"
                                    name="confirm"
                                    label="Confirmar nova senha"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirm}
                                    required
                                    theme={theme}
                                    error={confirmError}
                                    autoComplete="new-password"
                                    onChange={(e) => setConfirm(e.target.value)}
                                />

                                {/* Requirements */}
                                <ul style={{ margin: 0, padding: "0 0 0 1.2rem", listStyle: "none" }}>
                                    {[
                                        { ok: password.length >= 8, label: "Mínimo de 8 caracteres" },
                                        { ok: /[A-Z]/.test(password), label: "Pelo menos uma letra maiúscula" },
                                        { ok: /\d/.test(password), label: "Pelo menos um número" },
                                    ].map((req) => (
                                        <li key={req.label} style={{
                                            fontSize: "1.2rem",
                                            color: req.ok ? f.colors.feedback.success : mutedColor,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.4rem",
                                            marginBottom: "0.2rem",
                                        }}>
                                            {req.ok ? "✓" : "○"} {req.label}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    label="Redefinir senha"
                                    type="button"
                                    theme={theme}
                                    variant="primary"
                                    size="lg"
                                    onClick={() => { if (validatePassword()) setStep("success"); }}
                                    styleConfig={{
                                        width: "100%",
                                        backgroudColor: primaryColor,
                                        textColor: "#FFFFFF",
                                        border: "none",
                                        borderRadius: "0.8rem",
                                        height: "4.4rem",
                                        fontSize: "1.5rem",
                                        fontWeight: "600",
                                        display: "flex",
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {/* Step: Success */}
                    {step === "success" && (
                        <div style={{ textAlign: "center" }}>
                            <div style={{
                                width: "6.4rem", height: "6.4rem", borderRadius: "50%",
                                backgroundColor: isDark ? f.colors.feedback.successBg : "#E6F4ED",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 2rem",
                            }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={f.colors.feedback.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </div>

                            <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.8rem" }}>
                                Senha redefinida!
                            </h1>
                            <p style={{ fontSize: "1.4rem", color: mutedColor, marginBottom: "2.8rem", lineHeight: 1.6 }}>
                                Sua senha foi alterada com sucesso. Agora você pode entrar na plataforma com a nova senha.
                            </p>

                            <Button
                                label="Ir para o login"
                                type="button"
                                theme={theme}
                                variant="primary"
                                size="lg"
                                onClick={() => router.push("/login")}
                                styleConfig={{
                                    width: "100%",
                                    backgroudColor: primaryColor,
                                    textColor: "#FFFFFF",
                                    border: "none",
                                    borderRadius: "0.8rem",
                                    height: "4.4rem",
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                    display: "flex",
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
