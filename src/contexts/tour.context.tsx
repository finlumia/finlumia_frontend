"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth.context";

export type TourStep = {
    id: string;
    title: string;
    description: string;
    tips?: string[];
    target?: string;       // CSS selector for the spotlight element
    position?: "right" | "left" | "bottom" | "top" | "center";
};

// Passos comuns a qualquer usuário. Cada "tip" descreve um submódulo daquela
// área (ex.: dentro de Movimentações, cada bullet é uma tela diferente) —
// como o menu só expande os submódulos ao clicar, o spotlight fica no item
// de nível superior e a explicação de cada submódulo vem nos tips, e não em
// passos extras que dependeriam do menu já estar aberto.
const COMMON_STEPS: TourStep[] = [
    {
        id: "welcome",
        title: "Bem-vindo ao Finlumia",
        description: "Sua plataforma completa de gestão financeira pessoal. Em poucos passos vamos te mostrar como aproveitar ao máximo cada recurso.",
        position: "center",
    },
    {
        id: "dashboard",
        title: "Painel principal",
        description: "Tenha uma visão geral da sua saúde financeira com indicadores atualizados em tempo real.",
        tips: [
            "Saldo líquido, receitas e despesas do período",
            "Movimentações mais recentes em destaque",
            "Taxa de poupança com meta de 20%",
            "Botão \"Nova movimentação\" e atalho flutuante (+) para lançar rápido, de qualquer tela",
        ],
        target: '[data-tour="nav-dashboard"]',
        position: "right",
    },
    {
        id: "movimentation",
        title: "Movimentações",
        description: "O menu Movimentações reúne 5 submódulos — clique em cada um para expandir e navegar.",
        tips: [
            "Transações: lance receitas, despesas e investimentos — o formulário mostra só as categorias que fazem sentido para o tipo escolhido",
            "Orçamento: defina metas de gasto por categoria, forma de pagamento ou banco e acompanhe o quanto já foi usado",
            "Categorias: categorias padrão já vêm prontas; crie as suas e diga se valem para receita, despesa ou ambos",
            "Bancos: cadastre as instituições financeiras que você usa nos lançamentos",
            "Formas de pagamento: pix, cartão, dinheiro e outras formas personalizadas",
        ],
        target: '[data-tour="nav-movimentation"]',
        position: "right",
    },
    {
        id: "reports",
        title: "Relatórios",
        description: "A tela de relatórios é dividida em abas — cada uma responde a uma pergunta específica, em vez de mostrar tudo junto.",
        tips: [
            "Visão geral: fluxo de caixa e saldo por mês",
            "Receita x Despesa: você está gastando mais do que ganha?",
            "Categorias: em que você está gastando mais?",
            "Patrimônio: seu patrimônio está crescendo?",
            "Bancos: onde estão concentradas suas movimentações?",
            "Insights: análises automáticas geradas a partir dos seus lançamentos",
        ],
        target: '[data-tour="nav-reports"]',
        position: "right",
    },
    {
        id: "support",
        title: "Suporte e documentação",
        description: "Precisa de ajuda? Esse menu reúne atendimento e todo o material de consulta da plataforma.",
        tips: [
            "Abrir ticket: descreva sua dúvida ou problema e acompanhe a resposta da equipe",
            "Portal de suporte: veja o histórico e o status de todos os seus chamados",
            "Manual do usuário: passo a passo de cada tela do sistema",
            "Educação financeira: conteúdo para te ajudar a organizar as finanças",
            "Documentação técnica: referência para integrações e detalhes avançados",
        ],
        target: '[data-tour="nav-support"]',
        position: "right",
    },
];

// Visível apenas para administradores — a própria tela é bloqueada por
// papel (ver src/app/dashboard/configurator/layout.tsx), então não faz
// sentido incluir esse passo no tour de quem não tem acesso.
const ADMIN_STEPS: TourStep[] = [
    {
        id: "configurator",
        title: "Configurador",
        description: "Área administrativa para configurar a estrutura de dados e o acesso de usuários ao sistema.",
        tips: [
            "Tabelas e Campos: estrutura do banco de dados",
            "Usuários: contas de acesso e seus dados",
            "Permissões: o que cada papel (admin, gerente, analista, viewer) pode ver e fazer",
            "Funções, Índices e Triggers: automações e performance avançada do banco",
        ],
        target: '[data-tour="nav-configurator"]',
        position: "right",
    },
];

const DONE_STEP: TourStep = {
    id: "done",
    title: "Você está pronto!",
    description: "Agora você já conhece as principais funcionalidades do Finlumia. Comece explorando o painel principal.",
    position: "center",
};

function buildTourSteps(isAdmin: boolean): TourStep[] {
    return [...COMMON_STEPS, ...(isAdmin ? ADMIN_STEPS : []), DONE_STEP];
}

const STORAGE_KEY = "finlumia:tour:done";

type TourContextValue = {
    isActive: boolean;
    stepIndex: number;
    totalSteps: number;
    currentStep: TourStep;
    next: () => void;
    prev: () => void;
    skip: () => void;
    startTour: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const steps = useMemo(() => buildTourSteps(user?.role === "admin"), [user?.role]);

    const [isActive, setIsActive] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    // Se o passo atual deixar de existir (ex.: sessão trocou para um usuário
    // sem papel admin no meio do tour), evita apontar pra um índice inválido.
    useEffect(() => {
        if (stepIndex >= steps.length) setStepIndex(0);
    }, [steps, stepIndex]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const done = localStorage.getItem(STORAGE_KEY);
        if (!done) {
            // Wait for the dashboard to render before starting the tour
            const t = setTimeout(() => setIsActive(true), 900);
            return () => clearTimeout(t);
        }
    }, []);

    const finish = useCallback(() => {
        setIsActive(false);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, "1");
        }
    }, []);

    const next = useCallback(() => {
        setStepIndex((i) => {
            const n = i + 1;
            if (n >= steps.length) {
                finish();
                return i;
            }
            return n;
        });
    }, [finish, steps.length]);

    const prev = useCallback(() => {
        setStepIndex((i) => Math.max(0, i - 1));
    }, []);

    const skip = useCallback(() => {
        finish();
    }, [finish]);

    const startTour = useCallback(() => {
        setStepIndex(0);
        setIsActive(true);
    }, []);

    return (
        <TourContext.Provider value={{
            isActive,
            stepIndex,
            totalSteps: steps.length,
            currentStep: steps[stepIndex] ?? steps[0],
            next,
            prev,
            skip,
            startTour,
        }}>
            {children}
        </TourContext.Provider>
    );
}

export function useTour() {
    const ctx = useContext(TourContext);
    if (!ctx) throw new Error("useTour must be used within TourProvider");
    return ctx;
}
