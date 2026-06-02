"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export function LoginPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const validate = () => {
        let valid = true;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Informe um e-mail válido.");
            valid = false;
        } else {
            setEmailError("");
        }
        if (!password || password.length < 6) {
            setPasswordError("A senha deve ter pelo menos 6 caracteres.");
            valid = false;
        } else {
            setPasswordError("");
        }
        return valid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            router.push("/dashboard");
        }
    };

    const bg = isDark ? f.colors.bg.app : f.colors.bg.app;
    const cardBg = isDark ? f.colors.bg.surface : "#FFFFFF";
    const borderColor = f.colors.border.default;
    const primaryColor = f.colors.brand.primary;
    const mutedColor = f.colors.text.muted;

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.4rem 1.6rem",
            fontFamily: f.typography.fontFamily.base,
        }}>
            <div style={{ width: "100%", maxWidth: "44rem" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2.4rem" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/icone_finlumia.svg" alt="Finlumia" width={44} height={44} style={{ display: "inline-block", marginBottom: "0.8rem" }} />
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: primaryColor, letterSpacing: "0.05em" }}>
                        FINLUMIA
                    </div>
                    <div style={{ fontSize: "1.4rem", color: mutedColor, marginTop: "0.4rem" }}>
                        Gerencie suas finanças com inteligência
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
                    <h1 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                        Entrar na conta
                    </h1>
                    <p style={{ fontSize: "1.4rem", color: mutedColor, marginBottom: "2.4rem" }}>
                        Bem-vindo de volta. Faça login para continuar.
                    </p>

                    {/* Google Sign-In */}
                    <button
                        type="button"
                        onClick={() => console.log("Google OAuth")}
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
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "background-color 0.15s ease",
                            marginBottom: "2rem",
                        }}
                    >
                        <GoogleIcon />
                        Continuar com Google
                    </button>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "2rem" }}>
                        <div style={{ flex: 1, height: "1px", backgroundColor: borderColor }} />
                        <span style={{ fontSize: "1.2rem", color: mutedColor, whiteSpace: "nowrap" }}>ou entre com e-mail</span>
                        <div style={{ flex: 1, height: "1px", backgroundColor: borderColor }} />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
                        <Input
                            id="email"
                            name="email"
                            label="E-mail"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            required
                            theme={theme}
                            error={emailError}
                            autoComplete="email"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            id="password"
                            name="password"
                            label="Senha"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            required
                            theme={theme}
                            error={passwordError}
                            autoComplete="current-password"
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div style={{ textAlign: "right", marginTop: "-0.8rem" }}>
                            <button
                                type="button"
                                onClick={() => router.push("/forgot-password")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: primaryColor,
                                    fontSize: "1.3rem",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    padding: 0,
                                    fontFamily: "inherit",
                                }}
                            >
                                Esqueci minha senha
                            </button>
                        </div>

                        <Button
                            label="Entrar"
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
                            }}
                        />
                    </form>

                    <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.3rem", color: mutedColor }}>
                        Não tem conta?{" "}
                        <button
                            type="button"
                            onClick={() => router.push("/register")}
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
                            Criar conta grátis
                        </button>
                    </p>
                </div>

                {/* Accessibility note */}
                <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.1rem", color: mutedColor }}>
                    Ao entrar, você concorda com nossos{" "}
                    <span style={{ color: primaryColor, cursor: "pointer" }}>Termos de Uso</span>{" "}
                    e{" "}
                    <span style={{ color: primaryColor, cursor: "pointer" }}>Política de Privacidade</span>.
                </p>
            </div>
        </div>
    );
}
