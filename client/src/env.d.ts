interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SESSION_SECRET : string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
