'use client';

import { createClient, type GardiaClient } from '@gardia/client';
import { createContext, useContext, useMemo } from 'react';

const Ctx = createContext<GardiaClient | null>(null);

export function GardiaProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(
    () =>
      createClient({
        apimUrl: process.env.NEXT_PUBLIC_APIM_URL!,
        authority: process.env.NEXT_PUBLIC_AUTHORITY!,
        clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
      }),
    [],
  );
  return <Ctx.Provider value={client}>{children}</Ctx.Provider>;
}

export function useGardia(): GardiaClient {
  const c = useContext(Ctx);
  if (!c) throw new Error('Wrap your app in <GardiaProvider>');
  return c;
}
