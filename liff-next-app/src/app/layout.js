import { LiffProvider } from '@/components/LiffProvider';
import { UserProvider } from '../components/UseProvider';
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
          <UserProvider>
            {children}
          </UserProvider>
        </LiffProvider>
      </body>
    </html>
  );
}