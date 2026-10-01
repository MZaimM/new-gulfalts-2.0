interface ImportMetaEnv {
  /** Mapbox public access token (pk.…) for the location map. Set in v3/.env or the host env. */
  readonly VITE_MAPBOX_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
