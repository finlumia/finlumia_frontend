import { Suspense } from "react";
import { MovimentationPage } from "../../../../components/pages/MovimentationPage";

export const metadata = {
    title: "Transações | Finlumia",
    description: "Gerencie suas receitas e despesas em um só lugar.",
};

export default function Page() {
    return (
        <Suspense fallback={null}>
            <MovimentationPage />
        </Suspense>
    );
}
