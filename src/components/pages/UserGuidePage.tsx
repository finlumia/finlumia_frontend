"use client";

import React, { useState } from "react";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";
import { useAuth } from "../../contexts/auth.context";
import type { ThemeMode } from "../../shared/styles/theme.types";

type ModuleId = "getting-started" | "dashboard" | "movimentation" | "reports" | "configurator" | "support";

type Module = {
    id: ModuleId;
    icon: string;
    title: string;
    description: string;
    roles: string[];
    steps: { step: number; title: string; body: string }[];
    tips: string[];
};

const MODULES: Module[] = [
    {
        id: "getting-started",
        icon: "🚀",
        title: "Primeiros passos",
        description: "Como criar sua conta, confirmar seu e-mail e entrar no Finlumia pela primeira vez.",
        roles: ["admin", "gerente", "analista", "viewer"],
        steps: [
            { step: 1, title: "Crie sua conta", body: "Na tela de login, clique em 'Criar conta grátis'. Preencha seu nome, e-mail e uma senha com pelo menos 8 caracteres, aceite os termos e clique em 'Criar minha conta'. Você também pode se cadastrar direto com sua conta Google, clicando em 'Cadastrar com Google' — nesse caso seu e-mail já entra confirmado e você pode pular o passo 2." },
            { step: 2, title: "Confirme seu e-mail", body: "Depois do cadastro, enviamos um código de 6 dígitos para o e-mail informado. Digite o código na tela de verificação para ativar sua conta. Não recebeu? Clique em 'Reenviar código' — o código expira em 10 minutos. Por segurança, o login só funciona depois que o e-mail é confirmado." },
            { step: 3, title: "Faça login", body: "Com a conta ativa, volte para a tela de login e entre com seu e-mail e senha, ou use o botão 'Continuar com Google' se preferir. Marque 'Lembrar-me' se estiver em um dispositivo pessoal para manter a sessão por mais tempo." },
            { step: 4, title: "Esqueceu a senha?", body: "Na tela de login, clique em 'Esqueci minha senha'. Informe seu e-mail, digite o código de 6 dígitos que enviamos e defina uma nova senha. O código de recuperação também expira em 10 minutos." },
        ],
        tips: [
            "Guarde o e-mail usado no cadastro — é ele que recebe os códigos de verificação e recuperação de senha.",
            "Contas criadas com Google não precisam de senha própria: o login sempre acontece pelo botão do Google.",
        ],
    },
    {
        id: "dashboard",
        icon: "📊",
        title: "Painel Principal",
        description: "Visão geral das suas finanças com KPIs e movimentações recentes.",
        roles: ["admin", "gerente", "analista", "viewer"],
        steps: [
            { step: 1, title: "Acesse o Painel", body: "Ao fazer login, você é direcionado automaticamente ao Painel. Clique em 'Painel' no menu lateral para voltar a esta tela a qualquer momento." },
            { step: 2, title: "Leia os cards de resumo", body: "Os 4 cards no topo mostram: Saldo Líquido, Receitas (3 meses), Despesas (3 meses) e Patrimônio Atual. Esses valores são calculados automaticamente com base nas suas transações registradas." },
            { step: 3, title: "Taxa de poupança", body: "O banner colorido abaixo dos cards indica sua taxa de poupança. Verde significa que você está acima da meta de 20%. Amarelo indica que está abaixo — um alerta para revisar seus gastos." },
            { step: 4, title: "Movimentações recentes", body: "A tabela inferior lista as 5 últimas transações. Para ver o histórico completo, acesse o módulo de Movimentações." },
        ],
        tips: [
            "Mantenha suas transações sempre atualizadas para que os KPIs reflitam a realidade.",
            "O patrimônio é calculado com base no saldo acumulado de receitas menos despesas.",
        ],
    },
    {
        id: "movimentation",
        icon: "💸",
        title: "Movimentações",
        description: "Registre, importe e gerencie todas as suas transações financeiras.",
        roles: ["admin", "gerente", "analista", "viewer"],
        steps: [
            { step: 1, title: "Acesse Movimentações", body: "Clique em 'Movimentações' no menu lateral. Na tela inicial você verá o resumo financeiro do período selecionado com gráficos e a lista completa de transações." },
            { step: 2, title: "Registre uma transação manualmente", body: "Clique no botão '+ Nova transação' (canto superior direito). Preencha o tipo (Receita ou Despesa), valor, data, categoria, forma de pagamento e banco. Clique em 'Salvar'." },
            { step: 3, title: "Importe um extrato bancário", body: "Clique em 'Importar' para fazer o upload de um arquivo OFX, CSV ou uma foto/PDF de comprovante. Para OFX e CSV, escolha o banco de origem e confirme — o sistema lê o arquivo e cria as transações automaticamente. Para foto/PDF, revise os dados extraídos (valor, data, descrição) antes de confirmar." },
            { step: 4, title: "Filtre e pesquise", body: "Use os filtros no topo da tabela para buscar por período, tipo (receita/despesa), categoria ou banco. A pesquisa de texto funciona em tempo real." },
            { step: 5, title: "Selecione e exclua em lote", body: "Marque as caixas de seleção na tabela para selecionar múltiplas transações. Um menu de ações aparecerá no topo permitindo excluir ou mover as selecionadas." },
            { step: 6, title: "Gerencie categorias e bancos", body: "Nos submódulos 'Categorias' e 'Bancos' (menu lateral), você pode criar categorias personalizadas com cores e editar ou excluir as existentes." },
        ],
        tips: [
            "Use a importação de extrato OFX ou CSV para agilizar o cadastro de dezenas de transações de uma vez.",
            "Transações importadas de OFX/CSV começam na categoria 'Outros' — você pode recategorizá-las a qualquer momento clicando na transação.",
            "Categorize bem suas despesas para que os relatórios mostrem análises precisas.",
            "Crie um orçamento mensal em 'Orçamento' para monitorar gastos por categoria.",
        ],
    },
    {
        id: "reports",
        icon: "📈",
        title: "Relatórios",
        description: "Análises visuais do seu desempenho financeiro por período, categoria e banco.",
        roles: ["admin", "gerente", "analista", "viewer"],
        steps: [
            { step: 1, title: "Acesse Relatórios", body: "Clique em 'Relatórios' no menu lateral. Você verá um painel com múltiplos gráficos e análises do período atual." },
            { step: 2, title: "Selecione o período", body: "Use o seletor de período no topo para escolher entre últimos 3 meses, 6 meses, 12 meses, este ano ou um intervalo personalizado." },
            { step: 3, title: "Analise o fluxo de caixa", body: "O gráfico de Fluxo de Caixa mostra mês a mês a diferença entre receitas e despesas. Barras positivas indicam meses superavitários, negativas indicam déficit." },
            { step: 4, title: "Distribuição por categoria", body: "O gráfico de pizza mostra como seus gastos se distribuem entre as categorias. Identifique onde está concentrado o maior volume de despesas." },
            { step: 5, title: "Leia os Insights", body: "A seção de Insights apresenta análises automáticas geradas pelo sistema, como 'Gastos com alimentação aumentaram 15% este mês' ou 'Você está dentro da meta de poupança'." },
            { step: 6, title: "Exporte o relatório", body: "Clique em 'Exportar' para baixar o relatório em PDF, CSV ou XLSX. Selecione o formato desejado e o arquivo será gerado e baixado automaticamente." },
        ],
        tips: [
            "Compare períodos diferentes para identificar tendências de crescimento ou redução de gastos.",
            "Os insights são gerados automaticamente — leia-os regularmente para identificar oportunidades de melhoria.",
        ],
    },
    {
        id: "configurator",
        icon: "⚙️",
        title: "Configurador",
        description: "Gerenciamento avançado de tabelas, usuários e permissões do sistema.",
        roles: ["admin"],
        steps: [
            { step: 1, title: "Acesse o Configurador", body: "Disponível apenas para administradores. Clique em 'Configurador' no menu lateral para ver os submódulos: Tabelas, Campos, Usuários, Permissões, Funções, Índices e Triggers." },
            { step: 2, title: "Gerenciar usuários", body: "Em 'Usuários', você pode criar novos usuários do sistema, definir seus perfis (admin, gerente, analista ou viewer), ativar/inativar contas e redefinir senhas." },
            { step: 3, title: "Configurar permissões", body: "Em 'Permissões', a matriz mostra quais módulos cada perfil pode ler, criar, editar ou excluir. Ajuste conforme as necessidades do seu time." },
            { step: 4, title: "Gerenciar estrutura do banco", body: "Em 'Tabelas' e 'Campos', você pode visualizar e configurar a estrutura das tabelas do banco de dados. Use com cautela — alterações afetam toda a plataforma." },
            { step: 5, title: "Funções, Índices e Triggers", body: "Recursos avançados para otimização e automação do banco de dados. Recomendado apenas para usuários com conhecimento técnico em SQL." },
        ],
        tips: [
            "Sempre faça backup antes de modificar a estrutura de tabelas em produção.",
            "Crie novos usuários com o perfil mínimo necessário — conceda permissões extras apenas quando necessário.",
        ],
    },
    {
        id: "support",
        icon: "🎯",
        title: "Suporte",
        description: "Como abrir tickets, acompanhar o status e acessar a documentação.",
        roles: ["admin", "gerente", "analista", "viewer"],
        steps: [
            { step: 1, title: "Abra um ticket", body: "Clique em 'Suporte > Abrir Ticket' no menu lateral. Preencha o título (seja descritivo!), selecione a categoria (Dúvida, Bug, Melhoria, Acesso) e a prioridade, e escreva uma descrição detalhada." },
            { step: 2, title: "Detalhe bem o problema", body: "Na descrição, inclua: o que você estava fazendo, quais passos reproduzem o problema, o que você esperava que acontecesse e o que aconteceu de fato. Quanto mais detalhes, mais rápida será a solução." },
            { step: 3, title: "Acompanhe o status", body: "Na seção 'Meus tickets' (lado direito da mesma tela), você vê todos os tickets abertos e o status de cada um: Aberto → Em análise → Respondido → Fechado." },
            { step: 4, title: "Leia a resposta", body: "Quando a equipe responder, o status do ticket muda para 'Respondido'. Clique no ticket para ver a resposta completa da nossa equipe." },
            { step: 5, title: "Consulte a documentação", body: "Antes de abrir um ticket, consulte o 'Manual do Usuário' (esta tela) e a 'Educação Financeira'. Muitas dúvidas comuns já estão respondidas lá." },
        ],
        tips: [
            "Tickets com prioridade 'Urgente' são atendidos com mais agilidade — use apenas quando realmente necessário.",
            "Para dúvidas rápidas, consulte primeiro este manual — muitas respostas estão aqui.",
        ],
    },
];

