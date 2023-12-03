'use client';
import * as React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '@/utils';
import { IconButton } from '@/components/ui/icon-button';

type TextFieldProps = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
> & {
	inputClassName?: string;
	badge?: string;
	transparent?: boolean;
	children?: React.ReactNode;
	validate?: (value: any) => boolean;
	onCancel?: () => void;
	onCommit?: (value: any, setValue: (value?: string) => void) => void;
};

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
	(
		{
			inputClassName,
			className,
			transparent,
			badge,
			children,
			onCancel,
			onCommit,
			onChange,
			value,
			...props
		},
		ref
	) => {
		const [uncommittedValue, setUncommitedValue] = React.useState(value);
		const [hasError, setHasError] = React.useState('');

		const commitValue = () => {
			if (!onCommit) {
				return;
			}

			try {
				onCommit(uncommittedValue, value => {
					setUncommitedValue(value || '');
				});
			} catch (err) {
				setHasError(String(err));
			}
		};

		const cancel = () => {
			setHasError('');
			setUncommitedValue('');

			if (!onCancel) {
				return;
			}

			onCancel();
		};

		return (
			<div
				className={cn(
					'border-outline group relative flex flex-1 items-center rounded-md border border-solid shadow-sm',
					{
						'border-red-400': !!hasError,
						'border-none': transparent,
					},
					className
				)}
			>
				<input
					{...props}
					className={cn(
						'relative w-full border-none bg-transparent px-3 py-1.5 text-xs text-black/80 shadow-none outline-none transition',
						inputClassName
					)}
					value={onCommit ? uncommittedValue : value}
					onChange={e => {
						setHasError('');

						if (!onCommit && onChange) {
							onChange(e);
							return;
						}

						if (!onCommit) {
							return;
						}

						setUncommitedValue(e.target.value);
					}}
					onKeyUp={e => {
						if (e.key === 'Enter') {
							commitValue();
						}

						if (e.key === 'Escape') {
							cancel();
						}

						props.onKeyUp?.(e);
					}}
					ref={ref}
				/>
				{badge && (
					<div className="text-xss group-hover:opacity-1 absolute right-[5px] top-[50%] -translate-y-[50%] rounded-full bg-black/10 px-2 py-1 text-black/80 opacity-0 transition">
						{badge}
					</div>
				)}
				{children}
				{onCancel && (
					<IconButton
						className="mr-px border-none bg-none opacity-0 group-hover:opacity-100"
						onClick={() => {
							cancel();
						}}
					>
						<Cross2Icon />
					</IconButton>
				)}
				{hasError && (
					<div className="z-2 absolute left-0 top-full w-full bg-red-300 px-3 py-3 text-xs text-white">
						{hasError}
					</div>
				)}
			</div>
		);
	}
);
