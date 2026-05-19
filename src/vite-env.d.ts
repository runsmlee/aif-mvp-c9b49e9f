declare module '*.css' {
  const content: string;
  export default content;
}

interface Window {
  aif?: {
    track: (event: string, props?: Record<string, unknown>) => void;
    mvpId?: string;
    sessionId?: string;
  };
}
