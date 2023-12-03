import RekaProvider from '@/context/RekaProvider';
import RekaShell from '@/components/designer/layout/reka-shell';
import RekaTree from '@/components/designer/layout/reka-tree/index';
import { RekaPreview } from '@/components/designer/layout/reka-renderer/preview-ui';
import { ActiveItemPanel } from '@/components/designer/layout/active-item-panel';

function Page() {
	return (
		<RekaProvider>
			<RekaShell>
				<RekaTree gridArea="components" />
				<RekaPreview gridArea="preview" />
				<ActiveItemPanel gridArea="props" />
			</RekaShell>
		</RekaProvider>
	);
}

export default Page;
