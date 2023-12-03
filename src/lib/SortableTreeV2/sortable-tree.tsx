'use client';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
	Announcements,
	closestCenter,
	DndContext,
	DragEndEvent,
	DragMoveEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	DropAnimation,
	Modifier,
	PointerSensor,
	PointerSensorOptions,
	UniqueIdentifier,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
	arrayMove,
	SortableContext,
	UseSortableArguments,
} from '@dnd-kit/sortable';

import {
	buildTree,
	findItemDeep,
	flattenTree,
	getChildCount,
	getProjection,
	removeChildrenOf,
} from './utils';
import type {
	FlattenedItem,
	ItemChangedReason,
	SensorContext,
	TreeItemComponentType,
	TreeItems,
	TreeItem,
} from './types';
import { SortableTreeItem } from './sortable-tree-item';
import { customListSortingStrategy } from './utils/sorting-strategy';

import dropAnimationDefaultConfig from './utils/drop-animation-config';

import { useReka, observer } from '@rekajs/react';
import * as t from '@rekajs/types';
import useRekaActions from '@/hooks/use-reka-actions';

export const hydrateTreeItems = <TreeItemData extends Record<string, any>>(
	items: TreeItems<TreeItemData>
) => {
	const clonedItems: FlattenedItem<TreeItemData>[] = flattenTree(items);
	const newItems = buildTree(clonedItems);
	setTimeout(() => {}, 100);
	return newItems;
};

export type SortableTreeProps<
	TData extends Record<string, any>,
	TElement extends HTMLElement = HTMLDivElement,
> = {
	items: TreeItems<TData>;
	onItemsChanged(
		items: TreeItems<TData>,
		reason: ItemChangedReason<TData>
	): void;
	TreeItemComponent: TreeItemComponentType<TData, TElement>;
	indentationWidth?: number;
	indicator?: boolean;
	pointerSensorOptions?: PointerSensorOptions;
	disableSorting?: boolean;
	dropAnimation?: DropAnimation | null;
	dndContextProps?: React.ComponentProps<typeof DndContext>;
	sortableProps?: Omit<UseSortableArguments, 'id'>;
	keepGhostInPlace?: boolean;
	canRootHaveChildren?: boolean | ((dragItem: FlattenedItem<TData>) => boolean);
};

const defaultPointerSensorOptions: PointerSensorOptions = {
	activationConstraint: {
		delay: 300,
		distance: 3,
		tolerance: 10,
	},
};

export function SortableTree<
	TreeItemData extends Record<string, any>,
	TElement extends HTMLElement = HTMLDivElement,