export function UserGuidePage() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const border = f.colors.border.default;
    const muted = f.colors.text.muted;
    const primary = f.colors.brand.primary;

    const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");

    const userRole = user?.role ?? "viewer";
    const visibleModules = MODULES.filter((m) => m.roles.includes(userRole));
    const current = MODULES.find((m) => m.id === activeModule) ?? MODULES[0];

    const cardStyle: React.CSSProperties = {
        backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
        borderRadius: "1.2rem",
        border: `1px solid ${border}`,
    };

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "120rem" }}>

            {/* Header */}
            <div style={{ marginBottom: "2.4rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: muted, marginBottom: "0.4rem" }}>
                    Documentação
                </p>
                <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                    Manual do Usuário
                </h1>
                <p style={{ fontSize: "1.4rem", color: muted }}>
                    Aprenda a usar cada módulo do Finlumia com guias passo a passo.
                </p>
            </div>

            {/* Welcome card */}
            <div style={{
                ...cardStyle,
                padding: "2rem 2.4rem",
                background: isDark
                    ? `linear-gradient(135deg, #0D2E1D 0%, #0A1628 100%)`
                    : `linear-gradient(135deg, #E6F4ED 0%, #EFF6FF 100%)`,
                marginBottom: "2.4rem",
                display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap",
            }}>
                <div style={{
                    width: "5.6rem", height: "5.6rem", borderRadius: "50%",
                    backgroundColor: primary, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2.4rem", fontWeight: 700, flexShrink: 0,
                }}>
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div>
                    <h2 style={{ fontSize: "1.7rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.3rem" }}>
                        Olá, {user?.name?.split(" ")[0] ?? "usuário"}! 👋
                    </h2>
                    <p style={{ fontSize: "1.35rem", color: f.colors.text.secondary }}>
                        Seu perfil é <strong>{userRole}</strong>. Este manual mostra os módulos disponíveis para você.
                        Selecione um módulo abaixo para ver o guia completo.
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "26rem 1fr", gap: "2rem", alignItems: "start" }}>

                {/* ── Module list ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    {visibleModules.map((m) => {
                        const isActive = m.id === activeModule;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setActiveModule(m.id)}
                                style={{
                                    textAlign: "left", width: "100%",
                                    padding: "1.3rem 1.6rem", borderRadius: "1rem",
                                    border: `1px solid ${isActive ? primary : border}`,
                                    backgroundColor: isActive ? (isDark ? `${primary}22` : `${primary}11`) : (isDark ? f.colors.bg.elevated : "#FFFFFF"),
                                    cursor: "pointer", fontFamily: "inherit",
                                    transition: "all 0.15s ease",
                                }}
                                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "#F9FAFB"; }}
                                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? f.colors.bg.elevated : "#FFFFFF"; }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ fontSize: "1.8rem" }}>{m.icon}</span>
                                    <div>
                                        <div style={{ fontSize: "1.35rem", fontWeight: isActive ? 700 : 500, color: isActive ? primary : f.colors.text.primary }}>{m.title}</div>
                                        <div style={{ fontSize: "1.15rem", color: muted, marginTop: "0.2rem" }}>{m.steps.length} passos</div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* ── Module content ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>

                    {/* Module header */}
                    <div style={{ ...cardStyle, padding: "2rem 2.4rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "1rem" }}>
                            <span style={{ fontSize: "2.8rem" }}>{current.icon}</span>
                            <div>
                                <h2 style={{ fontSize: "1.9rem", fontWeight: 700, color: f.colors.text.primary }}>{current.title}</h2>
                                <p style={{ fontSize: "1.35rem", color: muted, marginTop: "0.3rem" }}>{current.description}</p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "1.15rem", color: muted }}>Disponível para:</span>
                            {current.roles.map((r) => (
                                <span key={r} style={{
                                    fontSize: "1.15rem", fontWeight: 600,
                                    padding: "0.2rem 0.7rem", borderRadius: "999px",
                                    backgroundColor: isDark ? `${primary}22` : `${primary}11`,
                                    color: primary,
                                }}>{r}</span>
                            ))}
                        </div>
                    </div>

                    {/* Steps */}
                    <div style={{ ...cardStyle, padding: "2rem 2.4rem" }}>
                        <h3 style={{ fontSize: "1.6rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "2rem" }}>
                            Passo a passo
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                            {current.steps.map((step, idx) => (
                                <div key={step.step} style={{ display: "flex", gap: "1.6rem" }}>
                                    {/* Step indicator */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                        <div style={{
                                            width: "3.2rem", height: "3.2rem", borderRadius: "50%",
                                            backgroundColor: primary, color: "#fff",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "1.3rem", fontWeight: 700, flexShrink: 0,
                                        }}>
                                            {step.step}
                                        </div>
                                        {idx < current.steps.length - 1 && (
                                            <div style={{ width: "2px", flex: 1, minHeight: "2.4rem", backgroundColor: `${primary}33`, margin: "0.4rem 0" }} />
                                        )}
                                    </div>
                                    {/* Step content */}
                                    <div style={{ paddingBottom: idx < current.steps.length - 1 ? "2rem" : "0", flex: 1 }}>
                                        <h4 style={{ fontSize: "1.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.5rem" }}>{step.title}</h4>
                                        <p style={{ fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.65 }}>{step.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    {current.tips.length > 0 && (
                        <div style={{ ...cardStyle, padding: "2rem 2.4rem" }}>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                <span>💡</span> Dicas úteis
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {current.tips.map((tip, i) => (
                                    <div key={i} style={{
                                        padding: "1.2rem 1.4rem", borderRadius: "0.9rem",
                                        backgroundColor: isDark ? "#1A2E1A" : "#ECFDF5",
                                        border: `1px solid ${f.colors.feedback.success}40`,
                                        display: "flex", gap: "1rem",
                                        fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.6,
                                    }}>
                                        <span style={{ color: f.colors.feedback.success, fontSize: "1.4rem", flexShrink: 0 }}>✓</span>
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick help */}
                    <div style={{
                        ...cardStyle, padding: "1.6rem 2rem",
                        display: "flex", alignItems: "center", gap: "1.4rem",
                        flexWrap: "wrap",
                    }}>
                        <div style={{ fontSize: "2rem" }}>🎫</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "1.4rem", fontWeight: 600, color: f.colors.text.primary }}>Ainda com dúvidas?</div>
                            <div style={{ fontSize: "1.3rem", color: muted }}>Abra um ticket de suporte e nossa equipe responderá em breve.</div>
                        </div>
                        <a
                            href="/dashboard/support/ticket"
                            style={{
                                backgroundColor: primary, color: "#fff",
                                border: "none", borderRadius: "0.9rem",
                                padding: "0.9rem 1.8rem",
                                fontSize: "1.3rem", fontWeight: 600,
                                cursor: "pointer", fontFamily: "inherit",
                                textDecoration: "none", display: "inline-block",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Abrir ticket
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Accessibility & Visual Themes ── */}
            <AccessibilitySection f={f} isDark={isDark} border={border} muted={muted} primary={primary} />
        </div>
    );
}

// ── Accessibility section ─────────────────────────────────────────────────

const CUD_PALETTE: Array<{ name: string; hex: string; cvd: string }> = [
    { name: "Preto",         hex: "#000000", cvd: "Neutro — âncora de contraste máximo" },
    { name: "Laranja",       hex: "#E69F00", cvd: "Deuteranopia/Protanopia: distinguível do azul e verde" },
    { name: "Azul-céu",      hex: "#56B4E9", cvd: "Tritanopia: separado do laranja e vermelhão" },
    { name: "Verde-azulado", hex: "#009E73", cvd: "Distinto do vermelho em todos os tipos de DCF" },
    { name: "Amarelo",       hex: "#F0E442", cvd: "Alto contraste; legível mesmo sem percepção de matiz" },
    { name: "Azul",          hex: "#0072B2", cvd: "Cor principal do modo Daltonismo — 4.9:1 em fundo branco" },
    { name: "Vermelhão",     hex: "#D55E00", cvd: "Distinto do verde em deuteranopia e protanopia" },
    { name: "Lilás-rosado",  hex: "#CC79A7", cvd: "Diferenciador para tritanopia; evita confusão azul/verde" },
];

function AccessibilitySection({ f, isDark, border, muted, primary }: {
    f: ReturnType<typeof getFoundationByTheme>;
    isDark: boolean; border: string; muted: string; primary: string;
}) {
    const { theme, setTheme } = useTheme();

    const cardStyle: React.CSSProperties = {
        backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
        borderRadius: "1.2rem",
        border: `1px solid ${border}`,
    };

    const themeOptions: Array<{ id: ThemeMode; icon: string; label: string; desc: string; bg: string; accent: string }> = [
        { id: "light",      icon: "☀️",  label: "Modo Claro",       desc: "Interface padrão. Fundo claro com texto escuro.",           bg: "#F0F7F5", accent: "#0F766E" },
        { id: "dark",       icon: "🌙",  label: "Modo Escuro",       desc: "Fundo escuro quente. Reduz cansaço em ambientes com pouca luz.", bg: "#0E1C20", accent: "#1EC6B2" },
        { id: "colorblind", icon: "👁️", label: "Daltonismo (CUD)",   desc: "Paleta Wong/Okabe-Ito. Distinguível em todos os tipos de DCF.", bg: "#F5F8FA", accent: "#0072B2" },
    ];

    return (
        <div style={{ marginTop: "3.2rem" }}>

            {/* Section header */}
            <div style={{ marginBottom: "2rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: muted, marginBottom: "0.4rem" }}>
                    Acessibilidade Visual
                </p>
                <h2 style={{ fontSize: "2rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                    Temas e modos de visualização
                </h2>
                <p style={{ fontSize: "1.4rem", color: muted }}>
                    O Finlumia oferece três modos visuais. Alterne pelo botão no rodapé do menu lateral.
                </p>
            </div>

            {/* Theme cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.4rem", marginBottom: "2.4rem" }}>
                {themeOptions.map((t) => {
                    const isActive = theme === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            style={{
                                textAlign: "left", padding: "1.6rem",
                                borderRadius: "1.2rem",
                                border: `2px solid ${isActive ? t.accent : border}`,
                                backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                                cursor: "pointer", fontFamily: "inherit",
                                transition: "border-color 0.15s, box-shadow 0.15s",
                                boxShadow: isActive ? `0 0 0 3px ${t.accent}30` : "none",
                            }}
                        >
                            {/* Preview strip */}
                            <div style={{
                                height: "4rem", borderRadius: "0.6rem", marginBottom: "1.2rem",
                                backgroundColor: t.bg,
                                border: `1px solid ${border}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                gap: "0.5rem",
                            }}>
                                {[t.accent, t.id === "light" ? "#006644" : t.id === "dark" ? "#56D364" : "#009E73",
                                  t.id === "light" ? "#B91C1C" : t.id === "dark" ? "#FF8066" : "#D55E00",
                                  t.id === "light" ? "#7A4500" : t.id === "dark" ? "#F0E442" : "#E69F00",
                                ].map((c, i) => (
                                    <div key={i} style={{ width: "1.4rem", height: "1.4rem", borderRadius: "50%", backgroundColor: c }} />
                                ))}
                            </div>
                            <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>{t.icon}</div>
                            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.3rem" }}>
                                {t.label}
                                {isActive && (
                                    <span style={{
                                        marginLeft: "0.6rem", fontSize: "1.1rem", fontWeight: 600,
                                        padding: "0.1rem 0.6rem", borderRadius: "999px",
                                        backgroundColor: `${t.accent}20`, color: t.accent,
                                    }}>ativo</span>
                                )}
                            </div>
                            <div style={{ fontSize: "1.25rem", color: muted, lineHeight: 1.5 }}>{t.desc}</div>
                        </button>
                    );
                })}
            </div>

            {/* CUD palette explanation */}
            <div style={{ ...cardStyle, padding: "2rem 2.4rem", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.5rem" }}>
                    Paleta CUD — Color Universal Design
                </h3>
                <p style={{ fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.65, marginBottom: "1.6rem" }}>
                    O modo <strong>Daltonismo</strong> utiliza a paleta de 8 cores de Wong (2011), reconhecida como
                    padrão internacional para design de informação acessível. Cada cor foi selecionada para ser
                    distinguível sob os três principais tipos de deficiência de cor (DCF):
                    <strong> deuteranopia</strong> (dificuldade com verde),
                    <strong> protanopia</strong> (dificuldade com vermelho) e
                    <strong> tritanopia</strong> (dificuldade com azul).
                </p>

                {/* Palette swatches */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.6rem" }}>
                    {CUD_PALETTE.map((c) => (
                        <div key={c.hex} style={{
                            borderRadius: "0.8rem",
                            border: `1px solid ${border}`,
                            overflow: "hidden",
                        }}>
                            <div style={{ height: "3.6rem", backgroundColor: c.hex }} />
                            <div style={{ padding: "0.8rem 1rem", backgroundColor: isDark ? f.colors.bg.surface : "#FAFAFA" }}>
                                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: f.colors.text.primary }}>{c.name}</div>
                                <div style={{ fontSize: "1.0rem", fontFamily: "monospace", color: muted }}>{c.hex}</div>
                                <div style={{ fontSize: "1.0rem", color: muted, lineHeight: 1.4, marginTop: "0.3rem" }}>{c.cvd}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Academic reference */}
                <div style={{
                    padding: "1.4rem 1.6rem", borderRadius: "0.8rem",
                    backgroundColor: isDark ? f.colors.bg.surface : "#F0F7F5",
                    border: `1px solid ${primary}30`,
                }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>
                        Referência Acadêmica
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        <p style={{ fontSize: "1.3rem", color: f.colors.text.secondary, lineHeight: 1.6, margin: 0 }}>
                            <strong>Wong, B.</strong> (2011). Points of view: Color blindness.
                            <em> Nature Methods</em>, 8(6), 441.
                            DOI: <span style={{ fontFamily: "monospace" }}>10.1038/nmeth.1618</span>
                            {" "}— <em>Springer Nature / Nature Portfolio.</em>
                        </p>
                        <p style={{ fontSize: "1.3rem", color: f.colors.text.secondary, lineHeight: 1.6, margin: 0 }}>
                            <strong>Okabe, M. & Ito, K.</strong> (2008). Color Universal Design (CUD): How to make figures
                            and presentations that are friendly to colorblind people.
                            <em> Jfly — Universität zu Köln / University of Tokyo.</em>
                        </p>
                        <p style={{ fontSize: "1.25rem", color: muted, marginTop: "0.4rem", margin: 0 }}>
                            Estes artigos fundamentam a escolha das 8 cores da paleta CUD usada no modo Daltonismo.
                            Aproximadamente 8% dos homens e 0,5% das mulheres possuem algum tipo de DCF
                            (Birch, J., 2012 — <em>Journal of the Optical Society of America A</em>).
                        </p>
                    </div>
                </div>
            </div>

            {/* Practical tips */}
            <div style={{ ...cardStyle, padding: "1.6rem 2rem" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "1rem" }}>
                    💡 Quando usar cada modo
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                    {[
                        { icon: "☀️", title: "Modo Claro", body: "Ideal para uso diurno em ambientes iluminados. Paleta teal-verde com alto contraste." },
                        { icon: "🌙", title: "Modo Escuro", body: "Recomendado para uso noturno ou ambientes escuros. Fundo quente (#0E1C20) reduz a emissão de luz azul e o cansaço ocular em sessões prolongadas." },
                        { icon: "👁️", title: "Modo Daltonismo", body: "Indicado para usuários com DCF (deuteranopia, protanopia ou tritanopia) ou para apresentações em projetores com baixa fidelidade de cores." },
                    ].map((tip) => (
                        <div key={tip.title} style={{
                            display: "flex", gap: "1rem", alignItems: "flex-start",
                            padding: "1rem 1.2rem", borderRadius: "0.8rem",
                            backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app,
                            border: `1px solid ${border}`,
                        }}>
                            <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{tip.icon}</span>
                            <div>
                                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.2rem" }}>{tip.title}</div>
                                <div style={{ fontSize: "1.25rem", color: f.colors.text.secondary, lineHeight: 1.55 }}>{tip.body}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
