'use client';
import { forwardRef } from 'react';
import { useReka, observer } from '@rekajs/react';
import * as t from '@rekajs/types';
import { TreeItemWrapper } from '@/lib/SortableTreeV2';
import type { TreeItemComponentProps } from '@/lib/SortableTreeV2';

import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/utils';

import { useRekaEditor } from '@/context/RekaProvider';
import { RekaRef } from '@/context/RekaProvider/reducer';

import DoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import DragIndicatorTwoToneIcon from '@mui/icons-material/DragIndicatorTwoTone';

export const SortableTreeItem = forwardRef<
	HTMLDivElement,
	TreeItemComponentProps<RekaRef>
>(({ onRemove, ...props }, ref) => {
	const { reka } = useReka();
	const { actions, editorState } = useRekaEditor();
	const { activeComponent } = editorState;

	const isSelected = activeComponent?.id === props.item.id;

	function handleRemove() {
		const template = reka.getNodeFromId(props.item.id, t.Template);

		reka.change(() => {
			const parentRef = reka.getParent(template, t.Template);
			if (!parentRef) return;

			const parent = parentRef.node;
			if (!(parent instanceof t.SlottableTemplate)) return;

			reka.change(() => {
				parent.children.splice(parent.children.indexOf(template), 1);
			});
		});
		onRemove?.();
	}

	return (
		<TreeItemWrapper
			{...props}
			ref={ref}
			className={cn(
				'template-layer-name my-1 cursor-pointer rounded-md px-4 py-0.5',
				props.isOver ? 'border-2 border-emerald-500' : 'border-none',
				{
					'bg-primary/10 text-primary': isSelected,
					'hover:bg-gray-100': !isSelected,
				}
			)}
			manualDrag
			disableSorting={props.item.disableSorting}
			disableCollapseOnItemClick
		>
			<div
				className="flex flex-1 items-center"
				style={{ marginLeft: `${props.depth * 10}px` }}
				onMouseDown={e => {
					e.stopPropagation();
					actions.setActiveComponent(props.item.id);
				}}
			>
				{!props.item.disableSorting && (
					<div
						className={'cursor-pointer self-stretch text-base'}
						{...props.handleProps}
					>
						<DragIndicatorTwoToneIcon
							fontSize="inherit"
							className="text-indigo-400"
						/>
					</div>
				)}
				<div className="flex flex-1 items-center gap-2">
					<span className="text-xs">{props.item.id}</span>
				</div>
				<div>
					{props.item.name !== 'root' && (
						<IconButton
							className="cursor-pointer hover:text-rose-500"
							onClick={e => {
								e.stopPropagation();
								handleRemove();
							}}
						>
							<DeleteTwoToneIcon fontSize="inherit" />
						</IconButton>
					)}
					{!!props.onCollapse && !!props.childCount && (
						<IconButton
							onClick={e => {
								e.preventDefault();
								props.onCollapse?.();
							}}
							className={cn(
								'dnd-sortable-tree_simple_tree-item-collapse_button',
								props.collapsed &&
									'dnd-sortable-tree_folder_simple-item-collapse_button-collapsed'
							)}
						>
							<DoubleArrowDownIcon
								fontSize="small"
								className=" text-zinc-800"
							/>
						</IconButton>
					)}
				</div>
			</div>
		</TreeItemWrapper>
	);
});
