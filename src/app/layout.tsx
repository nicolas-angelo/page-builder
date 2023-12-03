import { GeistSans } from 'geist/font/sans';
import { JetBrains_Mono } from 'next/font/google';
// import { ClerkProvider } from '@clerk/nextjs';
import { cn } from '@/utils';
import '@/app/globals.css';

type Props = { children: React.ReactNode };

const jetBrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-jetbrains-mono',
});

export default async function RootAppLayout({ children }: Props) {
	return (
		<html lang="en" suppressHydrationWarning className="light">
			<body
				className={cn(
					'h-screen overflow-hidden bg-background font-sans text-foreground antialiased',
					GeistSans.variable,
					jetBrainsMono.variable
				)}
			>
				{children}
			</body>
		</html>
	);
}
