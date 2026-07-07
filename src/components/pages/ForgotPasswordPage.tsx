"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { getAppBackground } from "../../shared/styles/appBackground";
import { useTheme } from "../../shared/styles/theme.context";
import { authService } from "../../services/identification/auth.service";

type Step = "email" | "sent";

export function ForgotPasswordPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Informe um e-mail válido.");
            return false;
        }
        setEmailError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setApiError("");
        setIsLoading(true);
        try {
            await authService.forgotPassword({ email });
            // Salva o email na sessão para a tela de redefinição usar
            sessionStorage.setItem("finlumia:reset_email", email);
            setStep("sent");
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Erro ao enviar o código. Tente novamente.";
            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const cardBg = isDark ? f.colors.bg.surface : "#FFFFFF";
    const borderColor = f.colors.border.default;
    const primaryColor = f.colors.brand.primary;
    const mutedColor = f.colors.text.muted;

    return (
        <div style={{
            minHeight: "100vh",
            ...getAppBackground(theme),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.4rem 1.6rem",
            fontFamily: f.typography.fontFamily.base,
        }}>
            <div style={{ width: "100%", maxWidth: "44rem" }}>
                {/* Back */}
                <button
                    type="button"
                    onClick={() => router.push("/login")}
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
                    ← Voltar para login
                </button>

                <div style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: "1.2rem",
                    padding: "3.2rem",
                    boxShadow: isDark ? "none" : "0 4px 24px rgba(0,0,0,0.08)",
                }}>
                    {step === "email" ? (
                        <>
                            <div style={{
                                width: "5.6rem",
                                height: "5.6rem",
                                borderRadius: "1.2rem",
                                backgroundColor: isDark ? f.colors.feedback.infoBg : "#E0EEF9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "2rem",
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </div>

                            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.6rem" }}>
                                Recuperar senha
                            </h1>
                            <p style={{ fontSize: "1.4rem", color: mutedColor, marginBottom: "2.4rem", lineHeight: 1.6 }}>
                                Digite o e-mail associado à sua conta. Enviaremos um código de verificação para você redefinir sua senha.
                            </p>

                            {apiError && (
                                <div style={{
                                    backgroundColor: isDark ? f.colors.feedback.errorBg : "#FEF2F2",
                                    border: `1px solid ${f.colors.feedback.error}`,
                                    borderRadius: "0.8rem",
                                    padding: "1.2rem 1.6rem",
                                    marginBottom: "1.6rem",
                                    fontSize: "1.3rem",
                                    color: f.colors.feedback.error,
                                }}>
                                    {apiError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                <Input
                                    id="recovery-email"
                                    name="email"
                                    label="E-mail cadastrado"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    required
                                    theme={theme}
                                    error={emailError}
                                    autoComplete="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Button
                                    label={isLoading ? "Enviando..." : "Enviar código de verificação"}
                                    type="submit"
                                    theme={theme}
                                    variant="primary"
                                    size="lg"
                                    onClick={() => {}}
                                    styleConfig={{
                                        width: "100%",
                                        backgroudColor: primaryColor,
                                        textColor: "#FFFFFF",
                                        border: "none",
                                        borderRadius: "0.8rem",
                                        height: "4.4rem",
                                        fontSize: "1.5rem",
                                        fontWeight: "600",
                                        opacity: isLoading ? "0.7" : "1",
                                    }}
                                />
                            </form>
                        </>
                    ) : (
                        <>
                            <div style={{
                                width: "5.6rem",
                                height: "5.6rem",
                                borderRadius: "50%",
                                backgroundColor: isDark ? f.colors.feedback.successBg : "#E6F4ED",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "2rem",
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={f.colors.feedback.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </div>

                            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.6rem" }}>
                                Código enviado!
                            </h1>
                            <p style={{ fontSize: "1.4rem", color: mutedColor, marginBottom: "0.4rem", lineHeight: 1.6 }}>
                                Enviamos um código de verificação para
                            </p>
                            <p style={{ fontSize: "1.5rem", fontWeight: 600, color: f.colors.text.primary, marginBottom: "2.4rem" }}>
                                {email}
                            </p>
                            <p style={{ fontSize: "1.3rem", color: mutedColor, marginBottom: "2.4rem", lineHeight: 1.6 }}>
                                Verifique sua caixa de entrada e spam. O código expira em <strong>15 minutos</strong>.
                            </p>

                            <Button
                                label="Inserir o código recebido"
                                type="button"
                                theme={theme}
                                variant="primary"
                                size="lg"
                                onClick={() => router.push("/reset-password")}
                                styleConfig={{
                                    width: "100%",
                                    backgroudColor: primaryColor,
                                    textColor: "#FFFFFF",
                                    border: "none",
                                    borderRadius: "0.8rem",
                                    height: "4.4rem",
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => setStep("email")}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginTop: "1.2rem",
                                    background: "none",
                                    border: "none",
                                    color: primaryColor,
                                    fontSize: "1.3rem",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    textAlign: "center",
                                }}
                            >
                                Usar outro e-mail
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
