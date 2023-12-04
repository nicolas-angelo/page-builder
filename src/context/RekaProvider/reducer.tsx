import { nanoid } from 'nanoid';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { Draft } from 'immer';
import type { TreeItems, TreeItem } from '@/lib/SortableTreeV2/types';
import type { ItemChangedReason as Reason } from '@/lib/SortableTreeV2/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as t from '@rekajs/types';

export type RekaRef = { name: string; id: string; depth: number };

export type ComponentTreeItem = TreeItem<RekaRef>;
export type ComponentTreeItems = TreeItems<RekaRef>;
export type ItemChangedReason = Reason<ComponentTreeItem>;

export interface RekaState {
	hydrated: boolean;
	rootTemplateId: string | null;
	activeComponent: ComponentTreeItem | null;
	outlineItems: ComponentTreeItems;
}

export type UpdateTreePayload = {
	items: ComponentTreeItem[];
	reason: ItemChangedReason;
};

// action payloads
type Create = PayloadAction<
	RekaRef &
		Pick<ComponentTreeItem, 'children' | 'disableSorting' | 'canHaveChildren'>
>;

const initialState: RekaState = {
	hydrated: false,
	rootTemplateId: null,
	activeComponent: null,
	outlineItems: [],
};

const hasRootNode = (items: ComponentTreeItems) => {
	return items.some(item => item.name === 'root');
};

const addComponent = (draft: RekaState, { payload }: Create) => {
	if (payload.name === 'root') {
		draft.outlineItems.push(payload);
		draft.rootTemplateId = payload.id;
		draft.hydrated = true;
		return;
	}
	if (hasRootNode(draft.outlineItems)) {
		draft.outlineItems[0].children?.push(payload);
	}
};

const setActiveComponent = (
	draft: RekaState,
	{ payload }: PayloadAction<UniqueIdentifier>
) => {
	draft.activeComponent = findItemDeep(draft.outlineItems, payload);
};

const updateTree = (
	draft: RekaState,
	{ payload }: PayloadAction<UpdateTreePayload>
) => {
	let item: ComponentTreeItem;
	switch (payload.reason.type) {
		// collapased or expanded
		case 'dropped':
			draft.outlineItems = payload.items;
			break;
		case 'collapsed':
		case 'expanded':
			item = payload.reason.item;
			setProperty(draft.outlineItems, item.id, 'collapsed', value => !value);
			break;
		case 'removed':
			item = payload.reason.item;
			// Check if the activeComponent is the one being removed
			if (draft.activeComponent?.id === item.id) {
				draft.activeComponent = null;
			}
			removeComponents(draft.outlineItems, item.id);
			break;
		default:
			draft.outlineItems = payload.items;
	}
};

export const slice = createSlice({
	name: 'reka-designer',
	initialState,
	reducers: {
		addComponent,
		setActiveComponent,
		updateTree,
		reset: () => initialState,
	},
	extraReducers: builder => {
		builder.addDefaultCase((_state, action) => {
			throw new Error(`Unhandled action type: ${action.type}`);
		});
	},
});

/// utils
export function findItemDeep(
	draftItems: Draft<ComponentTreeItem[]>,
	itemId: UniqueIdentifier
): ComponentTreeItem | null {
	for (const item of draftItems) {
		const { id, children } = item;

		if (id === itemId) {
			return item;
		}

		if (children?.length) {
			const child = findItemDeep(children, itemId);

			if (child) {
				return child;
			}
		}
	}

	return null;
}

function setProperty<T extends keyof ComponentTreeItem>(
	draftItems: Draft<ComponentTreeItem[]>,
	id: ComponentTreeItem['id'],
	property: T,
	setter: (value: ComponentTreeItem[T]) => ComponentTreeItem[T]
) {
	for (const item of draftItems) {
		if (item.id === id) {
			item[property] = setter(item[property]);
			return;
		}

		if (item.children?.length) {
			setProperty(item.children, id, property, setter);
		}
	}
}

const removeComponents = (
	draftItems: Draft<ComponentTreeItem[]>,
	id: UniqueIdentifier
) => {
	for (let i = draftItems.length - 1; i >= 0; i--) {
		const item = draftItems[i];

		if (item.id === id) {
			// Remove the item by splicing the draft array
			draftItems.splice(i, 1);
			continue;
		}

		if (item.children?.length) {
			// Recursively remove components from children
			removeComponents(item.children, id);
		}
	}
};
