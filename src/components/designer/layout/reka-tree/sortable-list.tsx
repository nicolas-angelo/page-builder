'use client';
import { useReka, observer } from '@rekajs/react';
import * as t from '@rekajs/types';
import useRekaActions from '@/hooks/use-reka-actions';
import { SortableTree } from '@/lib/SortableTreeV2';
import { useRekaEditor } from '@/context/RekaProvider';
import { findItemDeep } from '@/context/RekaProvider/reducer';
import { SortableTreeItem } from './sortable-item';
import type { ComponentTreeItems } from '@/context/RekaProvider/reducer';

interface ListProps {
	items: ComponentTreeItems;
}

export const SortableList = ({ items }: ListProps) => {
	const { reka } = useReka();
	const { actions, editorState, updateTreeWithCallback } = useRekaEditor();
	const { outlineItems } = editorState;
	const { rootApp, rootTemplate } = useRekaActions();

	return (
		<SortableTree
			items={items}
			onItemsChanged={async (items, reason) => {
				if (reason.type === 'dropped') {
					console.log('dropped', reason, items);
					const item = reason.draggedItem;
					const child = reka.getNodeFromId(String(item.id), t.Template);

					actions.updateTree({ items, reason });

					const fromParentRef = reason.draggedFromParent;
					const newParentRef = reason.droppedToParent;

					console.log({ outlineItems });
					updateTreeWithCallback({ items, reason }, state => {
						console.log({
							outlineItems: state.outlineItems,
						});
					});

					reka.change(() => {
						const appComponent = reka.state.program.components.find(
							component => component.name === 'App'
						);

						reka.change(() => {
							appComponent.template.children = items[0].children;
						});
					});

					if (
						newParentRef &&
						fromParentRef &&
						newParentRef.id === fromParentRef.id
					) {
						// reka.change(() => {
						// 	const itemTree = recursiveBuildNewNodesFromItems(items);
						// 	const parent = rootTemplate;
						// 	if (!(parent instanceof t.SlottableTemplate)) return;

						// 	parent.children.splice(
						// 		parent.children.indexOf(child),
						// 		1,
						// 		...itemTree
						// 	);
						// });
						// updateTreeWithCallback({ items, reason }, state => {
						// 	// all but the first
						// 	const newNodes = state.outlineItems.slice(1);

						// 	// let updatedItem = findItemDeep(
						// 	// 	newNodes,
						// 	// 	item.id
						// 	// )! as FlattenedItem<RekaRef>;
						// 	// if (!updatedItem.parentId) return;
						// 	// let parentItem = findItemDeep(newNodes, updatedItem.parentId);
						// 	// let newIndex = parentItem?.children?.indexOf(updatedItem);
						// });

						return;
					}

					// item is becoming a child of a new parent
					if (newParentRef) {
						let newParentId = String(newParentRef.id);
						let target = reka.getNodeFromId(newParentId, t.Template);

						if (
							target instanceof t.TagTemplate &&
							target.tag === 'button' &&
							child instanceof t.TagTemplate &&
							child.tag !== 'text'
						) {
							console.log('can only drop text in button');
							return;
						}

						// handle adding to new parent
						// reka.change(() => {
						// 	if (!(newParent instanceof t.SlottableTemplate)) {
						// 		return;
						// 	}
						// 	console.log(
						// 		'adding to parent',
						// 		getTemplateName(newParent)
						// 	);
						// 	newParent.children.push(child);
						// });
					}
				}
				if (reason.type === 'removed') {
					console.log('removed', reason);
					actions.updateTree({ items, reason });
				}
				if (reason.type === 'collapsed' || reason.type === 'expanded') {
					actions.updateTree({ items, reason });
				}
			}}
			TreeItemComponent={SortableTreeItem}
			// keepGhostInPlace
		/>
	);
};

export default SortableList;
