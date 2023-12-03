import * as React from 'react';
import { cn } from '@/utils';

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					'dark:!placeholder:text-gray-400 flex min-h-[60px] w-full rounded-md border !border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:italic placeholder:!text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:!ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:!border-gray-800 dark:focus-visible:!ring-gray-300',
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Textarea.displayName = 'Textarea';

export { Textarea };
