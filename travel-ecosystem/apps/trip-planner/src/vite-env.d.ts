/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTE_API_KEY?: string;
  readonly VITE_TAVILY_API_KEY?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ROUTE_OPTIMIZER_API_URL?: string;
  readonly VITE_API_GATEWAY_URL?: string;
  readonly VITE_TRANSPORT_API_URL?: string;
  readonly VITE_OPTIMIZER_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
