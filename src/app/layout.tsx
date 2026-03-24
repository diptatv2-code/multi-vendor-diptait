import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { CartProvider } from '@/components/cart-provider';
import { ToastContainer } from '@/components/ui/toast';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-[#111] text-[#1D1D1F] dark:text-[#F5F5F7] antialiased">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <ToastContainer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
