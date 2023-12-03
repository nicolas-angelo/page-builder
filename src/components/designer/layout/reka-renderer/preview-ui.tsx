'use client';
import { useState } from 'react';
import { Frame } from '@rekajs/core';
import { observer, useReka } from '@rekajs/react';
import { RenderFrame } from './client-renderer';

type Props = { gridArea?: string };

export const RekaPreview = observer(({ gridArea = 'preview' }: Props) => {
	const { reka } = useReka();

	const [selectedFrame, _setSelectedFrame] = useState<Frame>(reka.frames[0]);

	return (
		<div
			style={{ gridArea }}
			className="flex flex-col justify-start bg-zinc-200"
		>
			<div className="h-[50.4px] bg-white">sub header</div>
			<div className="grow overflow-hidden">
				<div className="flex h-full w-full flex-col overflow-hidden text-xs">
					<div className="m-3 flex-1 overflow-hidden rounded-lg bg-white shadow-lg">
						{selectedFrame ? (
							<RenderFrame frame={selectedFrame} />
						) : (
							<div className="px-3 py-4">No frame selected</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});
