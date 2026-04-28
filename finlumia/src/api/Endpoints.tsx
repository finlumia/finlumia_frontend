type Environment = "production" | "homologation" | "local";
type ServiceName = "configurator" | "identification" | "movimentation" | "document";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const CURRENT_ENV = (import.meta.env.VITE_APP_ENV ?? "local") as Environment;

export const VERSION_APP = import.meta.env.VITE_API_VERSION ?? "v1";

const SERVICE_BASE_URL: Record<Environment, Record<ServiceName, string>> = {
    production: {
        configurator: import.meta.env.VITE_SERVICE_CONFIGURATOR_PRODUCTION,
        identification: import.meta.env.VITE_SERVICE_IDENTIFICATION_PRODUCTION,
        movimentation: import.meta.env.VITE_SERVICE_MOVIMENTATION_PRODUCTION,
        document: import.meta.env.VITE_SERVICE_DOCUMENT_PRODUCTION,
    },
    homologation: {
        configurator: import.meta.env.VITE_SERVICE_CONFIGURATOR_HOMOLOGATION,
        identification: import.meta.env.VITE_SERVICE_IDENTIFICATION_HOMOLOGATION,
        movimentation: import.meta.env.VITE_SERVICE_MOVIMENTATION_HOMOLOGATION,
        document: import.meta.env.VITE_SERVICE_DOCUMENT_HOMOLOGATION,
    },
    local: {
        configurator: import.meta.env.VITE_SERVICE_CONFIGURATOR_LOCAL,
        identification: import.meta.env.VITE_SERVICE_IDENTIFICATION_LOCAL,
        movimentation: import.meta.env.VITE_SERVICE_MOVIMENTATION_LOCAL,
        document: import.meta.env.VITE_SERVICE_DOCUMENT_LOCAL,
    },
};

/**
 * Builda um endpoint completo combinando:
 * dominio do servico + versao da API + rota do recurso.
 */
const buildEndpoint = (service: ServiceName, path: string, method: HttpMethod) => ({
    url: `${SERVICE_BASE_URL[CURRENT_ENV][service]}/${VERSION_APP}${path}`,
    method,
});

/**
 * Catalogo central de endpoints por servico/modulo.
 * Mantem URL e metodo HTTP em um unico ponto de manutencao.
 */
export const API_ENDPOINTS = {
    configurator: {
        generic: {
            createLineGeneric: buildEndpoint("configurator", "/generic_create", "POST"),
            listLineGeneric: buildEndpoint("configurator", "/generic_list", "POST"),
            updateLineGeneric: buildEndpoint("configurator", "/generic_update", "PUT"),
            deleteLineGeneric: buildEndpoint("configurator", "/generic_delete", "DELETE"),
        },
    },
    identification: {},
    movimentation: {},
    document: {},
};