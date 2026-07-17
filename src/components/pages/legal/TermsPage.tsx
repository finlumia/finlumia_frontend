"use client";

import React from "react";
import { LegalLayout, LegalSection } from "./LegalLayout";

const listStyle: React.CSSProperties = { margin: "0.8rem 0 0", paddingLeft: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem" };
const pStyle: React.CSSProperties = { margin: 0 };

export function TermsPage() {
    return (
        <LegalLayout title="Termos de Uso" lastUpdated="17 de julho de 2026">
            <LegalSection title="1. Sobre a Finlumia">
                <p style={pStyle}>
                    A Finlumia é um projeto acadêmico desenvolvido para a disciplina de Interação
                    Humano-Computador (IHM), com o objetivo de demonstrar, na prática, conceitos de
                    clareza, simplicidade e visualização de dados aplicados a um produto de finanças
                    pessoais. Não é um produto comercial, não possui fins lucrativos e não substitui
                    serviços financeiros, bancários ou de investimento reais.
                </p>
            </LegalSection>

            <LegalSection title="2. Aceitação dos termos">
                <p style={pStyle}>
                    Ao criar uma conta ou utilizar a plataforma, você concorda com estes Termos de Uso
                    e com a nossa <a href="/privacy" style={{ color: "inherit", fontWeight: 600 }}>Política de Privacidade</a>. Se você não concorda com algum ponto,
                    pedimos que não utilize a ferramenta.
                </p>
            </LegalSection>

            <LegalSection title="3. Conta de usuário">
                <p style={pStyle}>Ao se cadastrar, você é responsável por:</p>
                <ul style={listStyle}>
                    <li>Manter sua senha em sigilo e não compartilhá-la com terceiros;</li>
                    <li>Fornecer um e-mail válido, usado apenas para autenticação e comunicação sobre a conta;</li>
                    <li>Informar imediatamente qualquer uso não autorizado da sua conta.</li>
                </ul>
            </LegalSection>

            <LegalSection title="4. Uso aceitável">
                <p style={pStyle}>
                    A Finlumia deve ser usada apenas para fins de estudo, demonstração e avaliação
                    acadêmica. Não recomendamos o cadastro de dados financeiros sensíveis reais de
                    terceiros. É vedado tentar comprometer a segurança da plataforma, sobrecarregar
                    seus serviços deliberadamente ou utilizá-la para qualquer finalidade ilícita.
                </p>
            </LegalSection>

            <LegalSection title="5. Disponibilidade do serviço">
                <p style={pStyle}>
                    Por se tratar de um projeto acadêmico, a Finlumia é oferecida sem garantia de
                    disponibilidade contínua. O serviço pode ser interrompido, alterado ou encerrado a
                    qualquer momento, inclusive ao final do período letivo em que o projeto foi
                    desenvolvido, sem aviso prévio.
                </p>
            </LegalSection>

            <LegalSection title="6. Isenção de responsabilidade">
                <p style={pStyle}>
                    A plataforma é fornecida &ldquo;como está&rdquo;, sem garantias de qualquer tipo. As
                    informações exibidas (gráficos, categorizações, indicadores) têm finalidade
                    ilustrativa e não constituem aconselhamento financeiro, contábil ou de investimento.
                </p>
            </LegalSection>

            <LegalSection title="7. Encerramento de conta">
                <p style={pStyle}>
                    Você pode solicitar o encerramento da sua conta e a exclusão dos seus dados a
                    qualquer momento. Também podemos encerrar contas inativas ou que violem estes
                    termos.
                </p>
            </LegalSection>

            <LegalSection title="8. Alterações destes termos">
                <p style={pStyle}>
                    Estes termos podem ser atualizados conforme o projeto evolui. Alterações
                    relevantes serão refletidas na data de &ldquo;última atualização&rdquo; no topo desta
                    página.
                </p>
            </LegalSection>

            <LegalSection title="9. Contato">
                <p style={pStyle}>
                    Dúvidas sobre estes termos podem ser enviadas através do canal de suporte
                    disponível dentro da plataforma.
                </p>
            </LegalSection>
        </LegalLayout>
    );
}
