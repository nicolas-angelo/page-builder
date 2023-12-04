'use client';
import { useRef } from 'react';
import { useReka, observer } from '@rekajs/react';
import * as t from '@rekajs/types';
import useRekaActions from '@/hooks/use-reka-actions';
import { SortableTree } from '@/lib/SortableTreeV2';
import { useRekaEditor } from '@/context/RekaProvider';
import { findItemDeep } from '@/context/RekaProvider/reducer';
import { SortableTreeItem } from './sortable-item';
import type { ComponentTreeItems } from '@/context/RekaProvider/reducer';

import _ from 'lodash';

interface ListProps {
	items: ComponentTreeItems;
}

export function findRekaNodeDeep(
	nodes: t.Template[],
	itemId: string
): t.Template | null {
	for (const item of nodes) {
		const { id } = item;

		if (id === itemId) {
			return item;
		}

		if (item instanceof t.SlottableTemplate && item.children.length) {
			const child = findRekaNodeDeep(item.children, itemId);

			if (child) {
				return child;
			}
		}
	}

	return null;
}

function getIndexById(array: any[], Id: string) {
	return array.findIndex(c => c.id === Id);
}
function getRekaIndexById(parent: t.SlottableTemplate, id: string) {
	return parent.children.findIndex(c => c.id === id);
}

export const SortableList = ({ items: sortableItems }: ListProps) => {
	const { reka } = useReka();
	const { actions, editorState } = useRekaEditor();
	const { rootApp, rootTemplate } = useRekaActions();

	const { outlineItems } = editorState;

	const getNodeFromId = (id: string) =>
		reka.getNodeFromId(id, t.SlottableTemplate);

	return (
		<SortableTree
			items={sortableItems}
			onItemsChanged={async (items, reason) => {
				switch (reason.type) {
					case 'dropped':
						// console.log('dropped', reason, items);

						const item = reason.draggedItem;
						const child = reka.getNodeFromId(item.id, t.Template);
						const childParent = reka.getParent(child, t.SlottableTemplate);

						const oldParentRef = reason.draggedFromParent!;
						const newParentRef = reason.droppedToParent;

						console.log(reason);
						if (!newParentRef) {
							return; // if item is being moved to the root
						}

						// if item is being moved to a new parent
						const [oldParent, newParent] = [oldParentRef, newParentRef].map(
							ref => getNodeFromId(ref.id)
						);

						const xItem = findItemDeep(items, item.id);
						const oldIndex = getRekaIndexById(oldParent, item.id);
						const newIndex = getRekaIndexById(newParent, item.id);

						console.log({ oldIndex, newIndex });
						const depth = item.depth;

						if (oldParent.id === newParent.id && oldIndex === newIndex) {
							return; // if item is being moved to the same place
						}

						reka.change(() => {
							oldParent.children.splice(oldIndex, 1);
							newParent.children.splice(newIndex, 0, child);
						});
						actions.updateTree({ items, reason });

						break;
					case 'collapsed':
					case 'expanded':
					case 'removed':
						actions.updateTree({ items, reason });
						break;
				}
			}}
			TreeItemComponent={SortableTreeItem}
			// keepGhostInPlace
		/>
	);
};

export default SortableList;
