import { BudgetPage } from "../../../../components/pages/movimentation/BudgetPage";

export const metadata = {
    title: "Orçamento | Finlumia",
    description: "Cadastre orçamentos mensais por setor, forma de pagamento ou banco e seja avisado ao ultrapassá-los.",
};

export default function Page() {
    return <BudgetPage />;
}
