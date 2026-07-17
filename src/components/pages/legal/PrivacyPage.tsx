"use client";

import React from "react";
import { LegalLayout, LegalSection } from "./LegalLayout";

const listStyle: React.CSSProperties = { margin: "0.8rem 0 0", paddingLeft: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem" };
const pStyle: React.CSSProperties = { margin: 0 };

export function PrivacyPage() {
    return (
        <LegalLayout title="Política de Privacidade" lastUpdated="17 de julho de 2026">
            <LegalSection title="1. Introdução">
                <p style={pStyle}>
                    Esta política explica quais dados a Finlumia coleta, como são usados e quais
                    direitos você tem sobre eles. A Finlumia é um projeto acadêmico (disciplina de
                    Interação Humano-Computador) e trata os dados apenas para o funcionamento da
                    ferramenta durante o projeto — nunca para fins comerciais.
                </p>
            </LegalSection>

            <LegalSection title="2. Quais dados coletamos">
                <ul style={listStyle}>
                    <li>Dados de cadastro: nome, e-mail e senha (armazenada com hash, nunca em texto simples);</li>
                    <li>Dados de login com Google (opcional): nome, e-mail e foto de perfil, conforme autorizado por você na tela de consentimento do Google;</li>
                    <li>Dados financeiros que você mesmo cadastra: transações, categorias, orçamentos e metas — inseridos manualmente ou por importação de extrato;</li>
                    <li>Dados técnicos de uso: cookies de sessão e registros de acesso, usados apenas para manter você autenticado e para segurança.</li>
                </ul>
            </LegalSection>

            <LegalSection title="3. O que não coletamos">
                <p style={pStyle}>
                    A Finlumia não se conecta ao seu banco, não acessa suas contas financeiras reais e
                    não realiza nenhuma movimentação de dinheiro. Todos os dados financeiros exibidos
                    na plataforma são os que você mesmo insere.
                </p>
            </LegalSection>

            <LegalSection title="4. Como usamos seus dados">
                <p style={pStyle}>Usamos os dados coletados exclusivamente para:</p>
                <ul style={listStyle}>
                    <li>Autenticar seu acesso e manter sua sessão ativa;</li>
                    <li>Exibir suas informações financeiras organizadas em painéis e relatórios;</li>
                    <li>Responder solicitações de suporte que você abrir na plataforma;</li>
                    <li>Fins acadêmicos de avaliação e demonstração do projeto.</li>
                </ul>
            </LegalSection>

            <LegalSection title="5. Compartilhamento com terceiros">
                <p style={pStyle}>
                    Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins
                    de publicidade. Seus dados só trafegam entre o seu navegador e os serviços internos
                    da própria plataforma.
                </p>
            </LegalSection>

            <LegalSection title="6. Armazenamento e segurança">
                <ul style={listStyle}>
                    <li>Senhas são armazenadas com hash criptográfico, nunca em texto simples;</li>
                    <li>A sessão é mantida por cookies HttpOnly, inacessíveis a scripts no navegador;</li>
                    <li>Toda comunicação entre o navegador e a plataforma é feita por HTTPS.</li>
                </ul>
            </LegalSection>

            <LegalSection title="7. Cookies">
                <p style={pStyle}>
                    Usamos apenas cookies essenciais de sessão, necessários para manter você
                    autenticado. Não utilizamos cookies de rastreamento, publicidade ou analytics de
                    terceiros.
                </p>
            </LegalSection>

            <LegalSection title="8. Retenção e exclusão">
                <p style={pStyle}>
                    Seus dados são mantidos enquanto sua conta estiver ativa e durante a vigência do
                    projeto acadêmico. Você pode solicitar a exclusão da sua conta e de todos os dados
                    associados a qualquer momento pelo canal de suporte da plataforma.
                </p>
            </LegalSection>

            <LegalSection title="9. Seus direitos">
                <p style={pStyle}>Alinhados aos princípios da LGPD, você tem direito a:</p>
                <ul style={listStyle}>
                    <li>Acessar os dados que temos sobre você;</li>
                    <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                    <li>Solicitar a exclusão dos seus dados;</li>
                    <li>Revogar o consentimento de login via Google a qualquer momento.</li>
                </ul>
            </LegalSection>

            <LegalSection title="10. Menores de idade">
                <p style={pStyle}>
                    A Finlumia não é direcionada a menores de 18 anos e não coleta intencionalmente
                    dados de menores.
                </p>
            </LegalSection>

            <LegalSection title="11. Alterações desta política">
                <p style={pStyle}>
                    Esta política pode ser atualizada conforme o projeto evolui. A data no topo desta
                    página sempre indica a versão mais recente.
                </p>
            </LegalSection>

            <LegalSection title="12. Contato">
                <p style={pStyle}>
                    Dúvidas sobre esta política ou solicitações relacionadas aos seus dados podem ser
                    enviadas através do canal de suporte disponível dentro da plataforma.
                </p>
            </LegalSection>
        </LegalLayout>
    );
}
