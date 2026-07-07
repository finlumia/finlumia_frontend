import { http } from "@/lib/http-client";
import { API_ENDPOINTS, buildUrl } from "@/api/Endpoints";
import type {
    KpiSummary,
    CashFlowResponse,
    CategoryBreakdownResponse,
    InstitutionBreakdownResponse,
    NetWorthResponse,
    MonthlyComparisonResponse,
    InsightsResponse,
    PeriodQuery,
    ExportFormat,
} from "@/api/types";

type QueryParams = Record<string, string | number | boolean | undefined>;

function toQuery(params: QueryParams): string {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
    }
    const s = p.toString();
    return s ? `?${s}` : "";
}

export type CategoryQuery = PeriodQuery & { type?: "receita" | "despesa" };

// Todos os endpoints abaixo (exceto getKPIs) respondem envelopados em
// { data: [...], ...metadados } — nunca um array puro. Ver api/types.ts.
export const reportsService = {
    getKPIs: (query: PeriodQuery = {}) =>
        http.get<KpiSummary>(`${API_ENDPOINTS.reports.getKPIs.url}${toQuery(query as QueryParams)}`),

    getCashFlow: (query: PeriodQuery = {}) =>
        http.get<CashFlowResponse>(`${API_ENDPOINTS.reports.getCashFlow.url}${toQuery(query as QueryParams)}`),

    getByCategory: (query: CategoryQuery = {}) =>
        http.get<CategoryBreakdownResponse>(`${API_ENDPOINTS.reports.getByCategory.url}${toQuery(query as QueryParams)}`),

    getByInstitution: (query: PeriodQuery = {}) =>
        http.get<InstitutionBreakdownResponse>(`${API_ENDPOINTS.reports.getByInstitution.url}${toQuery(query as QueryParams)}`),

    getNetWorth: (query: PeriodQuery = {}) =>
        http.get<NetWorthResponse>(`${API_ENDPOINTS.reports.getNetWorth.url}${toQuery(query as QueryParams)}`),

    getMonthlyComparison: (query: PeriodQuery = {}) =>
        http.get<MonthlyComparisonResponse>(`${API_ENDPOINTS.reports.getMonthlyComparison.url}${toQuery(query as QueryParams)}`),

    getInsights: (query: PeriodQuery = {}) =>
        http.get<InsightsResponse>(`${API_ENDPOINTS.reports.getInsights.url}${toQuery(query as QueryParams)}`),
};

export const exportService = {
    exportTransactions: (format: ExportFormat = "csv", query: PeriodQuery = {}) =>
        http.get<{ jobId: string }>(
            `${API_ENDPOINTS.export.exportTransactions.url}${toQuery({ format, ...query } as QueryParams)}`
        ),

    exportReport: (data: { format: ExportFormat } & PeriodQuery) =>
        http.post<{ jobId: string }>(API_ENDPOINTS.export.exportReport.url, data),

    getJobStatus: (jobId: string) =>
        http.get<{ status: "pending" | "processing" | "completed" | "failed"; downloadUrl?: string }>(
            buildUrl(API_ENDPOINTS.export.getJobStatus, { jobId })
        ),
};
