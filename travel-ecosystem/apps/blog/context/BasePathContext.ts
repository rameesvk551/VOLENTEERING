import { createContext, useContext } from 'react';

const BasePathContext = createContext<string>('/blog');

export const BasePathProvider = BasePathContext.Provider;

export const useBasePath = () => useContext(BasePathContext);

export default BasePathContext;
