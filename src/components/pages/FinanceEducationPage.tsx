"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { getFoundationByTheme } from "../../shared/styles/tokens";
import { useTheme } from "../../shared/styles/theme.context";

// ── Types & Data ─────────────────────────────────────────────────────────────

type Category = "fundamentos" | "investimentos" | "planejamento" | "credito" | "glossario";
type Level = "iniciante" | "intermediario" | "avancado";

type Article = {
    id: string;
    category: Category;
    icon: string;
    title: string;
    summary: string;
    readTime: string;
    tags: string[];
    content: string;
    level: Level;
};

/** Trilha de aprendizado — do básico ao avançado. Cada fase agrupa os artigos
 * do mesmo `level` e mostra progresso de leitura, para dar ao usuário uma
 * noção clara de onde está e o que falta estudar na plataforma. */
const LEVELS: { id: Level; label: string; emoji: string; description: string }[] = [
    { id: "iniciante", label: "Iniciante", emoji: "🌱", description: "Organize as bases: orçamento, reserva de emergência e primeiros conceitos de investimento." },
    { id: "intermediario", label: "Intermediário", emoji: "🧭", description: "Defina metas, planeje a aposentadoria e comece a diversificar seus investimentos." },
    { id: "avancado", label: "Avançado", emoji: "🚀", description: "Monte e rebalanceie carteiras, otimize impostos e refine sua estratégia de longo prazo." },
];

type Book = {
    id: string;
    title: string;
    author: string;
    blurb: string;
    level: Level;
    kind: "pessoais" | "investimentos";
};

/** Recomendações de leitura complementares — livros clássicos de finanças
 * pessoais e de investimentos, com nível sugerido para encaixar na trilha. */
const BOOKS: Book[] = [
    { id: "b1", title: "O Homem Mais Rico da Babilônia", author: "George S. Clason", level: "iniciante", kind: "pessoais",
      blurb: "Parábolas atemporais sobre poupar, controlar gastos e fazer o dinheiro trabalhar para você." },
    { id: "b2", title: "Pai Rico, Pai Pobre", author: "Robert Kiyosaki", level: "iniciante", kind: "pessoais",
      blurb: "Muda a forma de pensar sobre ativos x passivos e o papel da educação financeira." },
    { id: "b3", title: "Os Segredos da Mente Milionária", author: "T. Harv Eker", level: "intermediario", kind: "pessoais",
      blurb: "Como crenças e hábitos inconscientes sobre dinheiro moldam seus resultados financeiros." },
    { id: "b4", title: "Casais Inteligentes Enriquecem Juntos", author: "Gustavo Cerbasi", level: "intermediario", kind: "pessoais",
      blurb: "Planejamento financeiro familiar na prática, com exemplos e números do contexto brasileiro." },
    { id: "b5", title: "A Psicologia Financeira", author: "Morgan Housel", level: "avancado", kind: "pessoais",
      blurb: "Por que comportamento pesa mais que conhecimento técnico nas decisões de dinheiro." },
    { id: "b6", title: "Do Mil ao Milhão", author: "Thiago Nigro (Primo Rico)", level: "iniciante", kind: "investimentos",
      blurb: "Guia direto para sair da poupança e dar os primeiros passos como investidor no Brasil." },
    { id: "b7", title: "Um Passo à Frente de Wall Street", author: "Peter Lynch", level: "intermediario", kind: "investimentos",
      blurb: "Como identificar boas empresas para investir observando o que já está ao seu redor." },
    { id: "b8", title: "Os Axiomas de Zurique", author: "Max Gunther", level: "intermediario", kind: "investimentos",
      blurb: "Princípios práticos sobre risco, especulação e quando é hora de vender." },
    { id: "b9", title: "O Investidor Inteligente", author: "Benjamin Graham", level: "avancado", kind: "investimentos",
      blurb: "A obra fundadora do value investing — análise fundamentalista e margem de segurança." },
    { id: "b10", title: "Ações Comuns, Lucros Extraordinários", author: "Philip Fisher", level: "avancado", kind: "investimentos",
      blurb: "Como avaliar a qualidade de uma empresa além dos números, com foco em longo prazo." },
];

const READ_KEY = "finlumia-education-read-articles";

function loadReadIds(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
        const raw = window.localStorage.getItem(READ_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function saveReadIds(ids: Set<string>) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
    } catch {
        /* ignore quota / serialization errors */
    }
}

const CATEGORIES: { id: Category | "all"; label: string; emoji: string }[] = [
    { id: "all",           label: "Todos",             emoji: "📚" },
    { id: "fundamentos",   label: "Fundamentos",       emoji: "🧱" },
    { id: "investimentos", label: "Investimentos",     emoji: "📈" },
    { id: "planejamento",  label: "Planejamento",      emoji: "🎯" },
    { id: "credito",       label: "Crédito & Dívidas", emoji: "💳" },
    { id: "glossario",     label: "Glossário",         emoji: "📖" },
];

const LEVEL_CONFIG = {
    iniciante:     { label: "Iniciante",     color: "#059669", bg: "#ECFDF5" },
    intermediario: { label: "Intermediário", color: "#D97706", bg: "#FFFBEB" },
    avancado:      { label: "Avançado",      color: "#7C3AED", bg: "#F5F3FF" },
};

