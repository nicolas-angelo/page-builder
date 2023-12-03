'use client';
import { useState } from 'react';
import { useReka } from '@rekajs/react';
import { CodeEditor } from '@rekajs/react-code-editor';
import * as t from '@rekajs/types';

export const RekaEditor = () => {
	const { reka } = useReka();
	const [rekaJSON, setRekaJSON] = useState<t.State>();

	function updateRekaJSON() {
		const newReka = reka.toJSON();

		reka.load(newReka);
		setRekaJSON(newReka);
	}

	return (
		<div className="flex max-h-full flex-1 flex-col overflow-hidden bg-red-50">
			<div className="flex gap-2 border-b-2 bg-gray-100 px-3 py-2">
				<button
					className="rounded bg-blue-200 px-2 py-1 text-xs text-blue-600 disabled:opacity-25"
					onClick={updateRekaJSON}
				>
					Get JSON
				</button>
			</div>
			<pre className="overflow-scroll text-xs">
				{JSON.stringify(rekaJSON, null, 2)}
			</pre>
			{/* <CodeEditor className="h-full w-full overflow-auto text-sm" /> */}
		</div>
	);
};
