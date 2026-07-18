import { http } from "@/lib/http-client";
import { API_ENDPOINTS, buildUrl } from "@/api/Endpoints";
import type { BudgetCreateRequest, BudgetStatus } from "@/api/types";

export const budgetsService = {
  // period opcional, formato "YYYY-MM" — se omitido, backend usa o mês atual.
  list: (period?: string) =>
    http.get<BudgetStatus[]>(
      `${API_ENDPOINTS.budgets.list.url}${period ? `?period=${encodeURIComponent(period)}` : ""}`,
    ),

  // Cria ou atualiza o orçamento daquela categoria/tipo/mês.
  create: (data: BudgetCreateRequest) =>
    http.post<BudgetStatus>(API_ENDPOINTS.budgets.create.url, data),

  delete: (id: string) =>
    http.delete<void>(buildUrl(API_ENDPOINTS.budgets.delete, { id })),
};
