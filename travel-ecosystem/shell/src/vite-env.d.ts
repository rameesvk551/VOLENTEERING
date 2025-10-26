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
  const App: React.ComponentType;
  export default App;
}

declare module 'visaExplorer/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'travelHub/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'tripPlanner/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'volunteering/Router' {
  const Router: React.ComponentType;
  export default Router;
}
