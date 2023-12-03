import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { TreeItemComponentProps } from './types';
import DragIndicatorTwoToneIcon from '@mui/icons-material/DragIndicatorTwoTone';
import DoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

export const TreeItemWrapper = forwardRef<
	HTMLDivElement,
	React.PropsWithChildren<TreeItemComponentProps<{}>>
>((props, ref) => {
	const {
		clone,
		depth,
		disableSelection,
		disableInteraction,
		disableSorting,
		ghost,
		handleProps,
		indentationWidth,
		indicator,
		collapsed,
		onCollapse,
		onRemove,
		item,
		wrapperRef,
		style,
		hideCollapseButton,
		childCount,
		manualDrag,
		showDragHandle,
		disableCollapseOnItemClick,
		isLast,
		parent,
		className,
		contentClassName,
		isOver,
		isOverParent,
		...rest
	} = props;

	return (
		<li
			ref={wrapperRef}
			{...rest}
			className={clsx(
				'-mb-[1px] list-none',
				clone && 'pointer-events-none',
				ghost && 'opacity-50',
				disableSelection && 'select-none',
				disableInteraction && 'pointer-events-none',
				className
			)}
		>
			<div
				className={clsx('dnd-sortable-tree-item', contentClassName)}
				ref={ref}
				{...(manualDrag ? undefined : handleProps)}
				onClick={disableCollapseOnItemClick ? undefined : onCollapse}
			>
				{props.children}
			</div>
		</li>
	);
}) as <T>(
	p: React.PropsWithChildren<
		TreeItemComponentProps<T> & React.RefAttributes<HTMLDivElement>
	>
) => React.ReactElement;

export default TreeItemWrapper;
