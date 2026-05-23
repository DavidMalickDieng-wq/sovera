import { GardiaProvider } from '@/lib/gardia';

export const metadata = { title: 'Gardia sample' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto' }}>
        <GardiaProvider>{children}</GardiaProvider>
      </body>
    </html>
  );
}
