"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import { OtpInput } from "../molecules/OtpInput";
import { GoogleSignInButton } from "../molecules/GoogleSignInButton";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { getAppBackground } from "../../shared/styles/appBackground";
import { useTheme } from "../../shared/styles/theme.context";
import { useAuth } from "../../contexts/auth.context";
import { authService } from "../../services/identification/auth.service";

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

const CheckIcon = ({ color }: { color: string }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

function passwordStrength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0..4
}

type Step = "form" | "verify";

export function RegisterPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const { refreshUser } = useAuth();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [step, setStep] = useState<Step>("form");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [apiError, setApiError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [codeError, setCodeError] = useState("");
    const [resendMessage, setResendMessage] = useState("");

    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; accepted?: string }>({});

    const strength = useMemo(() => passwordStrength(password), [password]);

    const validate = () => {
        const next: typeof errors = {};
        if (!name || name.trim().length < 2) next.name = "Informe seu nome completo.";
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Informe um e-mail válido.";
        if (!password || password.length < 8) next.password = "A senha deve ter pelo menos 8 caracteres.";
        if (!accepted) next.accepted = "É preciso aceitar os termos para continuar.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setApiError("");
        setIsLoading(true);
        try {
            await authService.register({ name: name.trim(), email, password });
            setStep("verify");
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Erro ao criar conta. Tente novamente.";
            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        const otp = code.join("");
        if (otp.length < 6) {
            setCodeError("Digite o código completo de 6 dígitos.");
            return;
        }
        setCodeError("");
        setApiError("");
        setIsLoading(true);
        try {
            await authService.verifyEmail({ email, code: otp });
            router.push("/login?verified=1");
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Código inválido ou expirado.";
            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResendMessage("");
        setApiError("");
        try {
            await authService.resendVerificationCode({ email });
            setResendMessage("Reenviamos o código para o seu e-mail.");
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Não foi possível reenviar o código.";
            setApiError(msg);
        }
    };

    const handleGoogleCredential = async (idToken: string) => {
        setApiError("");
        setIsLoading(true);
        try {
            await authService.loginWithGoogle(idToken);
            await refreshUser();
            router.push("/dashboard");
        } catch (err: unknown) {
            const msg = (err as { message?: string })?.message ?? "Não foi possível continuar com o Google.";
            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const cardBg = isDark ? f.colors.bg.surface : "#FFFFFF";
    const borderColor = f.colors.border.default;
    const primaryColor = f.colors.brand.primary;
    const mutedColor = f.colors.text.muted;

    const strengthLabels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
    const strengthColors = [
        f.colors.feedback.error,
        f.colors.feedback.error,
        f.colors.feedback.warning,
        f.colors.brand.accent,
        f.colors.feedback.success,
    ];

    const benefits = [
        "Comece grátis — sem cartão de crédito",
        "Seus dados criptografados de ponta a ponta",
        "Cancele quando quiser, em 1 clique",
    ];

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
            <div style={{ width: "100%", maxWidth: "46rem" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <img src="/assets/icone_finlumia.svg" alt="Finlumia" width={44} height={44} style={{ display: "inline-block", marginBottom: "0.8rem" }} />
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: primaryColor, letterSpacing: "0.05em" }}>
                        FINLUMIA
                    </div>
                    <div style={{ fontSize: "1.4rem", color: mutedColor, marginTop: "0.4rem" }}>
                        Crie sua conta e assuma o controle do seu dinheiro
                    </div>
                </div>

                {/* Card */}
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
                            marginBottom: "1.6rem",
                            fontSize: "1.3rem",
                            color: f.colors.feedback.error,
                        }}>
                            {apiError}
                        </div>
                    )}

                    {step === "form" && (
                    <>
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                        Criar conta grátis
                    </h1>
                    <p style={{ fontSize: "1.4rem", color: mutedColor, marginBottom: "2rem" }}>
                        Leva menos de 1 minuto. Junte-se a milhares de pessoas no controle das finanças.
                    </p>

                    {/* Google Sign-Up */}
                    <GoogleSignInButton onCredential={handleGoogleCredential} onError={setApiError} disabled={isLoading}>
                        <button
                            type="button"
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.8rem",
                                height: "4.4rem",
                                borderRadius: "0.8rem",
                                border: `1px solid ${borderColor}`,
                                backgroundColor: "transparent",
                                color: f.colors.text.primary,
                                fontSize: "1.4rem",
                                fontWeight: 600,
                                cursor: isLoading ? "not-allowed" : "pointer",
                                opacity: isLoading ? 0.6 : 1,
                                fontFamily: "inherit",
                                transition: "background-color 0.15s ease, opacity 0.15s ease",
                            }}
                        >
                            <GoogleIcon />
                            {isLoading ? "Conectando..." : "Cadastrar com Google"}
                        </button>
                    </GoogleSignInButton>
                    <div style={{ marginBottom: "2rem" }} />

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "2rem" }}>
                        <div style={{ flex: 1, height: "1px", backgroundColor: borderColor }} />
                        <span style={{ fontSize: "1.2rem", color: mutedColor, whiteSpace: "nowrap" }}>ou cadastre-se com e-mail</span>
                        <div style={{ flex: 1, height: "1px", backgroundColor: borderColor }} />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                        <Input
                            id="name"
                            name="name"
                            label="Nome completo"
                            type="text"
                            placeholder="Como devemos te chamar?"
                            value={name}
                            required
                            theme={theme}
                            error={errors.name}
                            autoComplete="name"
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            id="email"
                            name="email"
                            label="E-mail"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            required
                            theme={theme}
                            error={errors.email}
                            autoComplete="email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div>
                            <Input
                                id="password"
                                name="password"
                                label="Senha"
                                type="password"
                                placeholder="Mínimo de 8 caracteres"
                                value={password}
                                required
                                theme={theme}
                                error={errors.password}
                                autoComplete="new-password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {/* Strength meter */}
                            {password.length > 0 && (
                                <div style={{ marginTop: "0.8rem" }}>
                                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                                        {[0, 1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    flex: 1,
                                                    height: "0.4rem",
                                                    borderRadius: "999px",
                                                    backgroundColor: i < strength ? strengthColors[strength] : borderColor,
                                                    transition: "background-color 0.2s ease",
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: "1.1rem", color: mutedColor }}>
                                        Força da senha: <strong style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</strong>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Terms */}
                        <label style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                style={{ width: "1.7rem", height: "1.7rem", marginTop: "0.1rem", accentColor: primaryColor, cursor: "pointer", flexShrink: 0 }}
                            />
                            <span style={{ fontSize: "1.25rem", color: mutedColor, lineHeight: 1.45 }}>
                                Li e aceito os{" "}
                                <span style={{ color: primaryColor }}>Termos de Uso</span> e a{" "}
                                <span style={{ color: primaryColor }}>Política de Privacidade</span>.
                            </span>
                        </label>
                        {errors.accepted && (
                            <span style={{ fontSize: "1.2rem", color: f.colors.feedback.error, marginTop: "-0.8rem" }}>
                                {errors.accepted}
                            </span>
                        )}

                        <Button
                            label={isLoading ? "Criando conta..." : "Criar minha conta"}
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
                                fontWeight: "700",
                                opacity: isLoading ? "0.7" : "1",
                            }}
                        />
                    </form>

                    {/* Benefits / trust signals */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "2rem" }}>
                        {benefits.map((b) => (
                            <div key={b} style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                                <CheckIcon color={f.colors.feedback.success} />
                                <span style={{ fontSize: "1.25rem", color: mutedColor }}>{b}</span>
                            </div>
                        ))}
                    </div>

                    <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.3rem", color: mutedColor }}>
                        Já tem uma conta?{" "}
                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            style={{
                                background: "none",
                                border: "none",
                                color: primaryColor,
                                fontWeight: 600,
                                cursor: "pointer",
                                padding: 0,
                                fontFamily: "inherit",
                                fontSize: "1.3rem",
                            }}
                        >
                            Entrar
                        </button>
                    </p>
                    </>
                    )}

                    {step === "verify" && (
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
                                Confirme seu e-mail
                            </h1>
                            <p style={{ fontSize: "1.4rem", color: mutedColor, marginBottom: "2.8rem", lineHeight: 1.6 }}>
                                Enviamos um código de 6 dígitos para <strong>{email}</strong>. Digite abaixo para ativar sua conta.
                            </p>

                            <OtpInput value={code} onChange={setCode} theme={theme} error={codeError} />

                            <Button
                                label={isLoading ? "Verificando..." : "Verificar código"}
                                type="button"
                                theme={theme}
                                variant="primary"
                                size="lg"
                                onClick={handleVerifyCode}
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

                            <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.3rem", color: mutedColor }}>
                                Não recebeu o código?{" "}
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: primaryColor,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        padding: 0,
                                        fontFamily: "inherit",
                                        fontSize: "1.3rem",
                                    }}
                                >
                                    Reenviar código
                                </button>
                            </p>
                            {resendMessage && (
                                <p style={{ textAlign: "center", fontSize: "1.2rem", color: f.colors.feedback.success }}>
                                    {resendMessage}
                                </p>
                            )}
                        </>
                    )}
                </div>

                <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.1rem", color: mutedColor }}>
                    🔒 Conexão segura. Nunca compartilhamos seus dados financeiros.
                </p>
            </div>
        </div>
    );
}
