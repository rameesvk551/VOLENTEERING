/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Module Federation type declarations
declare module 'blog/App' {
  const App: React.ComponentType<{ basePath?: string }>;
  export default App;
}

declare module 'visaExplorer/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'adminDashboard/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'tripPlanner/App' {
  const App: React.ComponentType<{ basename?: string }>;
  export default App;
}

declare module 'volunteering/Router' {
  const Router: React.ComponentType;
  export default Router;
}