const ARTICLES: Article[] = [
    {
        id: "a1",
        category: "fundamentos",
        icon: "💰",
        title: "O que é orçamento pessoal e por que ele importa",
        summary: "Entenda como um orçamento mensal transforma sua relação com o dinheiro e garante que você saiba para onde cada real vai.",
        readTime: "5 min",
        tags: ["orçamento", "controle financeiro", "básico"],
        level: "iniciante",
        content: `## O que é orçamento pessoal?

Um orçamento pessoal é um plano financeiro que mapeia suas receitas e despesas durante um período — geralmente mensal. Ele responde à pergunta: **"Para onde vai o meu dinheiro?"**

## Por que fazer um orçamento?

Sem orçamento, o dinheiro "desaparece". Com ele, você:
- Sabe exatamente quanto ganha e quanto gasta
- Identifica gastos desnecessários
- Consegue poupar para objetivos específicos
- Evita surpresas e dívidas

## Como montar seu primeiro orçamento

**1. Liste todas as suas receitas**
Salário, freelas, aluguéis, dividendos — tudo que entra.

**2. Liste todas as despesas fixas**
Aluguel, financiamentos, assinaturas — valores que não mudam.

**3. Liste as despesas variáveis**
Alimentação, transporte, lazer — valores que flutuam.

**4. Calcule o saldo**
Receitas - Despesas = Saldo. Se negativo, você gasta mais do que ganha.

**5. Ajuste e monitore**
Reduza gastos ou aumente receitas até o saldo ser positivo. Revise mensalmente.

## A regra 50-30-20

Uma das metodologias mais populares:
- **50%** da renda líquida para necessidades (moradia, alimentação, saúde)
- **30%** para desejos (lazer, roupas, restaurantes)
- **20%** para poupança e investimentos

Use o Finlumia para categorizar cada transação e ver automaticamente onde se encaixa!`,
    },
    {
        id: "a2",
        category: "fundamentos",
        icon: "🛡️",
        title: "Reserva de emergência: o seu escudo financeiro",
        summary: "Saiba por que você precisa de uma reserva de emergência antes de começar a investir, e como calculá-la.",
        readTime: "6 min",
        tags: ["reserva", "emergência", "segurança financeira"],
        level: "iniciante",
        content: `## O que é uma reserva de emergência?

É um valor guardado em uma aplicação de alta liquidez (fácil de resgatar) destinado exclusivamente a imprevistos: demissão, problemas de saúde, conserto do carro, etc.

## Quanto guardar?

A regra geral é ter entre **3 e 12 meses** de despesas mensais:
- **3 meses**: para quem tem renda estável (CLT, servidor público)
- **6 meses**: para autônomos e freelancers
- **12 meses**: para empresários ou profissões com alta volatilidade

## Onde guardar?

A reserva precisa estar em um local com:
✅ **Alta liquidez** — você pode resgatar rapidamente
✅ **Baixo risco** — não pode perder valor
✅ **Rendimento** — pelo menos equivalente à inflação

Boas opções: CDB com liquidez diária, Tesouro Selic, conta remunerada.

❌ NÃO invista a reserva em: ações, fundos imobiliários, CDB sem liquidez.

## Como construir sua reserva

1. Calcule suas despesas mensais totais
2. Multiplique por 3, 6 ou 12 (conforme seu perfil)
3. Defina um valor mensal para poupar (ex: 10-20% da renda)
4. Automatize a transferência no dia do salário
5. Não toque no dinheiro exceto em verdadeiras emergências

## Por que isso vem antes dos investimentos?

Sem reserva, qualquer imprevisto te força a resgatar investimentos no pior momento ou contrair dívidas. A reserva é a base da pirâmide financeira.`,
    },
    {
        id: "a3",
        category: "investimentos",
        icon: "📈",
        title: "Renda Fixa vs Renda Variável: qual escolher?",
        summary: "Descubra as diferenças entre os dois grandes mundos dos investimentos e como cada um se encaixa no seu perfil.",
        readTime: "8 min",
        tags: ["renda fixa", "renda variável", "investimentos", "perfil"],
        level: "iniciante",
        content: `## Renda Fixa

Na renda fixa, você **sabe com antecedência** como seu dinheiro vai render.

**Exemplos:**
- Tesouro Direto (títulos do governo)
- CDB (bancos)
- LCI e LCA (letras de crédito)
- Debêntures (empresas)

**Vantagens:**
- Previsibilidade
- Menor risco (especialmente Tesouro e CDB até R$250k cobertos pelo FGC)
- Boa opção para objetivos de curto e médio prazo

**Desvantagens:**
- Rendimento menor no longo prazo
- Pode não superar a inflação em algumas situações

## Renda Variável

Na renda variável, o retorno **não é garantido** — pode ser muito alto ou negativo.

**Exemplos:**
- Ações (empresas na bolsa)
- Fundos Imobiliários (FIIs)
- ETFs (fundos de índice)
- Criptomoedas

**Vantagens:**
- Maior potencial de retorno no longo prazo
- Participação nos lucros das empresas
- Proteção contra inflação

**Desvantagens:**
- Volatilidade (o preço sobe e cai)
- Requer mais estudo e paciência
- Não recomendado para objetivos de curto prazo

## Como escolher?

Depende do seu **perfil de investidor** e **objetivo**:

| Objetivo | Prazo | Indicação |
|---------|-------|-----------|
| Reserva de emergência | Imediato | Renda fixa com liquidez |
| Viagem | 1-2 anos | Renda fixa |
| Aposentadoria | +10 anos | Mix renda fixa + variável |

A maioria dos especialistas recomenda uma **carteira diversificada** com os dois tipos.`,
    },
    {
        id: "a4",
        category: "investimentos",
        icon: "🏛️",
        title: "Tesouro Direto para iniciantes",
        summary: "O jeito mais simples e seguro de começar a investir com pouco dinheiro, diretamente com o governo.",
        readTime: "7 min",
        tags: ["tesouro direto", "renda fixa", "governo", "iniciante"],
        level: "iniciante",
        content: `## O que é o Tesouro Direto?

É um programa do governo federal que permite que pessoas físicas invistam em títulos da dívida pública. Você empresta dinheiro ao governo e recebe de volta com juros.

## Por que é seguro?

É o investimento mais seguro do Brasil — garantido pelo governo federal. Nenhum banco ou empresa tem essa garantia.

## Tipos de títulos

**Tesouro Selic (LFT)**
- Acompanha a taxa básica de juros (Selic)
- Ideal para reserva de emergência
- Liquidez diária

**Tesouro IPCA+ (NTN-B)**
- Rende IPCA + taxa fixa
- Proteção contra inflação
- Ideal para longo prazo (aposentadoria)

**Tesouro Prefixado (LTN)**
- Taxa fixa definida na compra
- Você sabe exatamente quanto vai receber no vencimento
- Cuidado: se precisar vender antes, pode ter prejuízo

## Como investir

1. Abra conta em uma corretora (XP, Rico, Clear, etc.) ou banco
2. Acesse o Tesouro Direto pelo app ou plataforma
3. Escolha o título conforme seu objetivo
4. Invista a partir de R$ 30
5. Acompanhe pelo app ou pelo Finlumia

## Impostos

O Tesouro Direto tem **Imposto de Renda regressivo**:
- Até 180 dias: 22,5%
- 181 a 360 dias: 20%
- 361 a 720 dias: 17,5%
- Acima de 720 dias: 15% ← ideal ficar até aqui!`,
    },
    {
        id: "a5",
        category: "planejamento",
        icon: "🎯",
        title: "Como definir e alcançar metas financeiras",
        summary: "Use o método SMART para transformar sonhos em objetivos concretos com prazo e valor definidos.",
        readTime: "7 min",
        tags: ["metas", "planejamento", "SMART", "objetivos"],
        level: "intermediario",
        content: `## Por que definir metas financeiras?

"Quem não sabe onde quer chegar, qualquer caminho serve." Metas financeiras dão direção ao seu dinheiro e motivação para manter a disciplina.

## O método SMART

As melhores metas são:
- **S**pecific (Específica): "quero comprar um carro" → "quero comprar um Honda City 2024"
- **M**easurable (Mensurável): "quero R$ 45.000 à vista"
- **A**chievable (Alcançável): compatível com sua renda atual
- **R**elevant (Relevante): que realmente importa para você
- **T**ime-bound (Temporal): "em 3 anos"

**Exemplo completo:** "Quero comprar um Honda City 2024 por R$ 45.000 em 3 anos, poupando R$ 1.250 por mês."

## Tipos de metas por prazo

**Curto prazo (até 1 ano)**
- Quitar cartão de crédito
- Fazer uma viagem
- Comprar um eletrodoméstico

**Médio prazo (1 a 5 anos)**
- Dar entrada em um imóvel
- Trocar de carro
- Montar um fundo de emergência robusto

**Longo prazo (acima de 5 anos)**
- Aposentadoria
- Independência financeira
- Educação dos filhos

## Calculando quanto poupar

Fórmula simples:
**Valor da meta ÷ Número de meses = Valor mensal a poupar**

Para metas longas, leve em conta os juros compostos — investindo o dinheiro, ele cresce sozinho ao longo do tempo!

## No Finlumia

Use o módulo de Orçamento para criar categorias específicas para cada meta e monitorar o progresso mês a mês.`,
    },
    {
        id: "a6",
        category: "planejamento",
        icon: "👴",
        title: "Aposentadoria: quanto você precisa e como chegar lá",
        summary: "Entenda a regra dos 25x, como o INSS funciona e por que começar cedo faz toda a diferença.",
        readTime: "10 min",
        tags: ["aposentadoria", "previdência", "independência financeira", "longo prazo"],
        level: "intermediario",
        content: `## O problema da aposentadoria pública

O INSS tem um teto de contribuição e benefício. Em 2024, o teto do benefício é de aproximadamente R$ 7.786. Se você precisa de mais para manter seu padrão de vida, precisa de fontes alternativas.

## A regra dos 25x (ou 300x)

Para se aposentar com independência financeira:
- Some todas as suas despesas mensais
- Multiplique por 300 (25 anos × 12 meses)
- Esse é o patrimônio necessário para viver dos juros

**Exemplo:** Despesas mensais de R$ 5.000 × 300 = R$ 1.500.000

Com essa quantia investida a 6% ao ano real (acima da inflação), você retira R$ 5.000/mês para sempre.

## O poder dos juros compostos no tempo

Investindo R$ 500/mês com 8% ao ano:
- Em 10 anos: ≈ R$ 91.000
- Em 20 anos: ≈ R$ 295.000
- Em 30 anos: ≈ R$ 745.000
- Em 40 anos: ≈ R$ 1.745.000

**Comece cedo — cada ano perdido no início custa muito mais no futuro.**

## Como se planejar

1. Estime suas despesas mensais na aposentadoria
2. Calcule o patrimônio necessário (× 300)
3. Calcule quanto falta do INSS
4. Defina o quanto precisa acumular com investimentos próprios
5. Calcule o aporte mensal necessário (considere os juros compostos)
6. Escolha os investimentos: PGBL/VGBL, ações, fundos, Tesouro IPCA+

## Onde investir para aposentadoria?

- **Tesouro IPCA+** longo prazo (20-30 anos)
- **Previdência Privada (PGBL/VGBL)** para dedução no IR
- **Fundos de Ações** para quem aceita mais risco
- **FIIs** para renda passiva de aluguéis`,
    },
    {
        id: "a7",
        category: "credito",
        icon: "💳",
        title: "Juros do cartão de crédito: o inimigo número 1 das finanças",
        summary: "Entenda como os juros rotativos funcionam e por que quitar o cartão é sempre prioridade absoluta.",
        readTime: "6 min",
        tags: ["cartão de crédito", "juros", "dívidas", "rotativo"],
        level: "iniciante",
        content: `## Os juros do rotativo: os maiores do mundo

O Brasil tem os **juros rotativos mais altos do mundo**. Em 2024, chegam a mais de 400% ao ano. Isso significa que uma dívida de R$ 1.000 pode se transformar em R$ 5.000 em um único ano.

## Como funciona o rotativo

Quando você paga apenas o mínimo do cartão (geralmente 15% da fatura), o valor restante entra no crédito rotativo com esses juros astronômicos.

**Exemplo devastador:**
- Dívida: R$ 3.000
- Pagamento mínimo mensal: R$ 450
- Juros mensais: ~15%
- Resultado: você nunca quita a dívida pagando apenas o mínimo

## Estratégias para sair do rotativo

**1. Bola de neve (menor dívida primeiro)**
- Liste todas as dívidas do menor para o maior valor
- Pague o mínimo em todas, exceto na menor
- Concentre todo o dinheiro extra na menor
- Ao quitar, migre o valor para a próxima

**2. Avalanche (maior juro primeiro)**
- Liste todas as dívidas do maior para o menor juro
- Pague o mínimo em todas, exceto na de maior juro
- Concentre o dinheiro extra na de maior juro (geralmente o cartão)
- Economiza mais dinheiro no total

## Alternativas ao rotativo

Se você tem dívida no cartão:
- Empréstimo pessoal (juros menores)
- Consignado (se CLT ou servidor)
- Cheque especial (ainda alto, mas menor que rotativo)
- Negociar diretamente com o banco

## Regra de ouro

**Nunca pague o mínimo do cartão de crédito.**
Sempre pague a fatura inteira. Se não conseguir, não gaste no cartão.`,
    },
    {
        id: "a8",
        category: "credito",
        icon: "📊",
        title: "Score de crédito: como funciona e como melhorar",
        summary: "Entenda o que é o score, por que importa e quais ações constroem (ou destroem) sua pontuação.",
        readTime: "6 min",
        tags: ["score", "crédito", "Serasa", "SPC", "CPF"],
        level: "iniciante",
        content: `## O que é o score de crédito?

É uma pontuação (geralmente de 0 a 1000) que representa a probabilidade de você pagar suas dívidas em dia. Bancos, financeiras e até locadoras usam esse score para decidir se aprovam crédito e qual taxa de juros cobrar.

## Como o score é calculado?

Os bureaus de crédito (Serasa, SPC, Boa Vista) consideram:
- **Histórico de pagamentos** (maior peso)
- **Tempo de relacionamento** com o mercado financeiro
- **Utilização de crédito** disponível
- **Consultas recentes** ao CPF
- **Dívidas negativadas** ou protestos

## Faixas de score (Serasa)

| Pontuação | Classificação | Risco para credores |
|-----------|--------------|---------------------|
| 0 - 300   | Muito baixo  | Muito alto          |
| 301 - 500 | Baixo        | Alto                |
| 501 - 700 | Regular      | Médio               |
| 701 - 850 | Bom          | Baixo               |
| 851 - 1000| Excelente    | Muito baixo         |

## Como melhorar seu score

✅ **Pague contas em dia** — o fator mais importante
✅ **Quite dívidas negativadas** — e aguarde atualização (pode levar 5 dias úteis)
✅ **Mantenha o CPF limpo** — evite atrasos de qualquer valor
✅ **Use crédito com responsabilidade** — não use 100% do limite
✅ **Tenha contas no seu CPF** — luz, água, internet ajudam a construir histórico
✅ **Cadastre-se no Registrato** — centraliza sua vida financeira

❌ **Não**: checar o score repetidamente não ajuda (é consulta passiva, não prejudica)`,
    },
    {
        id: "g1",
        category: "glossario",
        icon: "📖",
        title: "Glossário financeiro: termos essenciais",
        summary: "Os principais termos do mundo financeiro explicados de forma simples e direta.",
        readTime: "10 min",
        tags: ["glossário", "termos", "conceitos", "vocabulário"],
        level: "iniciante",
        content: `## Termos de Investimento

**Ação:** Fração do capital de uma empresa. Ao comprar uma ação, você se torna sócio.

**Dividendos:** Parte do lucro das empresas distribuída aos acionistas.

**FII (Fundo de Investimento Imobiliário):** Fundo que investe em imóveis. Você recebe aluguéis mensais.

**CDB (Certificado de Depósito Bancário):** Você empresta dinheiro para o banco e recebe juros.

**CDI (Certificado de Depósito Interbancário):** Taxa de juros entre bancos. Base de comparação para renda fixa (ex: "rende 100% do CDI").

**IPCA:** Índice de Preços ao Consumidor Amplo — a inflação oficial do Brasil.

**Selic:** Taxa básica de juros da economia, definida pelo Banco Central.

**LCI/LCA:** Letras de Crédito Imobiliário/Agronegócio — isentas de IR para pessoa física.

**ETF:** Fundo de índice negociado em bolsa. Ex: BOVA11 replica o Ibovespa.

## Termos de Crédito

**Juros compostos:** Juros sobre juros. O maior aliado (quando você investe) ou inimigo (quando você deve).

**Rotativo:** Crédito automático do cartão quando você não paga a fatura inteira.

**IOF:** Imposto sobre Operações Financeiras — incide sobre crédito e câmbio.

**Spread:** Diferença entre o custo do dinheiro para o banco e o que você paga.

**Amortização:** Pagamento gradual de uma dívida.

## Termos de Finanças Pessoais

**Fluxo de caixa:** Entradas menos saídas de dinheiro em um período.

**Liquidez:** Facilidade de converter um ativo em dinheiro. Tesouro Selic tem alta liquidez.

**Rentabilidade:** Quanto um investimento rendeu em um período.

**Diversificação:** Distribuir investimentos entre diferentes tipos de ativos para reduzir risco.

**Patrimônio líquido:** Tudo que você tem (ativos) menos tudo que você deve (passivos).

**Inflação:** Aumento geral dos preços ao longo do tempo. Corrói o poder de compra.`,
    },
    {
        id: "a9",
        category: "investimentos",
        icon: "📐",
        title: "Alocação de ativos: como montar e rebalancear sua carteira",
        summary: "Depois do básico, o próximo passo é decidir quanto colocar em cada classe de ativo — e revisar isso com disciplina.",
        readTime: "9 min",
        tags: ["alocação de ativos", "carteira", "rebalanceamento", "avançado"],
        level: "avancado",
        content: `## O que é alocação de ativos?

É a decisão de quanto do seu patrimônio fica em cada classe: renda fixa, ações, FIIs, exterior, reserva de oportunidade. Estudos mostram que essa decisão explica a maior parte da variação de retorno de uma carteira no longo prazo — mais do que escolher o "ativo certo".

## Perfis de referência

- **Conservador:** 70-90% renda fixa, 10-30% renda variável
- **Moderado:** 40-60% renda fixa, 40-60% renda variável
- **Arrojado:** 10-30% renda fixa, 70-90% renda variável

Esses números são ponto de partida — ajuste conforme prazo do objetivo e sua tolerância real a oscilações (não só a que você imagina ter).

## Por que rebalancear?

Com o tempo, os ativos que mais subiram passam a pesar mais na carteira do que o planejado, aumentando o risco sem você decidir isso conscientemente. Rebalancear é vender um pouco do que subiu e comprar o que ficou para trás, voltando à proporção-alvo.

## Duas formas de rebalancear

**1. Por calendário**
Revise a carteira a cada 6 ou 12 meses, independente do que aconteceu no período.

**2. Por banda de desvio**
Rebalanceie quando uma classe se desviar mais de X pontos percentuais do alvo (ex: 5 p.p.), em vez de esperar uma data fixa.

## Erro comum

Rebalancear com base em "achismo" ou notícia do momento. A alocação-alvo deve ser definida com cabeça fria, e o rebalanceamento deve ser mecânico — é exatamente o que evita comprar caro e vender barato por impulso.

## No Finlumia

Use os Relatórios para acompanhar a distribuição atual da sua carteira por categoria e identificar quando algo saiu do alvo definido.`,
    },
    {
        id: "a10",
        category: "investimentos",
        icon: "🧾",
        title: "Otimização tributária para investidores: come-cotas, IR e isenções",
        summary: "Pagar menos imposto de forma legal é parte da estratégia — entenda como cada tipo de investimento é tributado.",
        readTime: "9 min",
        tags: ["impostos", "imposto de renda", "come-cotas", "avançado"],
        level: "avancado",
        content: `## Por que isso importa

Dois investimentos com o mesmo retorno bruto podem ter retornos líquidos bem diferentes dependendo da tributação. Entender isso evita escolher um produto pior só porque parece mais simples.

## Renda fixa: tabela regressiva

Vale para Tesouro Direto, CDB, debêntures comuns:
- Até 180 dias: 22,5%
- 181 a 360 dias: 20%
- 361 a 720 dias: 17,5%
- Acima de 720 dias: 15%

Quanto mais tempo o dinheiro fica investido, menor a alíquota — mais um motivo para pensar em longo prazo.

## Isenções: LCI, LCA, CRI, CRA e debêntures incentivadas

Esses produtos são **isentos de Imposto de Renda para pessoa física**. Por isso costumam pagar uma taxa nominal menor que um CDB comum e ainda assim entregar um retorno líquido competitivo — compare sempre pelo líquido, nunca só pela taxa anunciada.

## Fundos e o come-cotas

Fundos de investimento (exceto ações) sofrem o **come-cotas**: antecipação semestral do IR (maio e novembro), calculada sobre o rendimento, na alíquota mínima da tabela regressiva (15% ou 20% conforme o tipo de fundo). Isso reduz o efeito dos juros compostos comparado a um investimento que só paga IR no resgate.

## Ações e FIIs

- **Ações:** isenção de IR sobre lucro em vendas até R$ 20.000/mês (fora day trade); acima disso, 15% sobre o ganho de capital.
- **FIIs:** rendimentos mensais são isentos de IR para pessoa física (respeitadas as regras: FII com cotas negociadas em bolsa, pulverização mínima de cotistas). Ganho de capital na venda das cotas é tributado em 20%.

## Declarando corretamente

Guarde notas de corretagem e informes de rendimento. Erros de declaração não mudam o imposto devido, mas podem gerar multa e malha fina — outro motivo para manter o controle das suas movimentações organizado ao longo do ano, e não só em março.`,
    },
];

