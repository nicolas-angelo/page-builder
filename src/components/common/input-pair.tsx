import * as React from 'react';
import {
	ChevronDownIcon,
	Cross2Icon,
	Link1Icon,
	LinkBreak2Icon,
} from '@radix-ui/react-icons';
import { observer, useReka } from '@rekajs/react';
import { IdentifiableWithScope } from '@rekajs/core';
import * as t from '@rekajs/types';

import { Button, IconButton } from '@/components/ui/icon-button';
import { Dropdown } from '@/components/ui/dropdown';
import { ExpressionInput } from '@/components/designer/expression-input';
import { TextField } from './text-field';
// import { Tooltip } from '../tooltip';

type PairInputFieldProps = {
	id: string;
	index?: number;
	value: t.Expression | null;
	disableEditId?: boolean;
	disableEditValue?: boolean;
	allowPropBinding?: boolean;
	onRemove?: () => void;
	onChange?: (id: string, value: t.Expression, clear: () => void) => void;
	idPlaceholder?: string;
	valuePlaceholder?: string;
	getIdentifiablesForExpr?: (i?: number) => IdentifiableWithScope[];
};

type PairInputValue = {
	id: string;
	value: t.Expression | null;
};

type PairInputProps = {
	values: PairInputValue[];
	idPlaceholder?: string;
	valuePlaceholder?: string;
	onChange?: (id: string, value: t.Expression, type: 'update' | 'new') => void;
	allowPropBinding?: boolean;
	onRemove?: (id: string, value: t.Expression | null) => void;
	onCancelAdding?: () => void;
	addingNewField?: boolean;
	emptyValuesText?: string;
	getIdentifiablesForExpr?: (i?: number) => IdentifiableWithScope[];
};

type AddNewPairInputFieldProps = {
	onAdd: (id: string, value: t.Expression) => void;
	allowPropBinding?: boolean;
	onCancel: () => void;
	idPlaceholder?: string;
	valuePlaceholder?: string;
	getIdentifiablesForExpr?: (i?: number) => IdentifiableWithScope[];
};

const AddNewPairInputField = (props: AddNewPairInputFieldProps) => {
	const domRef = React.useRef<HTMLDivElement | null>(null);

	const commit = (id: string, value: t.Expression) => {
		if (!id || !value) {
			return;
		}

		props.onAdd(id, value);

		const { current: dom } = domRef;

		if (!dom) {
			return;
		}

		const idFieldDom = dom.querySelector(
			'.pair-input-id-field input'
		) as HTMLInputElement;

		if (!idFieldDom) {
			return;
		}

		idFieldDom.focus();
		idFieldDom.setSelectionRange(0, 0);
	};

	return (
		<PairInputField
			ref={domRef}
			id={''}
			value={null}
			allowPropBinding={props.allowPropBinding}
			onRemove={() => {
				props.onCancel();
			}}
			onChange={(id, value, clear) => {
				commit(id, value);

				clear();
			}}
			idPlaceholder={props.idPlaceholder}
			valuePlaceholder={props.valuePlaceholder}
			getIdentifiablesForExpr={props.getIdentifiablesForExpr}
		/>
	);
};

