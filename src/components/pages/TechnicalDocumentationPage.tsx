"use client";

import React, { useState } from "react";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";
import { useAuth } from "../../contexts/auth.context";

function AccessDenied({ f, isDark }: { f: ReturnType<typeof getFoundationByTheme>; isDark: boolean }) {
    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "60rem" }}>
            <div style={{
                backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                border: `1px solid ${f.colors.feedback.error}40`,
                borderRadius: "1.6rem", padding: "3.2rem", textAlign: "center",
            }}>
                <div style={{ fontSize: "4rem", marginBottom: "1.6rem" }}>🔒</div>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.8rem" }}>Acesso restrito</h1>
                <p style={{ fontSize: "1.4rem", color: f.colors.text.muted, lineHeight: 1.6 }}>
                    A Documentação Técnica está disponível apenas para <strong>Administradores</strong>.<br />
                    Contate seu administrador para solicitar acesso.
                </p>
            </div>
        </div>
    );
}

type Tab = "quickstart" | "architecture" | "frontend" | "backend" | "env" | "dev";

const TABS: { id: Tab; label: string }[] = [
    { id: "quickstart",   label: "Início Rápido" },
    { id: "architecture", label: "Arquitetura" },
    { id: "frontend",     label: "Frontend" },
    { id: "backend",      label: "Backend / APIs" },
    { id: "env",          label: "Variáveis de Ambiente" },
    { id: "dev",          label: "Guia de Dev" },
];

function CodeBlock({ code, isDark, border }: { code: string; isDark: boolean; border: string }) {
    return (
        <pre style={{
            backgroundColor: isDark ? "#0D1117" : "#F6F8FA",
            border: `1px solid ${border}`,
            borderRadius: "0.8rem", padding: "1.4rem 1.6rem",
            fontSize: "1.25rem", fontFamily: "monospace",
            overflowX: "auto", lineHeight: 1.6, color: isDark ? "#E6EDF3" : "#24292F",
            margin: "1rem 0",
        }}>{code}</pre>
    );
}

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
    return (
        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color, marginBottom: "0.8rem", marginTop: "2rem" }}>
            {children}
        </h3>
    );
}

function InfoBox({ children, type, f, isDark }: { children: React.ReactNode; type: "info" | "warn" | "tip"; f: ReturnType<typeof getFoundationByTheme>; isDark: boolean }) {
    const styles = {
        info: { color: f.colors.feedback.info, bg: isDark ? "#0C1A2E" : "#EFF6FF", icon: "ℹ️" },
        warn: { color: f.colors.feedback.warning, bg: isDark ? "#1E1200" : "#FFFBEB", icon: "⚠️" },
        tip:  { color: f.colors.feedback.success, bg: isDark ? "#0D2E1D" : "#ECFDF5", icon: "✅" },
    }[type];
    return (
        <div style={{
            backgroundColor: styles.bg, border: `1px solid ${styles.color}40`,
            borderRadius: "0.8rem", padding: "1.2rem 1.4rem", margin: "1rem 0",
            display: "flex", gap: "0.8rem", fontSize: "1.3rem", color: f.colors.text.secondary, lineHeight: 1.6,
        }}>
            <span>{styles.icon}</span>
            <span>{children}</span>
        </div>
    );
}

