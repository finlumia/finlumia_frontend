"use client";

import Script from "next/script";
import React, { useCallback, useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type GoogleSignInButtonProps = {
  /** Botão visível (o markup customizado já existente) — o botão real do Google fica sobreposto e invisível por cima. */
  children: React.ReactNode;
  onCredential: (idToken: string) => void;
  /** Chamado quando o botão do Google não pôde ser inicializado (config ausente, script falhou, etc.) —
   * sem isso, um ambiente mal configurado vira um botão que clica e não faz nada, sem nenhum aviso. */
  onError?: (message: string) => void;
  disabled?: boolean;
};

/**
 * Sobrepõe o botão nativo do Google Identity Services (invisível) exatamente
 * por cima do botão customizado, para preservar o visual da tela sem depender
 * de disparo sintético de clique (frágil entre navegadores).
 */
export function GoogleSignInButton({ children, onCredential, onError, disabled }: GoogleSignInButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [width, setWidth] = useState(360);
  const reportedErrorRef = useRef(false);
  const initializedRef = useRef(false);

  const handleCredential = useCallback(
    (response: GoogleCredentialResponse) => onCredential(response.credential),
    [onCredential],
  );

  const reportError = useCallback((message: string) => {
    if (reportedErrorRef.current) return;
    reportedErrorRef.current = true;
    console.error(`[GoogleSignInButton] ${message}`);
    onError?.(message);
  }, [onError]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width;
      if (measured) setWidth(Math.round(measured));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Inicializa o GIS uma única vez — chamar initialize() de novo a cada
  // render (ex.: toda vez que o ResizeObserver mede a largura) faz o próprio
  // Google logar um aviso de "initialize() is called multiple times".
  useEffect(() => {
    if (initializedRef.current) return;
    if (scriptFailed) {
      reportError("Não foi possível carregar o script do Google. Verifique sua conexão ou tente novamente.");
      return;
    }
    if (!scriptLoaded || !window.google) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      reportError("Login com Google não está configurado neste ambiente (NEXT_PUBLIC_GOOGLE_CLIENT_ID ausente).");
      return;
    }

    try {
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredential });
      initializedRef.current = true;
      setInitialized(true);
    } catch {
      reportError("Não foi possível inicializar o login com Google.");
    }
  }, [scriptLoaded, scriptFailed, handleCredential, reportError]);

  // Renderiza (ou re-renderiza) o botão sempre que a largura do wrapper mudar,
  // sem precisar re-inicializar o GIS.
  useEffect(() => {
    if (!initialized || !window.google || !overlayRef.current) return;
    try {
      overlayRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(overlayRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        // A API do GIS exige uma largura fixa em pixels.
        width: Math.min(Math.max(width, 200), 400),
      });
    } catch {
      reportError("Não foi possível exibir o botão do Google.");
    }
  }, [initialized, width, reportError]);

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden={disabled}
        style={{
          position:      "absolute",
          inset:         0,
          opacity:       0,
          overflow:      "hidden",
          pointerEvents: disabled ? "none" : "auto",
        }}
      />
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        // onReady (não onLoad): onLoad só dispara uma vez por sessão, na
        // primeira página que carrega o script. Se o usuário chegar aqui via
        // navegação client-side depois de já ter visitado outra tela com
        // este mesmo botão (ex.: Login → Cadastro), o script já está
        // carregado e onLoad nunca dispara de novo — onReady dispara em
        // toda montagem do componente, mesmo com o script já em cache.
        onReady={() => setScriptLoaded(true)}
        onError={() => setScriptFailed(true)}
      />
    </div>
  );
}