const PairInputField = observer(
	React.forwardRef<HTMLDivElement, PairInputFieldProps>(
		(
			{
				id,
				index,
				value,
				disableEditId,
				disableEditValue,
				onRemove,
				allowPropBinding,
				onChange,
				idPlaceholder,
				valuePlaceholder,
				getIdentifiablesForExpr: variables,
			},
			ref
		) => {
			const [newId, setNewId] = React.useState(id);
			const [newValue, setNewValue] = React.useState(value);
			const [isPropBinding, setIsPropBinding] = React.useState(
				t.is(value, t.PropBinding)
			);

			const clear = React.useCallback(() => {
				setNewId('');
				setNewValue(null);
			}, [setNewId, setNewValue]);

			React.useEffect(() => {
				setNewValue(value);
			}, [value]);

			return (
				<div
					className={`
        border-outline
        [&_input]:border-r-solid group relative -mb-px grid grid-cols-[80px_1fr] gap-0 border
        border-solid first:rounded-tl-md
        first:rounded-tr-md last:rounded-bl-md
        last:rounded-br-md
        [&:not:last-child]:border-b-transparent [&_input]:rounded-none [&_input]:border-r [&_input]:border-none
      `}
					ref={ref}
				>
					{/* <Tooltip content={newId} disabled={!disableEditId}> */}
					<TextField
						className={`pair-input-id-field border-r-solid border-r-outline rounded-none border-b-0 border-l-0 border-r border-t-0`}
						inputClassName={'overflow-hidden text-ellipsis'}
						placeholder={idPlaceholder}
						value={newId}
						onChange={e => {
							setNewId(e.target.value);
						}}
						onKeyUp={e => {
							if (e.key !== 'Enter') {
								return;
							}

							if (!newId || !value || !onChange) {
								return;
							}

							onChange(newId, value, clear);
						}}
						disabled={disableEditId}
					/>
					{/* </Tooltip> */}

					<div className="relative grid w-full grid-cols-[1fr_auto_auto] items-center">
						{!isPropBinding && (
							<ExpressionInput
								className="static"
								textareaClassName="w-[calc(100%+2px)]"
								inputClassName="rounded-none border-none"
								value={newValue}
								placeholder={valuePlaceholder}
								onCommit={value => {
									if (!onChange) {
										return;
									}

									setNewValue(value);
									onChange(newId, value, clear);
								}}
								disable={disableEditValue}
								identifiables={variables ? variables(index) : undefined}
							/>
						)}
						{isPropBinding && (
							<div className="flex w-full items-center p-0.5 px-1">
								<Dropdown
									items={
										variables
											? variables(index)
													.filter(({ scope }) => scope.level !== 'external')
													.map(({ identifiable }) => ({
														title: <span>{identifiable.name}</span>,
														value: identifiable.id,
														onSelect: () => {
															onChange?.(
																id,
																t.propBinding({
																	identifier: t.identifier({
																		name: identifiable.name,
																	}),
																}),
																clear
															);
														},
													}))
											: []
									}
								>
									<Button
										className="flex gap-1 py-0.5 text-xs"
										variant="secondary"
										size="xxs"
									>
										{t.is(value, t.PropBinding)
											? value.identifier.name
											: 'Select Variable'}
										<ChevronDownIcon />
									</Button>
								</Dropdown>
							</div>
						)}

						{!isPropBinding && allowPropBinding && (
							// <Tooltip content="Bind prop to variable">
							<IconButton
								className="m-0 opacity-0 group-hover:opacity-100"
								onClick={() => {
									setIsPropBinding(true);
									if (!onChange) {
										return;
									}

									if (t.is(value, t.Identifier) && !value.external) {
										onChange(
											id,
											t.propBinding({
												identifier: t.identifier({
													name: value.name,
												}),
											}),
											clear
										);
									}
								}}
							>
								<Link1Icon />
							</IconButton>
							// </Tooltip>
						)}
						{isPropBinding && (
							<IconButton
								className="m-0 opacity-0 group-hover:opacity-100"
								onClick={() => {
									setIsPropBinding(false);
									if (!onChange) {
										return;
									}

									if (t.is(value, t.PropBinding)) {
										onChange(
											id,
											t.identifier({ name: value.identifier.name }),
											clear
										);
										return;
									}
								}}
							>
								<LinkBreak2Icon />
							</IconButton>
						)}
						<IconButton
							className="m-0 opacity-0 group-hover:opacity-100"
							onClick={() => {
								if (!onRemove) {
									return;
								}

								onRemove();
							}}
						>
							<Cross2Icon />
						</IconButton>
					</div>
				</div>
			);
		}
	)
);

export const PairInput = (props: PairInputProps) => {
	return (
		<div>
			{props.values.map(({ id, value }, i) => {
				return (
					<PairInputField
						{...props}
						disableEditId
						key={id}
						id={id}
						index={i}
						value={value}
						onRemove={() => {
							props.onRemove?.(id, value);
						}}
						onChange={(id, value) => {
							props.onChange?.(id, value, 'update');
						}}
						valuePlaceholder={props.valuePlaceholder}
						getIdentifiablesForExpr={props.getIdentifiablesForExpr}
					/>
				);
			})}
			{!props.addingNewField && props.values.length === 0 && (
				<div>
					<span className="text-xs text-gray-500">
						{props.emptyValuesText || 'No values yet'}
					</span>
				</div>
			)}
			{props.addingNewField && (
				<AddNewPairInputField
					{...props}
					allowPropBinding={props.allowPropBinding}
					onAdd={(id, value) => {
						props.onChange?.(id, value, 'new');
						props.onCancelAdding?.();
					}}
					onCancel={() => {
						props.onCancelAdding?.();
					}}
					idPlaceholder={props.idPlaceholder}
					valuePlaceholder={props.valuePlaceholder}
					getIdentifiablesForExpr={props.getIdentifiablesForExpr}
				/>
			)}
		</div>
	);
};
