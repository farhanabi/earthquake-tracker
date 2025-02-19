import { Toaster } from '~/components/ui/sonner';
import './globals.css';

export const metadata = {
  title: 'Earthquake Tracker',
  description: 'Track earthquakes around the world',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