>({
	items,
	indicator,
	indentationWidth = 20,
	onItemsChanged,
	TreeItemComponent,
	pointerSensorOptions,
	disableSorting,
	dropAnimation,
	dndContextProps,
	sortableProps,
	keepGhostInPlace,
	canRootHaveChildren,
	...rest
}: SortableTreeProps<TreeItemData, TElement>) {
	const { reka } = useReka();

	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
	const [offsetLeft, setOffsetLeft] = useState(0);
	const [currentPosition, setCurrentPosition] = useState<{
		parentId: UniqueIdentifier | null;
		overId: UniqueIdentifier;
	} | null>(null);

	const flattenedItems = useMemo(() => {
		const flattenedTree = flattenTree(items);
		const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
			(acc, { children, collapsed, id }) =>
				collapsed && children?.length ? [...acc, id] : acc,
			[]
		);

		const result = removeChildrenOf(
			flattenedTree,
			activeId ? [activeId, ...collapsedItems] : collapsedItems
		);
		return result;
	}, [activeId, items]);

	const projected = getProjection(
		flattenedItems,
		activeId,
		overId,
		offsetLeft,
		indentationWidth,
		keepGhostInPlace ?? false,
		canRootHaveChildren
	);
	const sensorContext: SensorContext<TreeItemData> = useRef({
		items: flattenedItems,
		offset: offsetLeft,
	});

	const sensors = useSensors(
		useSensor(
			PointerSensor,
			pointerSensorOptions ?? defaultPointerSensorOptions
		)
	);

	const sortedIds = useMemo(
		() => flattenedItems.map(({ id }) => id),
		[flattenedItems]
	);
	const activeItem = activeId
		? flattenedItems.find(({ id }) => id === activeId)
		: null;

	useEffect(() => {
		sensorContext.current = {
			items: flattenedItems,
			offset: offsetLeft,
		};
	}, [flattenedItems, offsetLeft]);

	const itemsRef = useRef<TreeItems<TreeItemData>>(items);
	itemsRef.current = items;

	const handleRemove = useCallback(
		(id: string) => {
			const item = findItemDeep(itemsRef.current, id)!;
			onItemsChanged(itemsRef.current, {
				type: 'removed',
				item,
			});
		},
		[onItemsChanged]
	);

	const handleCollapse = useCallback(
		(id: string) => {
			const item = findItemDeep(itemsRef.current, id)!;
			onItemsChanged(itemsRef.current, {
				type: item.collapsed ? 'collapsed' : 'expanded',
				item: item,
			});
		},
		[onItemsChanged]
	);

	// const announcements: Announcements = useMemo(
	// 	() => ({
	// 		onDragStart({ active }) {
	// 			return `Picked up ${active.id}.`;
	// 		},
	// 		onDragMove({ active, over }) {
	// 			return getMovementAnnouncement('onDragMove', active.id, over?.id);
	// 		},
	// 		onDragOver({ active, over }) {
	// 			return getMovementAnnouncement('onDragOver', active.id, over?.id);
	// 		},
	// 		onDragEnd({ active, over }) {
	// 			return getMovementAnnouncement('onDragEnd', active.id, over?.id);
	// 		},
	// 		onDragCancel({ active }) {
	// 			return `Moving was cancelled. ${active.id} was dropped in its original position.`;
	// 		},
	// 	}),
	// 	[]
	// );

	const strategyCallback = useCallback(() => {
		return !!projected;
	}, [projected]);

	return (
		<DndContext
			// accessibility={{ announcements }}
			sensors={disableSorting ? undefined : sensors}
			modifiers={[restrictToWindowEdges]}
			collisionDetection={closestCenter}
			// measuring={measuring}
			onDragStart={disableSorting ? undefined : handleDragStart}
			onDragMove={disableSorting ? undefined : handleDragMove}
			onDragOver={disableSorting ? undefined : handleDragOver}
			onDragEnd={disableSorting ? undefined : handleDragEnd}
			onDragCancel={disableSorting ? undefined : handleDragCancel}
			{...dndContextProps}
		>
			<SortableContext
				items={sortedIds}
				strategy={
					disableSorting
						? undefined
						: customListSortingStrategy(strategyCallback)
				}
			>
				{flattenedItems.map(item => {
					return (
						<SortableTreeItem
							{...rest}
							key={item.id}
							id={item.id as any}
							item={item}
							childCount={item.children?.length}
							depth={
								item.id === activeId && projected && !keepGhostInPlace
									? projected.depth
									: item.depth
							}
							indentationWidth={indentationWidth}
							indicator={indicator}
							collapsed={Boolean(item.collapsed && item.children?.length)}
							onCollapse={item.children?.length ? handleCollapse : undefined}
							onRemove={handleRemove}
							isLast={
								item.id === activeId && projected
									? projected.isLast
									: item.isLast
							}
							parent={
								item.id === activeId && projected
									? projected.parent
									: item.parent
							}
							TreeItemComponent={TreeItemComponent}
							disableSorting={disableSorting}
							sortableProps={sortableProps}
							keepGhostInPlace={keepGhostInPlace}
						/>
					);
				})}
				{createPortal(
					<DragOverlay
						dropAnimation={
							dropAnimation === undefined
								? dropAnimationDefaultConfig
								: dropAnimation
						}
					>
						{activeId && activeItem ? (
							<TreeItemComponent
								{...rest}
								item={activeItem}
								children={[]}
								depth={activeItem.depth}
								clone
								childCount={getChildCount(items, activeId) + 1}
								indentationWidth={indentationWidth}
								isLast={false}
								parent={activeItem.parent}
								isOver={false}
								isOverParent={false}
							/>
						) : null}
					</DragOverlay>,
					document.body
				)}
			</SortableContext>
		</DndContext>
	);

	function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
		setActiveId(activeId);
		setOverId(activeId);

		const activeItem = flattenedItems.find(({ id }) => id === activeId);

		if (activeItem) {
			setCurrentPosition({
				parentId: activeItem.parentId,
				overId: activeId,
			});
		}

		document.body.style.setProperty('cursor', 'grabbing');
	}

	function handleDragMove({ delta }: DragMoveEvent) {
		setOffsetLeft(delta.x);
	}

	function handleDragOver({ over }: DragOverEvent) {
		setOverId(over?.id ?? null);
	}

	function handleDragEnd({ active, over }: DragEndEvent) {
		resetState();

		if (projected && over) {
			const { depth, parentId } = projected;
			if (keepGhostInPlace && over.id === active.id) return;
			const clonedItems: FlattenedItem<TreeItemData>[] = flattenTree(items);
			const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
			const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
			const activeTreeItem = clonedItems[activeIndex];

			clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };
			const draggedFromParent = activeTreeItem.parent;
			const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
			const newItems = buildTree(sortedItems);
			const newActiveItem = sortedItems.find(x => x.id === active.id)!;
			const currentParent = newActiveItem.parentId
				? sortedItems.find(x => x.id === newActiveItem.parentId)!
				: null;
			// removing setTimeout leads to an unwanted scrolling
			// Use case:
			//   There are a lot of items in a tree (so that the scroll exists).
			//   You take the node from the bottom and move it to the top
			//   Without `setTimeout` when you drop the node the list gets scrolled to the bottom.
			setTimeout(() =>
				onItemsChanged(newItems, {
					type: 'dropped',
					draggedItem: newActiveItem,
					draggedFromParent: draggedFromParent,
					droppedToParent: currentParent,
				})
			);
		}
	}

	function handleDragCancel() {
		resetState();
	}

	function resetState() {
		setOverId(null);
		setActiveId(null);
		setOffsetLeft(0);
		setCurrentPosition(null);

		document.body.style.setProperty('cursor', '');
	}
}

const adjustTranslate: Modifier = ({ transform }) => {
	return {
		...transform,
		y: transform.y - 25,
	};
};
const modifiersArray = [adjustTranslate];

export default SortableTree;