// ── Component ────────────────────────────────────────────────────────────────

export function FinanceEducationPage() {
    const { theme } = useTheme();
    const f = getFoundationByTheme(theme);
    const isDark = theme === "dark";
    const border = f.colors.border.default;
    const muted = f.colors.text.muted;
    const primary = f.colors.brand.primary;

    const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
    const [activeLevel, setActiveLevel] = useState<Level | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [search, setSearch] = useState("");
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setReadIds(loadReadIds()); }, []);

    const openArticle = (article: Article) => {
        setSelectedArticle(article);
        setReadIds((prev) => {
            if (prev.has(article.id)) return prev;
            const next = new Set(prev).add(article.id);
            saveReadIds(next);
            return next;
        });
    };

    const selectLevel = (level: Level) => {
        setActiveLevel((prev) => (prev === level ? null : level));
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const levelStats = useMemo(() => {
        return LEVELS.map((lvl) => {
            const articlesInLevel = ARTICLES.filter((a) => a.level === lvl.id);
            const done = articlesInLevel.filter((a) => readIds.has(a.id)).length;
            return { ...lvl, total: articlesInLevel.length, done };
        });
    }, [readIds]);

    const visible = useMemo(() => {
        return ARTICLES.filter((a) => {
            if (activeCategory !== "all" && a.category !== activeCategory) return false;
            if (activeLevel && a.level !== activeLevel) return false;
            if (search) {
                const q = search.toLowerCase();
                return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q));
            }
            return true;
        });
    }, [activeCategory, activeLevel, search]);

    const booksByKind = useMemo(() => ({
        pessoais: BOOKS.filter((b) => b.kind === "pessoais"),
        investimentos: BOOKS.filter((b) => b.kind === "investimentos"),
    }), []);

    const cardStyle: React.CSSProperties = {
        backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
        borderRadius: "1.2rem",
        border: `1px solid ${border}`,
    };

    const renderMarkdown = (content: string) => {
        const lines = content.split("\n");
        const elements: React.ReactNode[] = [];
        let key = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith("## ")) {
                elements.push(<h2 key={key++} style={{ fontSize: "1.7rem", fontWeight: 700, color: f.colors.text.primary, marginTop: "2rem", marginBottom: "0.8rem" }}>{line.slice(3)}</h2>);
            } else if (line.startsWith("**") && line.endsWith("**")) {
                elements.push(<p key={key++} style={{ fontSize: "1.35rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>{line.slice(2, -2)}</p>);
            } else if (line.startsWith("- ") || line.startsWith("✅ ") || line.startsWith("❌ ")) {
                elements.push(<li key={key++} style={{ fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.7, marginLeft: "1.6rem" }}>{line.slice(line.startsWith("- ") ? 2 : 0)}</li>);
            } else if (line.startsWith("|") && line.includes("|")) {
                if (!line.includes("---")) {
                    const cells = line.split("|").filter(Boolean).map((c) => c.trim());
                    const isHeader = lines[i + 1]?.includes("---");
                    elements.push(
                        <tr key={key++} style={{ borderBottom: `1px solid ${border}` }}>
                            {cells.map((cell, ci) => isHeader
                                ? <th key={ci} style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600, color: muted, fontSize: "1.2rem" }}>{cell}</th>
                                : <td key={ci} style={{ padding: "0.6rem 1rem", fontSize: "1.3rem", color: f.colors.text.secondary }}>{cell}</td>
                            )}
                        </tr>
                    );
                    if (isHeader) {
                        const tableRows: React.ReactNode[] = [elements.pop()!];
                        i += 1;
                        while (lines[i + 1]?.startsWith("|")) {
                            i++;
                            const rowCells = lines[i].split("|").filter(Boolean).map((c) => c.trim());
                            tableRows.push(
                                <tr key={key++} style={{ borderBottom: `1px solid ${border}` }}>
                                    {rowCells.map((cell, ci) => <td key={ci} style={{ padding: "0.6rem 1rem", fontSize: "1.3rem", color: f.colors.text.secondary }}>{cell}</td>)}
                                </tr>
                            );
                        }
                        elements.push(<div key={key++} style={{ overflowX: "auto", margin: "1rem 0" }}><table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>{tableRows}</tbody></table></div>);
                    }
                }
            } else if (line.trim() === "") {
                elements.push(<br key={key++} />);
            } else {
                const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, "<code style='background:#F1F5F9;padding:0.1rem 0.4rem;border-radius:0.3rem;font-family:monospace;font-size:1.2rem'>$1</code>");
                elements.push(<p key={key++} style={{ fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.75, marginBottom: "0.4rem" }} dangerouslySetInnerHTML={{ __html: formatted }} />);
            }
        }
        return elements;
    };

    return (
        <div className="page-responsive" style={{ fontFamily: f.typography.fontFamily.base, maxWidth: "130rem" }}>

            {/* Header */}
            <div style={{ marginBottom: "2.4rem" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: muted, marginBottom: "0.4rem" }}>
                    Documentação
                </p>
                <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                    Educação Financeira
                </h1>
                <p style={{ fontSize: "1.4rem", color: muted }}>
                    Aprenda os fundamentos das finanças pessoais e tome decisões mais inteligentes com o seu dinheiro.
                </p>
            </div>

            {/* Highlight banner */}
            <div style={{
                ...cardStyle,
                padding: "2rem 2.4rem",
                background: isDark
                    ? "linear-gradient(135deg, #0A1628 0%, #0D2E1D 100%)"
                    : "linear-gradient(135deg, #EFF6FF 0%, #E6F4ED 100%)",
                marginBottom: "2.4rem",
                display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap",
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: "1.7rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.6rem" }}>
                        🎓 Sua jornada financeira começa aqui
                    </h2>
                    <p style={{ fontSize: "1.35rem", color: f.colors.text.secondary, lineHeight: 1.6 }}>
                        {ARTICLES.length} artigos organizados por tema e nível de complexidade.
                        Comece pelos fundamentos e avance no seu próprio ritmo.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "1.6rem", flexWrap: "wrap" }}>
                    {[
                        { label: "Artigos", value: ARTICLES.length },
                        { label: "Categorias", value: CATEGORIES.length - 1 },
                        { label: "Leitura total", value: "~1h" },
                    ].map((stat) => (
                        <div key={stat.label} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", fontWeight: 700, color: primary }}>{stat.value}</div>
                            <div style={{ fontSize: "1.2rem", color: muted }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trilha de aprendizado — do básico ao avançado */}
            <div style={{ marginBottom: "2.4rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.6rem" }}>
                    <h2 style={{ fontSize: "1.7rem", fontWeight: 700, color: f.colors.text.primary }}>Trilha de aprendizado</h2>
                    {activeLevel && (
                        <button
                            onClick={() => setActiveLevel(null)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: primary, fontSize: "1.2rem", fontWeight: 600, fontFamily: "inherit" }}
                        >
                            Limpar filtro de fase ✕
                        </button>
                    )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(24rem, 1fr))", gap: "1.4rem" }}>
                    {levelStats.map((lvl) => {
                        const cfg = LEVEL_CONFIG[lvl.id];
                        const isActive = activeLevel === lvl.id;
                        const pct = lvl.total > 0 ? Math.round((lvl.done / lvl.total) * 100) : 0;
                        return (
                            <button
                                key={lvl.id}
                                onClick={() => selectLevel(lvl.id)}
                                style={{
                                    ...cardStyle, textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                                    padding: "1.6rem 1.8rem",
                                    borderColor: isActive ? cfg.color : border,
                                    boxShadow: isActive ? `0 0 0 2px ${cfg.color}40` : "none",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.6rem" }}>
                                    <span style={{ fontSize: "1.8rem" }}>{lvl.emoji}</span>
                                    <span style={{ fontSize: "1.4rem", fontWeight: 700, color: cfg.color }}>{lvl.label}</span>
                                    <span style={{ marginLeft: "auto", fontSize: "1.15rem", color: muted }}>{lvl.done}/{lvl.total}</span>
                                </div>
                                <p style={{ fontSize: "1.25rem", color: f.colors.text.secondary, lineHeight: 1.5, marginBottom: "1rem" }}>
                                    {lvl.description}
                                </p>
                                <div style={{ height: "0.6rem", borderRadius: "999px", backgroundColor: isDark ? f.colors.bg.surface : f.colors.bg.app, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: "999px", backgroundColor: cfg.color, transition: "width 0.3s ease" }} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filters */}
            <div ref={gridRef} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "2rem" }}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: "0.7rem 1.4rem", borderRadius: "999px",
                            border: `1px solid ${activeCategory === cat.id ? primary : border}`,
                            backgroundColor: activeCategory === cat.id ? primary : "transparent",
                            color: activeCategory === cat.id ? "#fff" : f.colors.text.secondary,
                            fontSize: "1.3rem", fontWeight: activeCategory === cat.id ? 600 : 400,
                            cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            transition: "all 0.15s ease",
                        }}
                    >
                        <span>{cat.emoji}</span> {cat.label}
                    </button>
                ))}
                <input
                    placeholder="Buscar artigos…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        marginLeft: "auto", height: "3.6rem", minWidth: "20rem",
                        borderRadius: "0.9rem", border: `1px solid ${border}`,
                        padding: "0 1.2rem", backgroundColor: isDark ? f.colors.bg.surface : "#FAFAFA",
                        color: f.colors.text.primary, fontSize: "1.3rem", fontFamily: "inherit",
                    }}
                />
            </div>

            {/* Articles grid */}
            {visible.length === 0 ? (
                <div style={{ textAlign: "center", color: muted, fontSize: "1.4rem", padding: "4rem 0" }}>
                    Nenhum artigo encontrado para "{search}".
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(32rem, 1fr))", gap: "1.6rem" }}>
                    {visible.map((article) => {
                        const lvl = LEVEL_CONFIG[article.level];
                        const isRead = readIds.has(article.id);
                        return (
                            <button
                                key={article.id}
                                onClick={() => openArticle(article)}
                                style={{
                                    position: "relative",
                                    textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                                    ...cardStyle, padding: "2rem",
                                    transition: "box-shadow 0.15s ease, transform 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
                                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                }}
                            >
                                {isRead && (
                                    <span style={{
                                        position: "absolute", top: "1.4rem", right: "1.4rem",
                                        fontSize: "1.1rem", fontWeight: 600, color: f.colors.feedback.success,
                                        display: "flex", alignItems: "center", gap: "0.3rem",
                                    }}>
                                        ✓ Lido
                                    </span>
                                )}
                                <div style={{ fontSize: "2.8rem", marginBottom: "1.2rem" }}>{article.icon}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1rem" }}>
                                    <span style={{
                                        fontSize: "1.1rem", fontWeight: 600,
                                        padding: "0.2rem 0.7rem", borderRadius: "999px",
                                        color: lvl.color, backgroundColor: isDark ? `${lvl.color}22` : lvl.bg,
                                    }}>{lvl.label}</span>
                                    <span style={{ fontSize: "1.15rem", color: muted }}>{article.readTime} de leitura</span>
                                </div>
                                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.8rem", lineHeight: 1.4 }}>
                                    {article.title}
                                </h3>
                                <p style={{ fontSize: "1.3rem", color: f.colors.text.secondary, lineHeight: 1.6, marginBottom: "1.4rem" }}>
                                    {article.summary}
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                    {article.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} style={{
                                            fontSize: "1.1rem", padding: "0.2rem 0.7rem",
                                            borderRadius: "999px", border: `1px solid ${border}`,
                                            color: muted,
                                        }}>{tag}</span>
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Recomendações de leitura */}
            <div style={{ marginTop: "3.2rem" }}>
                <h2 style={{ fontSize: "1.7rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "0.4rem" }}>
                    📚 Recomendações de leitura
                </h2>
                <p style={{ fontSize: "1.3rem", color: muted, marginBottom: "1.6rem" }}>
                    Livros clássicos para aprofundar o que você estuda por aqui — separados por assunto e nível.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(38rem, 1fr))", gap: "2rem" }}>
                    {([
                        { key: "pessoais" as const, label: "Finanças pessoais", emoji: "💰" },
                        { key: "investimentos" as const, label: "Investimentos", emoji: "📈" },
                    ]).map((section) => (
                        <div key={section.key}>
                            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: f.colors.text.primary, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <span>{section.emoji}</span> {section.label}
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {booksByKind[section.key].map((book) => {
                                    const cfg = LEVEL_CONFIG[book.level];
                                    return (
                                        <div key={book.id} style={{ ...cardStyle, padding: "1.4rem 1.6rem" }}>
                                            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.8rem", marginBottom: "0.3rem" }}>
                                                <h4 style={{ fontSize: "1.3rem", fontWeight: 700, color: f.colors.text.primary }}>{book.title}</h4>
                                                <span style={{
                                                    flexShrink: 0, fontSize: "1.05rem", fontWeight: 600,
                                                    padding: "0.15rem 0.6rem", borderRadius: "999px",
                                                    color: cfg.color, backgroundColor: isDark ? `${cfg.color}22` : cfg.bg,
                                                }}>{cfg.label}</span>
                                            </div>
                                            <p style={{ fontSize: "1.2rem", color: muted, marginBottom: "0.4rem" }}>{book.author}</p>
                                            <p style={{ fontSize: "1.25rem", color: f.colors.text.secondary, lineHeight: 1.5 }}>{book.blurb}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Article modal */}
            {selectedArticle && (
                <div
                    onClick={() => setSelectedArticle(null)}
                    style={{
                        position: "fixed", inset: 0, zIndex: 1000,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "2rem",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                            borderRadius: "1.6rem",
                            border: `1px solid ${border}`,
                            width: "100%", maxWidth: "72rem",
                            maxHeight: "90vh", overflowY: "auto",
                        }}
                    >
                        {/* Modal header */}
                        <div style={{
                            padding: "2rem 2.4rem",
                            borderBottom: `1px solid ${border}`,
                            position: "sticky", top: 0,
                            backgroundColor: isDark ? f.colors.bg.elevated : "#FFFFFF",
                            zIndex: 1,
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.8rem" }}>
                                        <span style={{ fontSize: "2rem" }}>{selectedArticle.icon}</span>
                                        <span style={{
                                            fontSize: "1.15rem", fontWeight: 600,
                                            padding: "0.2rem 0.8rem", borderRadius: "999px",
                                            color: LEVEL_CONFIG[selectedArticle.level].color,
                                            backgroundColor: isDark ? `${LEVEL_CONFIG[selectedArticle.level].color}22` : LEVEL_CONFIG[selectedArticle.level].bg,
                                        }}>{LEVEL_CONFIG[selectedArticle.level].label}</span>
                                        <span style={{ fontSize: "1.2rem", color: muted }}>{selectedArticle.readTime} de leitura</span>
                                    </div>
                                    <h2 style={{ fontSize: "1.9rem", fontWeight: 700, color: f.colors.text.primary }}>{selectedArticle.title}</h2>
                                </div>
                                <button onClick={() => setSelectedArticle(null)} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: "0.4rem", flexShrink: 0, marginLeft: "1rem" }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal content */}
                        <div style={{ padding: "2.4rem" }}>
                            {renderMarkdown(selectedArticle.content)}
                            <div style={{ marginTop: "2.4rem", paddingTop: "1.6rem", borderTop: `1px solid ${border}`, display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                <span style={{ fontSize: "1.2rem", color: muted }}>Tags:</span>
                                {selectedArticle.tags.map((tag) => (
                                    <span key={tag} style={{
                                        fontSize: "1.15rem", padding: "0.2rem 0.8rem",
                                        borderRadius: "999px", border: `1px solid ${border}`, color: muted,
                                    }}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
