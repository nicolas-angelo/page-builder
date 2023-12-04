'use client';
import { useReka, observer } from '@rekajs/react';
import * as t from '@rekajs/types';
import useRekaActions from '@/hooks/use-reka-actions';
import { SortableTree } from '@/lib/SortableTreeV2';
import { useRekaEditor } from '@/context/RekaProvider';
import { findItemDeep } from '@/context/RekaProvider/reducer';
import { SortableTreeItem } from './sortable-item';
import type { ComponentTreeItems } from '@/context/RekaProvider/reducer';
import { insertAt } from '@/utils';

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

					// HERE <-- nicolas assumed it is 0
					updateTreeWithCallback({ items, reason }, state => {
						if (
							newParentRef &&
							fromParentRef &&
							rootTemplate?.children &&
							newParentRef.id === fromParentRef.id
						) {
							const { draggedFromParent, draggedItem, droppedToParent } =
								reason;
							const stateOutlineItems = state.outlineItems;

							const indexToInsert =
								stateOutlineItems[0].children?.findIndex(
									i => i.id === draggedItem.id
								) ?? 0;

							const filteredChildren = [...rootTemplate.children].filter(
								i => i.id !== draggedItem.id
							);
							const newChildren = insertAt(
								filteredChildren,
								draggedItem.template,
								indexToInsert
							);

							reka.change(() => {
								rootTemplate.children = newChildren;
							});

							console.log('[+] REKA newChildren === ', {
								newChildren,
							});
						}
					});

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

						reka.change(() => {
							if (
								// if target is not a slottable template
								!(target instanceof t.SlottableTemplate) ||
								!newParentRef.canHaveChildren
							) {
								console.log('target is not slottable template');
								return;
							}
							// add to new parent
							target.children.splice(target.children.indexOf(child), 0, child);
							if (fromParentRef) {
								// remove from old parent
								let oldParentId = String(fromParentRef.id);
								let oldParent = reka.getNodeFromId(oldParentId, t.Template);
								if (oldParent instanceof t.SlottableTemplate) {
									oldParent.children.splice(
										oldParent.children.indexOf(child),
										1
									);
								}
							}
						});
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
