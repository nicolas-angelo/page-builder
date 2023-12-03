'use client';
import { useEffect } from 'react';
import { useRekaEditor, EditorMode } from '@/context/RekaProvider';

type Props = { gridArea: string };

export function ActiveItemPanel({ gridArea = 'props' }: Props) {
	const { editorMode, editorState, actions } = useRekaEditor();
	const { activeComponent, rootTemplateId, hydrated } = editorState;

	useEffect(() => {
		// if there is no active component, and the editor is hydrated
		// set the active component to the root template node
		if (!activeComponent && hydrated && rootTemplateId) {
			actions.setActiveComponent(rootTemplateId);
		}
	}, [activeComponent, hydrated, rootTemplateId]);

	return (
		<div
			style={{ gridArea }}
			className="flex h-full flex-1 flex-col overflow-hidden border-l border-gray-300"
		>
			{/* toggle code editor or props editor UI */}
			{editorMode === EditorMode.Code && <div>Code Editor</div>}
			{editorMode === EditorMode.UI && (
				<div className="flex flex-col space-y-2 p-2">
					{activeComponent && (
						<>
							<span>Name: {activeComponent.name}</span>
							<span>Items: {activeComponent.children?.length}</span>
							<pre className="text-xs">
								{JSON.stringify(activeComponent, null, 2)}
							</pre>
						</>
					)}
				</div>
			)}
		</div>
	);
}
