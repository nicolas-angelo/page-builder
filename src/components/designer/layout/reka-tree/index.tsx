'use client';
import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useReka, observer } from '@rekajs/react';
import * as t from '@rekajs/types';
import useRekaActions from '@/hooks/use-reka-actions';
import { GlobalSettings } from '@/components/designer/global-settings';
import { ComponentSettings } from '@/components/designer/component-settings';
import type { TreeItem } from '@/lib/SortableTreeV2/types';

import { useRekaEditor } from '@/context/RekaProvider';
import { RekaRef } from '@/context/RekaProvider/reducer';
import { getTemplateName } from '@/utils';
import { toJS } from '@rekajs/core';

const SortableList = dynamic(() => import('./sortable-list'), { ssr: false });

type TreeProps = { gridArea?: string };

export const RekaTree = observer(({ gridArea = 'components' }: TreeProps) => {
	const { reka } = useReka();
	const { actions, editorState } = useRekaEditor();
	const { outlineItems, hydrated } = editorState;
	const { rootApp, rootTemplate } = useRekaActions();

	const appComponent = reka.state.program.components.find(
		component => component.name === 'App'
	);

	const componentObj = toJS(appComponent)?.template;

	const itemsHaveRoot = useMemo(() => {
		return outlineItems.some(item => item.id === rootTemplate?.id);
	}, [outlineItems, rootTemplate]);

	function buildNewItem(template: t.Template): TreeItem<RekaRef> {
		let canHaveChildren = template instanceof t.SlottableTemplate;

		if (template instanceof t.TagTemplate) {
			if (template.tag === 'text') {
				canHaveChildren = false;
			}
			if (typeof template.meta === 'object') {
				// if template.meta has property canHaveChildren, use that
				if (typeof template.meta.canHaveChildren === 'boolean') {
					canHaveChildren = template.meta.canHaveChildren;
				}
			}
		}

		if (t.is(template, t.ComponentTemplate)) {
			if (template.component.external) {
				let external = reka.externals.getComponent(template.component.name);
				canHaveChildren = external.meta.canHaveChildren;
			}
		}

		// recursive build
		const children =
			template instanceof t.SlottableTemplate
				? template.children.map(child => {
						return buildNewItem(child);
				  })
				: [];

		return {
			id: template.id,
			name: getTemplateName(template),
			canHaveChildren,
			children,
			template: template,
		};
	}

	function createItem(template: t.Template) {
		if (!rootApp || !rootTemplate) return;
		actions.addComponent(buildNewItem(template));
		reka.change(() => {
			rootTemplate.children.push(template);
		});
	}

	useEffect(() => {
		if (!rootTemplate || itemsHaveRoot) return;
		// add root template to sortable outline items on page load
		actions.addComponent({
			id: rootTemplate.id,
			name: getTemplateName(rootTemplate),
			canHaveChildren: true,
			disableSorting: true,
			children: [],
			template: rootTemplate,
		});
	}, [rootTemplate, outlineItems]);

	useEffect(() => {
		const unsubscribe = reka.listenToChanges(payload => {
			if (payload.event !== 'change') return;
			if (payload.type === 'splice') {
				if (payload.addedCount !== 1) return;
				const item = payload.added[0];
				const rekaItem = reka.getNodeFromId(item.id, t.Template);
				const parent = reka.getParent(rekaItem);
				if (!parent || !(parent.node instanceof t.SlottableTemplate)) return;
				const parentChildren = parent.node.children;

				// get the items index in parentChildren
				const index = parentChildren.indexOf(rekaItem);
				console.log({ name: getTemplateName(rekaItem), index });
			}
		});
		return () => unsubscribe();
	}, [reka]);

	if (!rootApp || !hydrated) return null;

	return (
		<div
			style={{ gridArea }}
			className="relative flex flex-1 flex-col border-r border-zinc-200"
		>
			<GlobalSettings />
			<div className="flex flex-col p-2">
				<button
					className="inline-flex w-full bg-indigo-400 px-2 py-1"
					onClick={() =>
						createItem(
							t.componentTemplate({
								component: t.identifier({
									name: 'Demo',
									external: true,
								}),
								props: {
									name: t.literal({ value: 'Nicolas' }),
								},
							})
						)
					}
				>
					Add React Component
				</button>
				<button
					className="inline-flex w-full bg-indigo-400 px-2 py-1"
					onClick={() =>
						createItem(
							t.tagTemplate({
								tag: 'button',
								props: {
									className: t.literal({
										value:
											'inline-flex bg-indigo-400 px-4 py-2 rounded-md min-w-[20px]',
									}),
								},
								children: [],
							})
						)
					}
				>
					Add Button
				</button>
				<button
					className="inline-flex w-full bg-indigo-400 px-2 py-1"
					onClick={() =>
						createItem(
							t.tagTemplate({
								tag: 'text',
								meta: { canHaveChildren: false },
								props: {
									value: t.literal({ value: 'Click me!' }),
								},
							})
						)
					}
				>
					Add Text
				</button>
			</div>
			<div className="relative flex-1">
				<ComponentSettings />
				<SortableList items={[componentObj]} />
			</div>
		</div>
	);
});

export default RekaTree;
