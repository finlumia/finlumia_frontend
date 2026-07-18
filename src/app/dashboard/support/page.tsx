import { redirect } from "next/navigation";

// Página "hub" sem conteúdo próprio — o menu (Sidebar e MorePage) sempre
// expande os filhos (Abrir Ticket / Portal de Suporte) em vez de navegar
// para cá, mas mantemos o redirect para o caso de alguém abrir a URL direto.
export default function Page() {
    redirect("/dashboard/support/ticket");
}
