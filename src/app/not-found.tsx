import Link from "next/link";

export default function NotFound() {
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
      <p style={{ fontSize: "5rem", fontWeight: 700, color: "#334155", margin: "0 0 1rem" }}>
        404
      </p>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.8rem" }}>
        Página não encontrada
      </h1>
      <p style={{ fontSize: "1.4rem", color: "#94a3b8", marginBottom: "2rem" }}>
        O endereço acessado não existe ou foi removido.
      </p>
      <Link
        href="/"
        style={{
          padding: "0.8rem 1.6rem",
          borderRadius: "0.6rem",
          border: "none",
          backgroundColor: "#6366f1",
          color: "#fff",
          fontSize: "1.4rem",
          textDecoration: "none",
        }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}
