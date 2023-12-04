'use client';
import * as React from 'react';
import { useReka, observer } from '@rekajs/react';
import * as t from '@rekajs/types';
import { IconButton } from '@/components/ui/icon-button';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { cn } from '@/utils';
import { toJS } from '@rekajs/core';

type TemplateLayersProps = {
	componentId: string;
};

type RenderTemplateNodeProps = {
	templateId: string;
	depth?: number;
	templateNode: any;
};

const getTemplateName = (template: t.Template) => {
	if (template instanceof t.TagTemplate) {
		return template.tag;
	}

	if (template instanceof t.ComponentTemplate) {
		return template.component.name;
	}

	if (template instanceof t.SlotTemplate) {
		return `<slot />`;
	}

	throw new Error();
};

const RenderTemplateNode = observer((props: RenderTemplateNodeProps) => {
	const { reka } = useReka();
	const depth = props.depth ?? 0;
	const template = reka.getNodeFromId(props.templateId, t.Template);

	// console.log({ children: templateObj.children, id: props.templateId });

	if (!props.templateNode) {
		return null;
	}

	return (
		<div>
			<div
				className={cn(
					'template-layer-name my-1 cursor-pointer rounded-md px-4 py-0.5'
				)}
			>
				<div
					className="flex items-center"
					style={{ marginLeft: `${depth * 10}px` }}
				>
					<div className="flex flex-1 items-center gap-2">
						{/* <span className="text-xs">{getTemplateName(template)}</span> */}
						<span className="text-xs">{template.id}</span>
					</div>
					<div>
						{getTemplateName(template) !== 'root' && (
							<IconButton
								className="cursor-pointer hover:text-rose-500"
								onClick={e => {
									e.stopPropagation();
									reka.change(() => {
										const parent = reka.getParent(template);

										if (!parent) {
											return;
										}

										const parentNode = parent.node;

										if (!(parentNode instanceof t.SlottableTemplate)) {
											return;
										}

										reka.change(() => {
											parentNode.children.splice(
												parentNode.children.indexOf(template),
												1
											);
										});
									});
								}}
							>
								<DeleteTwoToneIcon fontSize="inherit" />
							</IconButton>
						)}
					</div>
				</div>
			</div>
			{props.templateNode.children.map(child => {
				return (
					<RenderTemplateNode
						key={child.id}
						templateId={child.id}
						depth={depth + 1}
						templateNode={child}
					/>
				);
			})}
			{/* {'child'}
			{templateObj.children.length} */}
		</div>
	);
});

export const TemplateLayers = (props: TemplateLayersProps) => {
	const { reka } = useReka();

	const component = reka.getNodeFromId(props.componentId, t.RekaComponent);

	if (!component) {
		return null;
	}

	return (
		<div className="mt-3">
			{component.template && (
				<RenderTemplateNode
					templateId={component.template.id}
					templateNode={component.template}
				/>
			)}
		</div>
	);
};

export default TemplateLayers;
