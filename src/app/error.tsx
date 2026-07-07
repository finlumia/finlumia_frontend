"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registra em serviço de observabilidade (sem vazar ao browser)
    console.error("[global-error]", error.digest ?? "no-digest");
  }, [error]);

  return (
    <div
      style={{
        margin: 0,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#0f1117",
        color: "#e2e8f0",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.8rem" }}>
        Algo deu errado
      </h1>
      <p style={{ fontSize: "1.4rem", color: "#94a3b8", marginBottom: "2rem" }}>
        Ocorreu um erro inesperado. Tente novamente ou retorne à página inicial.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.8rem 1.6rem",
            borderRadius: "0.6rem",
            border: "none",
            backgroundColor: "#6366f1",
            color: "#fff",
            fontSize: "1.4rem",
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
        <a
          href="/"
          style={{
            padding: "0.8rem 1.6rem",
            borderRadius: "0.6rem",
            border: "1px solid #334155",
            backgroundColor: "transparent",
            color: "#e2e8f0",
            fontSize: "1.4rem",
            textDecoration: "none",
          }}
        >
          Página inicial
        </a>
      </div>
    </div>
  );
}
