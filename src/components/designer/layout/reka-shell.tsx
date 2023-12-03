'use client';
import { useRekaEditor, EditorMode } from '@/context/RekaProvider';

const gridAreasMap = {
	[EditorMode.Preview]: {
		gridTemplateAreas: `'header' 'preview'`,
		gridTemplateColumns: '1fr',
	},
	[EditorMode.UI]: {
		gridTemplateAreas: `'header header header' 'components props preview'`,
		gridTemplateColumns: '250px 300px 1fr',
	},
	[EditorMode.Code]: {
		gridTemplateAreas: `'header header header' 'components props preview'`,
		gridTemplateColumns: '200px 500px auto',
	},
};

export default function RekaShell({ children }: { children: React.ReactNode }) {
	const { editorMode, setEditorMode } = useRekaEditor();

	return (
		<div
			className="h-screen w-screen overflow-hidden transition-all duration-200 ease-in-out"
			style={{
				display: 'grid',
				gridTemplateRows: '55px auto',
				...gridAreasMap[editorMode],
			}}
		>
			<div style={{ gridArea: 'header' }} className="flex bg-indigo-500 p-2">
				<button
					className="rounded bg-indigo-400 px-3 py-1 text-xs text-white"
					onClick={() =>
						setEditorMode(
							editorMode === EditorMode.UI ? EditorMode.Code : EditorMode.UI
						)
					}
				>
					{EditorMode.UI ? 'Code Editor' : 'Designer'}
				</button>
			</div>
			{children}
		</div>
	);
}
