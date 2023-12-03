'use client';
import * as React from 'react';
import { IdentifiableWithScope } from '@rekajs/core';
import { Parser } from '@rekajs/parser';
import * as t from '@rekajs/types';
import { observer, useReka } from '@rekajs/react';
import TextareaAutosize from 'react-textarea-autosize';

import { cn } from '@/utils';
import { Dropdown } from '@/components/ui/dropdown';
// import { Info } from '../info';
import { TextField } from '@/components/common/text-field';

type TextareaEditorProps = {
	initialValue?: t.Expression | null;
	className?: string;
	onClose: () => void;
	onCommit: (value: t.Expression) => void;
	identifiables?: IdentifiableWithScope[];
};

const TextareaEditor = ({
	onClose,
	onCommit,
	initialValue,
	className,
	identifiables,
	...props
}: TextareaEditorProps) => {
	const prevInitialValueRef = React.useRef(initialValue);

	const [value, setValue] = React.useState(
		initialValue ? Parser.stringify(initialValue) : ''
	);
	const [hasError, setHasError] = React.useState('');
	const domRef = React.useRef<HTMLTextAreaElement | null>(null);

	const valueRef = React.useRef(value);
	valueRef.current = value;

	const onCommitRef = React.useRef(onCommit);
	onCommitRef.current = onCommit;

	const onCloseRef = React.useRef(onClose);
	onCloseRef.current = onClose;

	const isDropdownOpen = React.useRef(false);

	React.useEffect(() => {
		const { current: prevInitialValue } = prevInitialValueRef;

		if (prevInitialValue === initialValue) {
			return;
		}

		prevInitialValueRef.current = initialValue;
		setValue(initialValue ? Parser.stringify(initialValue) : '');
	}, [setValue, initialValue]);

	const commit = React.useCallback(() => {
		const { current: onCommit } = onCommitRef;
		const { current: onClose } = onCloseRef;
		const { current: value } = valueRef;

		if (!value) {
			onClose();

			return;
		}

		try {
			onCommit(Parser.parseExpression(value));
			onClose();
		} catch (err) {
			setHasError(String(err));
		}
	}, [setHasError]);

	React.useEffect(() => {
		const { current: dom } = domRef;

		if (!dom) {
			return;
		}

		dom.focus();
		dom.setSelectionRange(dom.value.length, dom.value.length);

		const listener = (e: any) => {
			const target = e.target;
			if (target instanceof HTMLElement && dom.contains(target)) {
				return;
			}

			if (isDropdownOpen.current) {
				return;
			}

			commit();
		};

		const parent = window;

		parent.addEventListener('mousedown', listener);

		return () => {
			parent.removeEventListener('mousedown', listener);
		};
	}, [commit]);

	return (
		<div
			className={cn(
				'border-outline absolute -left-px -top-px z-40 w-[calc(100%+1px)] overflow-hidden rounded border border-solid bg-white shadow-2xl',
				{
					'rounded-bl-none rounded-br-none border-red-300': hasError,
				},
				className
			)}
		>
			<TextareaAutosize
				className="font-code w-full resize-none p-2.5 text-xs outline-none"
				{...props}
				value={value}
				ref={domRef}
				onChange={e => {
					setValue(e.target.value);
					setHasError('');
				}}
				onKeyDown={e => {
					if (e.key === 'Escape') {
						onClose();
						return;
					}

					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						commit();
					}
				}}
			/>
			<div className="flex items-start px-2.5 py-2">
				<div className="flex items-center gap-1">
					<div className="flex items-center justify-center rounded-full border border-solid border-secondary/20 py-px pl-1.5 pr-1 text-[0.6rem] text-secondary">
						Expression
						{/* <Info
							info={`An expression is expected here. Eg: "Some text value" for text literals.`}
						/> */}
					</div>
					{identifiables && (
						<Dropdown
							title="Variables"
							onChange={open => {
								isDropdownOpen.current = open;
							}}
							side="bottom"
							items={identifiables.map(({ identifiable, scope }) => ({
								title: (
									<span>
										{scope.level === 'external' ? '$' : ''}
										{identifiable.name}
									</span>
								),
								value: identifiable.id,
								onSelect: () => {
									const trimmed = value.trimEnd();
									const lastChar = trimmed.charAt(trimmed.length - 1);
									const addPlus = lastChar !== '+';
									const addSpace = value[value.length - 1] == ' ';

									let name = identifiable.name;

									if (scope.level === 'external') {
										name = `$` + name;
									}

									setValue(
										value +
											`${addSpace ? ' ' : ''}${addPlus ? ' + ' : ''}${name}`
									);

									const { current: dom } = domRef;

									if (!dom) {
										return;
									}

									Promise.resolve().then(() => {
										dom.focus();
										dom.setSelectionRange(dom.value.length, dom.value.length);
									});
								},
							}))}
						>
							<span
								title="Variables"
								className="bg-primary-100 flex cursor-pointer flex-col items-center rounded-full p-px text-center text-[0.6rem] text-primary"
							>{`{x}`}</span>
						</Dropdown>
					)}
				</div>
			</div>
			{hasError && (
				<div className="z-2 relative w-full bg-red-400 px-3 py-3 text-xs text-white">
					{hasError}
				</div>
			)}
		</div>
	);
};

type ExpressionInputProps = {
	value: t.Expression | null | undefined;
	placeholder?: string;
	disable?: boolean;
	onCommit?: (value: t.Expression) => void;
	onCancel?: () => void;
	className?: string;
	inputClassName?: string;
	textareaClassName?: string;
	identifiables?: IdentifiableWithScope[];
};

export const ExpressionInput = observer(
	({
		value,
		disable,
		placeholder,
		onCommit,
		onCancel,
		className,
		inputClassName,
		textareaClassName,
		identifiables: variables,
	}: ExpressionInputProps) => {
		const [showTextareaEditor, setShowTextareaEditor] = React.useState(false);

		return (
			<div className={cn('relative w-full', className)}>
				<TextField
					className={inputClassName}
					value={value ? Parser.stringify(value) : ''}
					onChange={() => {
						return;
					}}
					onFocus={() => {
						setShowTextareaEditor(true);
					}}
					onCancel={onCancel}
					disabled={disable}
					placeholder={placeholder}
				/>

				{showTextareaEditor && (
					<TextareaEditor
						initialValue={value}
						className={textareaClassName}
						onCommit={value => {
							if (!value || !onCommit) {
								return;
							}

							onCommit(value);
						}}
						onClose={() => {
							setShowTextareaEditor(false);
						}}
						identifiables={variables}
					/>
				)}
			</div>
		);
	}
);
