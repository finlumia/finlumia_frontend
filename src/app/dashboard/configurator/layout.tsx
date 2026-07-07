"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/auth.context";

// O Configurador expõe estrutura de banco, usuários e permissões — mesmo com
// o link oculto no menu para não-admin (Sidebar.tsx), a rota precisa do
// próprio guard aqui, senão basta digitar a URL para contornar o menu.
export default function ConfiguratorLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        if (!isLoading && user && !isAdmin) {
            router.replace("/dashboard");
        }
    }, [isLoading, user, isAdmin, router]);

    if (isLoading || !user || !isAdmin) return null;

    return <>{children}</>;
}
