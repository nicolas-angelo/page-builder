'use client';
import { useState } from 'react';
import { observer, useReka } from '@rekajs/react';
import * as t from '@rekajs/types';
import SettingSection from '@/components/common/settings-sections';
import { PairInput } from '@/components/common/input-pair';

export const GlobalSettings = observer(() => {
	const { reka } = useReka();
	const [isAddingNewGlobal, setIsAddingNewGlobal] = useState(false);
	return (
		<SettingSection
			collapsedOnInitial={true}
			title="Global State"
			info="Variables defined here can be referenced anywhere in the editor that accepts expressions"
			onAdd={() => setIsAddingNewGlobal(true)}
		>
			<PairInput
				addingNewField={isAddingNewGlobal}
				onCancelAdding={() => setIsAddingNewGlobal(false)}
				idPlaceholder="Name"
				valuePlaceholder="Initial state value"
				onChange={(id, value) => {
					if (!id) {
						return;
					}

					const existingGlobalStateName = reka.state.program.globals.find(
						global => global.name === id
					);

					reka.change(() => {
						if (!existingGlobalStateName) {
							reka.state.program.globals.push(
								t.val({
									name: id,
									init: value,
								})
							);

							return;
						}

						existingGlobalStateName.init = value;
					});
				}}
				values={reka.state.program.globals.map(global => ({
					id: global.name,
					value: global.init,
				}))}
			/>
		</SettingSection>
	);
});
