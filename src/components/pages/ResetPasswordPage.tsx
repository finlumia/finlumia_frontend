"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import { OtpInput } from "../molecules/OtpInput";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { getAppBackground } from "../../shared/styles/appBackground";
import { useTheme } from "../../shared/styles/theme.context";
import { authService } from "../../services/identification/auth.service";

type Step = "token" | "password" | "success";

export function ResetPasswordPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [step, setStep] = useState<Step>("token");
    const [email, setEmail] = useState("");
    const [resetSession, setResetSession] = useState("");
    const [token, setToken] = useState(["", "", "", "", "", ""]);
    const [tokenError, setTokenError] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Recupera o email salvo pela tela de forgot-password
    useEffect(() => {
        const saved = sessionStorage.getItem("finlumia:reset_email") ?? "";
        setEmail(saved);
    }, []);

    const cardBg = isDark ? f.colors.bg.surface : "#FFFFFF";
    const borderColor = f.colors.border.default;
    const primaryColor = f.colors.brand.primary;
    const mutedColor = f.colors.text.muted;

    const handleVerifyToken = async () => {
        const otp = token.join("");
        if (otp.length < 6) {
            setTokenError("Digite o código completo de 6 dígitos.");
            return;
        }
        setTokenError("");
        setApiError("");
        setIsLoading(true);
        try {
            const res = await authService.verifyResetToken({ email, token: otp });
            setResetSession(res.resetSession);
            setStep("password");
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Código inválido ou expirado.";
            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
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

    const handleResetPassword = async () => {
        if (!validatePassword()) return;
        setApiError("");
        setIsLoading(true);
        try {
            await authService.resetPassword({
                resetSession,
                newPassword: password,
                confirmPassword: confirm,
            });
            sessionStorage.removeItem("finlumia:reset_email");
            setStep("success");
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Erro ao redefinir senha. Tente novamente.";
            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
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
            ...getAppBackground(theme),
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
                    {/* Erro de API */}
                    {apiError && (
                        <div style={{
                            backgroundColor: isDark ? f.colors.feedback.errorBg : "#FEF2F2",
                            border: `1px solid ${f.colors.feedback.error}`,
                            borderRadius: "0.8rem",
                            padding: "1.2rem 1.6rem",
                            marginBottom: "2rem",
                            fontSize: "1.3rem",
                            color: f.colors.feedback.error,
                        }}>
                            {apiError}
                        </div>
                    )}

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
                            <p style={{ fontSize: "1.4rem", color: mutedColor, marginBottom: "0.6rem", lineHeight: 1.6 }}>
                                Digite os 6 dígitos enviados para o seu e-mail.
                            </p>
                            <p style={{ fontSize: "1.2rem", color: mutedColor, marginBottom: "2.8rem", lineHeight: 1.6 }}>
                                Não encontrou o e-mail? Verifique também sua caixa de spam.
                            </p>

                            <OtpInput value={token} onChange={setToken} theme={theme} error={tokenError} />

                            <Button
                                label={isLoading ? "Verificando..." : "Verificar código"}
                                type="button"
                                theme={theme}
                                variant="primary"
                                size="lg"
                                onClick={handleVerifyToken}
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
                                    opacity: isLoading ? "0.7" : "1",
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
                                    label={isLoading ? "Redefinindo..." : "Redefinir senha"}
                                    type="button"
                                    theme={theme}
                                    variant="primary"
                                    size="lg"
                                    onClick={handleResetPassword}
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
                                        opacity: isLoading ? "0.7" : "1",
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
