'use client';
import { useState, useRef, useEffect } from 'react';
import { useReka } from '@rekajs/react';
import * as t from '@rekajs/types';

export const isTagTemplate = (
	template?: t.Template
): template is t.TagTemplate =>
	template instanceof t.TagTemplate && template.tag !== 'fragment';

export default function useRekaActions() {
	const [rootApp, setRootApp] = useState<t.RekaComponent>();
	const [rootTemplate, setRootTemplate] = useState<t.TagTemplate>();
	const { reka } = useReka();

	const getRootComponent = (name = 'App') =>
		reka.state.program.components.find(component => component.name === name);

	const getComponent = (id: t.RekaComponent['id']) =>
		reka.state.program.components.find(component => component.id === id);

	const getRootTemplate = (component: t.RekaComponent) => {
		return isTagTemplate(component.template) ? component.template : undefined;
	};

	const addComponent = (template: t.Template) => {
		if (!isTagTemplate(template)) return;
		reka.change(() => {
			template.children.push(
				t.componentTemplate({
					component: t.identifier({
						name: 'Demo',
						external: true,
					}),
					props: {
						name: t.literal({ value: 'Nicolas' }),
					},
				})
			);
		});
	};

	useEffect(() => {
		const root = getRootComponent('App');
		if (root) {
			setRootApp(root);
			setRootTemplate(getRootTemplate(root));
		}
	}, [reka.state.program.components]);

	return {
		rootApp,
		rootTemplate,
		getComponent,
	};
}
