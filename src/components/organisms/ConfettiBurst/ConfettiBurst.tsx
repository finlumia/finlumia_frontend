"use client";

import React, { useEffect, useRef, useState } from "react";

type Shape = "rect" | "circle" | "ribbon";

type Piece = {
    id: number;
    color: string;
    shape: Shape;
    size: number;
    dx: number;
    dy: number;
    rotation: number;
    delay: number;
    duration: number;
};

const SHAPES: Shape[] = ["rect", "circle", "ribbon"];

function makePieces(count: number, colors: string[]): Piece[] {
    return Array.from({ length: count }, (_, i) => {
        // Leque saindo do canto onde o toast aparece: predominantemente para a
        // esquerda (entra na tela) e para baixo (cai), nunca para cima/direita
        // (iria para fora da viewport).
        const spreadLeft = 0.35 + Math.random() * 0.65;
        const fall = 0.35 + Math.random() * 0.85;
        const distance = 220 + Math.random() * 480;
        return {
            id: i,
            color: colors[i % colors.length],
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            size: 6 + Math.random() * 7,
            dx: -spreadLeft * distance,
            dy: fall * distance + 120, // + gravidade extra no final da queda
            rotation: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
            delay: Math.random() * 120,
            duration: 900 + Math.random() * 700,
        };
    });
}

type ConfettiBurstProps = {
    /** Incremente para disparar uma nova explosão de confete. 0 = nenhuma ainda. */
    trigger: number;
    /** Cores usadas nos pedaços — devem vir da paleta da plataforma (nunca cores arbitrárias). */
    colors: string[];
    originX?: string;
    originY?: string;
    pieceCount?: number;
};

/** Explosão de confete on-brand, disparada ao lançar uma receita ou
 * investimento — puro CSS (sem dependências externas), consistente com o
 * resto do design system que não usa libs de animação/gráficos. */
export function ConfettiBurst({
    trigger,
    colors,
    originX = "calc(100% - 5.5rem)",
    originY = "3.5rem",
    pieceCount = 64,
}: ConfettiBurstProps) {
    const [pieces, setPieces] = useState<Piece[]>([]);
    const lastTrigger = useRef(0);

    useEffect(() => {
        if (trigger === 0 || trigger === lastTrigger.current) return;
        lastTrigger.current = trigger;
        const next = makePieces(pieceCount, colors);
        setPieces(next);
        const life = Math.max(...next.map((p) => p.delay + p.duration)) + 100;
        const t = window.setTimeout(() => setPieces([]), life);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);

    if (pieces.length === 0) return null;

    return (
        <div
            aria-hidden
            style={{
                position: "fixed", top: originY, left: originX,
                width: 0, height: 0, zIndex: 9998, pointerEvents: "none",
            }}
        >
            {pieces.map((p) => (
                <span
                    key={p.id}
                    style={{
                        position: "absolute", top: 0, left: 0,
                        width: `${p.size}px`,
                        height: `${p.shape === "ribbon" ? p.size * 2.8 : p.size}px`,
                        backgroundColor: p.color,
                        borderRadius: p.shape === "circle" ? "50%" : "2px",
                        opacity: 0,
                        "--fc-dx": `${p.dx}px`,
                        "--fc-dy": `${p.dy}px`,
                        "--fc-rot": `${p.rotation}deg`,
                        animation: `finlumia-confetti-piece ${p.duration}ms cubic-bezier(.16,.84,.32,1) ${p.delay}ms forwards`,
                    } as React.CSSProperties}
                />
            ))}
            <style>{`
                @keyframes finlumia-confetti-piece {
                    0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
                    65%  { opacity: 1; }
                    100% { transform: translate(var(--fc-dx), var(--fc-dy)) rotate(var(--fc-rot)); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
