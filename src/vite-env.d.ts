declare module '*.css' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_MVP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  aif?: {
    track: (event: string, props?: Record<string, unknown>) => void;
    mvpId?: string;
    sessionId?: string;
  };
}
