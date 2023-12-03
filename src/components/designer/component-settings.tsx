'use client';
import * as React from 'react';
import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import useRekaActions from '@/hooks/use-reka-actions';
import SettingSection from '@/components/common/settings-sections';
import { TemplateLayers } from './template-layers';

export const ComponentSettings = observer(() => {
	const { rootApp } = useRekaActions();
	// const editor = useEditor();
	// const [isAddingNewProp, setIsAddingNewProp] = React.useState(false);
	// const [isAddingNewState, setIsAddingNewState] = React.useState(false);

	// if (!editor.activeComponentEditor) {
	// 	return null;
	// }

	// const component = editor.activeComponentEditor.component;

	if (!(rootApp instanceof t.RekaComponent)) {
		return null;
	}

	return (
		<div className="flex flex-col">
			<div className="text-md flex items-center px-5 py-2 [&>input]:px-2 [&>input]:py-3 [&>input]:hover:bg-gray-500">
				<h1 className="mb-2 flex-1 text-lg">{rootApp.name}</h1>
			</div>
			<div className="relative flex-1">
				<SettingSection title="Layers" collapsedOnInitial={false}>
					<TemplateLayers componentId={rootApp.id} />
				</SettingSection>
			</div>
		</div>
	);
});
