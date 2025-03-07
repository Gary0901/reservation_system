import { LiffProvider } from '@/components/LiffProvider';
import './globals.css';

export const metadata = {
  title: '品朕羽球館',
  description: 'LINE LIFF應用',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <LiffProvider>
          {children}
        </LiffProvider>
      </body>
    </html>
  );
}