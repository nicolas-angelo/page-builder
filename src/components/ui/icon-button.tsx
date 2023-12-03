import * as React from 'react';
import { cn } from '@/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'subtle' | 'link';
	size?: 'default' | 'xs' | 'xxs' | 'lg';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ children, variant = 'default', size = 'default', className, ...props },
		ref
	) => {
		return (
			<button
				className={cn(
					'[&>svg]:pointer-events-inherit inline-flex cursor-pointer items-center justify-center rounded-md border border-solid border-transparent transition-colors focus:outline-none disabled:pointer-events-none  disabled:opacity-50',
					{
						'bg-transparent text-gray-500 hover:bg-black/5 hover:text-neutral-900':
							variant === 'default',
						'bg-primary/10 text-primary hover:bg-primary/20':
							variant === 'primary',
						'bg-purple-100 text-purple-600 hover:bg-purple-200':
							variant === 'secondary',
						'border-outline border border-solid bg-transparent text-neutral-500 shadow-sm hover:border-transparent hover:bg-primary/10 hover:text-primary':
							variant === 'outline',
						'hover:bg-primary-100 bg-transparent text-primary':
							variant === 'subtle',
						'bg-transparent text-blue-600 hover:text-blue-500':
							variant === 'link',
					},
					{
						'px-2.5 py-2.5 text-xs [&>svg]:h-4 [&>svg]:w-4': size == 'default',
						'rounded-md px-1.5 py-1.5 text-xs [&>svg]:h-3 [&>svg]:w-3':
							size === 'xs',
						'rounded-md px-1 py-1 text-xs [&>svg]:h-3 [&>svg]:w-3':
							size === 'xxs',
						'text-md rounded-md px-4 py-4 [&>svg]:h-4 [&>svg]:w-4':
							size === 'lg',
					},
					{
						'p-0': variant === 'link',
					},
					className
				)}
				ref={ref}
				{...props}
			>
				{children}
			</button>
		);
	}
);

export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, size, variant, className, ...props }, ref) => {
		return (
			<Button
				ref={ref}
				className={className}
				variant={variant}
				size={size || 'xs'}
				{...props}
			>
				{children}
			</Button>
		);
	}
);