export function TechnicalDocumentationPage() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const border = f.colors.border.default;
    const muted = f.colors.text.muted;
    const primary = f.colors.brand.primary;

    const [activeTab, setActiveTab] = useState<Tab>("quickstart");

    if (user?.role !== "admin") return <AccessDenied f={f} isDark={isDark} />;

    const cardStyle: React.CSSProperties = {
        backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
        borderRadius: "1.2rem", border: `1px solid ${border}`,
        padding: "2.4rem",
    };

    const prose: React.CSSProperties = {
        fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.75,
    };

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "120rem" }}>

            {/* Header */}
            <div style={{ marginBottom: "2.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.4rem" }}>
                    <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: muted }}>
                        Documentação Técnica
                    </p>
                    <span style={{
                        fontSize: "1.1rem", fontWeight: 600, padding: "0.2rem 0.8rem",
                        borderRadius: "999px", backgroundColor: isDark ? "#1E0E0E" : "#FEE2E2",
                        color: f.colors.feedback.error,
                    }}>Somente Admin</span>
                </div>
                <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                    Finlumia — Referência Técnica
                </h1>
                <p style={{ fontSize: "1.4rem", color: muted }}>
                    Arquitetura, setup, variáveis de ambiente e guias de desenvolvimento para a equipe de engenharia.
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        style={{
                            padding: "0.7rem 1.4rem", borderRadius: "0.8rem",
                            border: `1px solid ${activeTab === t.id ? primary : border}`,
                            backgroundColor: activeTab === t.id ? primary : "transparent",
                            color: activeTab === t.id ? "#fff" : f.colors.text.secondary,
                            fontSize: "1.3rem", fontWeight: activeTab === t.id ? 600 : 400,
                            cursor: "pointer", fontFamily: "inherit",
                            transition: "all 0.15s ease",
                        }}
                    >{t.label}</button>
                ))}
            </div>

            {/* Content */}
            <div style={cardStyle}>

                {/* ── Início Rápido ── */}
                {activeTab === "quickstart" && (
                    <div style={prose}>
                        <h2 style={{ fontSize: "1.9rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "1.2rem" }}>Início Rápido</h2>
                        <p>Três formas de rodar o projeto. Escolha a que melhor se encaixa no seu ambiente.</p>

                        <SectionTitle color={primary}>Pré-requisitos</SectionTitle>
                        <ul style={{ paddingLeft: "2rem", lineHeight: 2 }}>
                            <li><strong>Node.js</strong> ≥ 20.x + npm ≥ 10.x</li>
                            <li><strong>Docker Desktop</strong> (opcional, mas recomendado)</li>
                            <li>Acesso às variáveis de ambiente (veja aba "Variáveis")</li>
                        </ul>

                        <SectionTitle color={primary}>Opção A — Node local (mais rápido para desenvolvimento)</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`# 1. Clone o repositório
git clone https://github.com/org/finlumia_frontend.git
cd finlumia_frontend

# 2. Instale as dependências
npm install

# 3. Configure o ambiente
cp .env.example .env.local
# Edite .env.local com as variáveis do seu ambiente

# 4. Inicie em modo desenvolvimento
npm run dev
# Acesse: http://localhost:3000`} />

                        <SectionTitle color={primary}>Opção B — Docker (ambiente padronizado)</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`# Windows — PowerShell
docker compose -f docker-compose.dev.yml up --build

# Linux / macOS
docker compose -f docker-compose.dev.yml up --build

# Acesse: http://localhost:3000`} />

                        <SectionTitle color={primary}>Opção C — Produção (Linux/VPS)</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`# Build da imagem de produção
docker compose -f docker-compose.prod.yml up --build -d

# Variáveis obrigatórias em produção:
# NEXT_PUBLIC_APP_ENV=production
# NEXT_PUBLIC_SERVICE_IDENTIFICATION_PRODUCTION=https://api.seudominio.com/identification
# (demais variáveis de serviço)`} />

                        <InfoBox type="warn" f={f} isDark={isDark}>
                            Em produção, NUNCA exponha <code>NEXT_PUBLIC_</code> vars com secrets. Elas ficam visíveis no bundle do browser.
                        </InfoBox>
                    </div>
                )}

                {/* ── Arquitetura ── */}
                {activeTab === "architecture" && (
                    <div style={prose}>
                        <h2 style={{ fontSize: "1.9rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "1.2rem" }}>Arquitetura Geral</h2>
                        <p>O Finlumia é composto por um frontend Next.js e quatro microserviços Spring Boot independentes, cada um responsável por um domínio de negócio.</p>

                        <SectionTitle color={primary}>Diagrama de camadas</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`[Browser] → [Next.js App (Port 3000)]
                ↓
         [Proxy / Rewrites]
         /proxy/identify    → Identification Service  :28083
         /proxy/movement    → Movimentation Service   :28084
         /proxy/document    → Document Service        :28085
         /proxy/configurator → Configurator Service   :28081`} />

                        <SectionTitle color={primary}>Proxy e CORS</SectionTitle>
                        <p>Em desenvolvimento, o <code>next.config.ts</code> usa <strong>rewrites</strong> para evitar CORS: toda chamada a <code>/proxy/&lt;service&gt;/*</code> é reescrita para o backend real. Em produção, cada variável <code>NEXT_PUBLIC_SERVICE_*_PRODUCTION</code> aponta diretamente para o host do serviço.</p>

                        <SectionTitle color={primary}>Autenticação JWT</SectionTitle>
                        <ul style={{ paddingLeft: "2rem", lineHeight: 2 }}>
                            <li><strong>accessToken</strong> — JWT de 15 min, enviado no header <code>Authorization: Bearer</code></li>
                            <li><strong>refreshToken</strong> — JWT de 7 dias, enviado ao endpoint <code>/token/refresh</code> para renovar o access</li>
                            <li>Tokens armazenados em <code>localStorage</code> + cookie de sessão <code>finlumia_session</code></li>
                            <li>Single-flight refresh: múltiplos requests 401 simultâneos aguardam uma única renovação</li>
                        </ul>

                        <SectionTitle color={primary}>Roles de usuário</SectionTitle>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "1.3rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                                        {["Role", "Dashboard", "Movimentações", "Relatórios", "Configurador", "Portal Suporte", "Doc. Técnica"].map((h) => (
                                            <th key={h} style={{ padding: "0.8rem 1rem", textAlign: "left", fontWeight: 600, color: muted, whiteSpace: "nowrap" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ["admin",    "✅", "✅", "✅", "✅", "✅", "✅"],
                                        ["gerente",  "✅", "✅", "✅", "✅", "✅", "❌"],
                                        ["analista", "✅", "✅", "✅", "❌", "❌", "❌"],
                                        ["viewer",   "✅", "👁️", "✅", "❌", "❌", "❌"],
                                    ].map(([role, ...perms]) => (
                                        <tr key={role} style={{ borderBottom: `1px solid ${border}` }}>
                                            <td style={{ padding: "0.8rem 1rem", fontWeight: 600, color: f.colors.text.primary, fontFamily: "monospace" }}>{role}</td>
                                            {perms.map((p, i) => <td key={i} style={{ padding: "0.8rem 1rem", textAlign: "center" }}>{p}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Frontend ── */}
                {activeTab === "frontend" && (
                    <div style={prose}>
                        <h2 style={{ fontSize: "1.9rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "1.2rem" }}>Estrutura do Frontend</h2>
                        <p>O frontend segue <strong>Atomic Design</strong> com Next.js App Router e tokens de design centralizados.</p>

                        <SectionTitle color={primary}>Estrutura de pastas</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`src/
├── app/                    # Rotas Next.js (App Router)
│   ├── dashboard/          # Layout autenticado + páginas
│   └── (public)/           # Login, forgot-password, reset
├── components/
│   ├── atoms/              # Input, Button, Select...
│   ├── molecules/          # Combinações de átomos
│   └── organisms/          # Sidebar, Modais, DataTable...
│   └── pages/              # Componentes de página completa
├── contexts/               # AuthContext, TourContext
├── shared/
│   ├── finance/            # FinanceContext + Period utils
│   └── styles/             # Tokens de tema, ThemeContext
├── services/               # Camada de acesso à API
│   ├── identification/     # auth.service, profile.service
│   ├── movimentation/      # movement.service
│   ├── document/           # document.service
│   └── configurator/       # configurator.service
├── api/
│   ├── Endpoints.ts        # Catálogo central de endpoints
│   └── types.ts            # Todos os tipos TypeScript
├── config/
│   └── navigation.json     # Estrutura da sidebar
└── lib/
    └── http-client.ts      # fetch + JWT refresh automático`} />

                        <SectionTitle color={primary}>Contextos principais</SectionTitle>
                        <ul style={{ paddingLeft: "2rem", lineHeight: 2 }}>
                            <li><strong>AuthContext</strong> — autenticação, usuário logado, login/logout</li>
                            <li><strong>ThemeContext</strong> — alternância light/dark, tokens de estilo</li>
                            <li><strong>FinanceContext</strong> — transações, categorias, bancos, orçamentos (lazy-loaded)</li>
                            <li><strong>TourContext</strong> — tutorial guiado de onboarding</li>
                        </ul>

                        <SectionTitle color={primary}>Sistema de temas (tokens)</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`// Uso nos componentes:
import { getFoundationByTheme } from "@/shared/styles/tokens";
import { useTheme } from "@/shared/styles/theme.context";

const { theme } = useTheme();
const f = getFoundationByTheme(theme);

// f.colors.brand.primary   → cor principal (#0D7A5F)
// f.colors.text.muted      → texto secundário
// f.colors.bg.elevated     → fundo de cards
// f.colors.feedback.error  → vermelho de erro`} />

                        <SectionTitle color={primary}>Adicionando uma nova rota</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`# 1. Crie a pasta e page.tsx em src/app/dashboard/minha-rota/
# 2. Crie o componente em src/components/pages/MinhaRotaPage.tsx
# 3. Adicione à navigation.json (sidebar renderiza automaticamente)
# 4. Se precisar de dados, crie um service em src/services/`} />

                        <InfoBox type="tip" f={f} isDark={isDark}>
                            Use <code>className="page-responsive"</code> no wrapper de cada página para garantir padding consistente em todos os tamanhos de tela.
                        </InfoBox>
                    </div>
                )}

                {/* ── Backend ── */}
                {activeTab === "backend" && (
                    <div style={prose}>
                        <h2 style={{ fontSize: "1.9rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "1.2rem" }}>Backend — Microserviços</h2>

                        {[
                            {
                                name: "Identification Service", port: "28083", prefix: "/api/identify",
                                desc: "Autenticação JWT, gerenciamento de usuários, perfil e KPIs do dashboard.",
                                endpoints: [
                                    ["POST", "/token", "Login com e-mail e senha"],
                                    ["POST", "/token/revoke", "Logout (invalida refreshToken)"],
                                    ["POST", "/token/refresh", "Renova o accessToken"],
                                    ["GET",  "/me", "Perfil do usuário autenticado"],
                                    ["PATCH", "/me", "Atualiza nome e preferências"],
                                    ["POST", "/auth/forgot-password", "Envio de OTP por e-mail"],
                                    ["POST", "/auth/verify-reset-token", "Valida OTP"],
                                    ["POST", "/auth/reset-password", "Redefine senha"],
                                ],
                            },
                            {
                                name: "Movimentation Service", port: "28084", prefix: "/api/v1",
                                desc: "Transações financeiras, importação de extratos, categorias e instituições.",
                                endpoints: [
                                    ["GET",    "/transactions", "Lista paginada de transações"],
                                    ["POST",   "/transactions", "Cria transação"],
                                    ["PUT",    "/transactions/:id", "Atualiza transação"],
                                    ["DELETE", "/transactions/:id", "Remove transação"],
                                    ["POST",   "/transactions/import/upload", "Upload de arquivo (OFX/CSV/imagem)"],
                                    ["GET",    "/categories", "Lista categorias"],
                                    ["GET",    "/institutions", "Lista instituições"],
                                ],
                            },
                            {
                                name: "Document Service", port: "28085", prefix: "/api/v1",
                                desc: "Relatórios, KPIs, análises e exportação de dados.",
                                endpoints: [
                                    ["GET", "/reports/kpis", "KPIs: receitas, despesas, saldo, poupança"],
                                    ["GET", "/reports/cash-flow", "Fluxo de caixa"],
                                    ["GET", "/reports/by-category", "Breakdown por categoria"],
                                    ["GET", "/reports/by-institution", "Breakdown por banco"],
                                    ["GET", "/reports/insights", "Insights automáticos de IA"],
                                    ["GET", "/export/transactions", "Exporta transações (CSV/XLSX)"],
                                ],
                            },
                            {
                                name: "Configurator Service", port: "28081", prefix: "/v1/config",
                                desc: "Gerenciamento de tabelas, campos, usuários, permissões, funções, índices e triggers.",
                                endpoints: [
                                    ["GET/POST", "/tables", "Lista e cria tabelas"],
                                    ["GET/POST", "/fields", "Lista e cria campos"],
                                    ["GET/POST", "/users", "Lista e cria usuários admin"],
                                    ["GET/POST", "/permissions", "Matriz de permissões"],
                                    ["GET/POST", "/functions", "Funções SQL/PL"],
                                    ["GET/POST", "/indexes", "Índices de banco"],
                                    ["GET/POST", "/triggers", "Triggers de banco"],
                                ],
                            },
                        ].map((svc) => (
                            <div key={svc.name} style={{ marginBottom: "2.4rem" }}>
                                <SectionTitle color={primary}>{svc.name} <span style={{ fontSize: "1.2rem", color: muted, fontFamily: "monospace" }}>:{svc.port}</span></SectionTitle>
                                <p style={{ marginBottom: "1rem" }}>{svc.desc}</p>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "1.25rem" }}>
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${border}` }}>
                                                <th style={{ padding: "0.6rem 1rem", textAlign: "left", color: muted, fontWeight: 600 }}>Método</th>
                                                <th style={{ padding: "0.6rem 1rem", textAlign: "left", color: muted, fontWeight: 600 }}>Endpoint</th>
                                                <th style={{ padding: "0.6rem 1rem", textAlign: "left", color: muted, fontWeight: 600 }}>Descrição</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {svc.endpoints.map(([method, path, desc]) => (
                                                <tr key={path} style={{ borderBottom: `1px solid ${border}` }}>
                                                    <td style={{ padding: "0.6rem 1rem", fontFamily: "monospace", fontWeight: 700, color: method.includes("GET") ? "#059669" : method.includes("POST") ? primary : method.includes("PUT") ? "#D97706" : "#EF4444" }}>{method}</td>
                                                    <td style={{ padding: "0.6rem 1rem", fontFamily: "monospace", color: f.colors.text.secondary }}>{svc.prefix}{path}</td>
                                                    <td style={{ padding: "0.6rem 1rem", color: muted }}>{desc}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Variáveis ── */}
                {activeTab === "env" && (
                    <div style={prose}>
                        <h2 style={{ fontSize: "1.9rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "1.2rem" }}>Variáveis de Ambiente</h2>
                        <p>Copie <code>.env.example</code> para <code>.env.local</code> e ajuste conforme o ambiente.</p>
                        <InfoBox type="info" f={f} isDark={isDark}>
                            Variáveis <code>NEXT_PUBLIC_</code> ficam expostas no bundle do browser. Nunca coloque secrets nelas.
                        </InfoBox>

                        {[
                            {
                                group: "Ambiente", vars: [
                                    ["NEXT_PUBLIC_APP_ENV", "local | homologation | production", "Define qual conjunto de URLs de backend usar"],
                                ],
                            },
                            {
                                group: "Identification (local = proxy automático)", vars: [
                                    ["NEXT_PUBLIC_SERVICE_IDENTIFICATION_HOMOLOGATION", "https://host/identification", "URL do serviço em homologação"],
                                    ["NEXT_PUBLIC_SERVICE_IDENTIFICATION_PRODUCTION", "https://apifinlumia.dominio.com.br/identification", "URL do serviço em produção"],
                                ],
                            },
                            {
                                group: "Movimentation", vars: [
                                    ["NEXT_PUBLIC_SERVICE_MOVIMENTATION_HOMOLOGATION", "https://host/movimentation", ""],
                                    ["NEXT_PUBLIC_SERVICE_MOVIMENTATION_PRODUCTION", "https://apifinlumia.dominio.com.br/movimentation", ""],
                                ],
                            },
                            {
                                group: "Document", vars: [
                                    ["NEXT_PUBLIC_SERVICE_DOCUMENT_HOMOLOGATION", "https://host/document", ""],
                                    ["NEXT_PUBLIC_SERVICE_DOCUMENT_PRODUCTION", "https://apifinlumia.dominio.com.br/document", ""],
                                ],
                            },
                            {
                                group: "Configurator", vars: [
                                    ["NEXT_PUBLIC_SERVICE_CONFIGURATOR_HOMOLOGATION", "https://host/configurator", ""],
                                    ["NEXT_PUBLIC_SERVICE_CONFIGURATOR_PRODUCTION", "https://apifinlumia.dominio.com.br/configurator", ""],
                                ],
                            },
                        ].map((g) => (
                            <div key={g.group} style={{ marginBottom: "2rem" }}>
                                <SectionTitle color={primary}>{g.group}</SectionTitle>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "1.25rem" }}>
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${border}` }}>
                                                <th style={{ padding: "0.6rem 1rem", textAlign: "left", color: muted, fontWeight: 600 }}>Variável</th>
                                                <th style={{ padding: "0.6rem 1rem", textAlign: "left", color: muted, fontWeight: 600 }}>Exemplo</th>
                                                <th style={{ padding: "0.6rem 1rem", textAlign: "left", color: muted, fontWeight: 600 }}>Descrição</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {g.vars.map(([key, ex, desc]) => (
                                                <tr key={key} style={{ borderBottom: `1px solid ${border}` }}>
                                                    <td style={{ padding: "0.6rem 1rem", fontFamily: "monospace", fontSize: "1.2rem", color: primary }}>{key}</td>
                                                    <td style={{ padding: "0.6rem 1rem", fontFamily: "monospace", fontSize: "1.2rem", color: f.colors.text.secondary }}>{ex}</td>
                                                    <td style={{ padding: "0.6rem 1rem", color: muted }}>{desc}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}

                        <SectionTitle color={primary}>Arquivo .env.local completo (template)</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`NEXT_PUBLIC_APP_ENV=local

# Homologação
NEXT_PUBLIC_SERVICE_IDENTIFICATION_HOMOLOGATION=
NEXT_PUBLIC_SERVICE_MOVIMENTATION_HOMOLOGATION=
NEXT_PUBLIC_SERVICE_DOCUMENT_HOMOLOGATION=
NEXT_PUBLIC_SERVICE_CONFIGURATOR_HOMOLOGATION=

# Produção
NEXT_PUBLIC_SERVICE_IDENTIFICATION_PRODUCTION=https://apifinlumia.seudominio.com.br/identification
NEXT_PUBLIC_SERVICE_MOVIMENTATION_PRODUCTION=https://apifinlumia.seudominio.com.br/movimentation
NEXT_PUBLIC_SERVICE_DOCUMENT_PRODUCTION=https://apifinlumia.seudominio.com.br/document
NEXT_PUBLIC_SERVICE_CONFIGURATOR_PRODUCTION=https://apifinlumia.seudominio.com.br/configurator`} />
                    </div>
                )}

                {/* ── Guia de Dev ── */}
                {activeTab === "dev" && (
                    <div style={prose}>
                        <h2 style={{ fontSize: "1.9rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "1.2rem" }}>Guia de Desenvolvimento</h2>

                        <SectionTitle color={primary}>Scripts disponíveis</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`npm run dev      # Servidor de desenvolvimento com hot-reload
npm run build    # Build de produção (Next.js output)
npm run start    # Serve o build de produção localmente
npm run lint     # ESLint em todo o projeto`} />

                        <SectionTitle color={primary}>Criando um novo serviço de API</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`// 1. Adicione o endpoint em src/api/Endpoints.ts
export const API_ENDPOINTS = {
  ...
  myModule: {
    list:   ep("movimentation", "/api/v1/my-resource", "GET"),
    create: ep("movimentation", "/api/v1/my-resource", "POST"),
  },
};

// 2. Crie src/services/movimentation/my.service.ts
import { http } from "@/lib/http-client";
import { API_ENDPOINTS } from "@/api/Endpoints";

export const myService = {
  list: () => http.get(API_ENDPOINTS.myModule.list.url),
  create: (data: MyRequest) => http.post(API_ENDPOINTS.myModule.create.url, data),
};`} />

                        <SectionTitle color={primary}>Convenções de código</SectionTitle>
                        <ul style={{ paddingLeft: "2rem", lineHeight: 2 }}>
                            <li>Componentes em <strong>PascalCase</strong>, funções utilitárias em <strong>camelCase</strong></li>
                            <li>Estilos inline com tokens de tema — não use valores hardcoded de cor</li>
                            <li>Use <code>useCallback</code> + <code>useMemo</code> em contextos e funções pesadas</li>
                            <li>Prefira <code>type</code> sobre <code>interface</code> para tipagem de dados da API</li>
                            <li>Todo serviço de API deve retornar a Promise tipada (sem <code>any</code> desnecessário)</li>
                            <li>Comentários: apenas quando o "porquê" não é óbvio pelo código</li>
                        </ul>

                        <SectionTitle color={primary}>Fluxo de uma funcionalidade nova</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`1. Adicione o endpoint em src/api/Endpoints.ts
2. Adicione o tipo de request/response em src/api/types.ts
3. Crie o service em src/services/<domínio>/<nome>.service.ts
4. Crie o componente de página em src/components/pages/
5. Crie a rota em src/app/dashboard/<rota>/page.tsx
6. Adicione à navigation.json se precisar de item no menu
7. Proteja com verificação de role se a tela for restrita`} />

                        <InfoBox type="tip" f={f} isDark={isDark}>
                            O <strong>React StrictMode</strong> em desenvolvimento executa os <code>useEffect</code> duas vezes propositalmente para detectar efeitos colaterais. Em produção, executam apenas uma vez. Use flags <code>cancelled</code> ou <code>ref</code> para evitar race conditions.
                        </InfoBox>

                        <SectionTitle color={primary}>Estrutura de um componente de página padrão</SectionTitle>
                        <CodeBlock isDark={isDark} border={border} code={`"use client";
import React, { useEffect, useState } from "react";
import { getFoundationByTheme } from "@/shared/styles/tokens";
import { useTheme } from "@/shared/styles/theme.context";
import { useAuth } from "@/contexts/auth.context";

export function MinhaPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const f = getFoundationByTheme(theme);
  const isDark = theme === "dark";

  // estado local
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await meuService.list();
        if (!cancelled) setData(res);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-responsive"
      style={{ fontFamily: f.typography.fontFamily.base }}>
      {/* conteúdo */}
    </div>
  );
}`} />
                    </div>
                )}
            </div>
        </div>
    );
}
