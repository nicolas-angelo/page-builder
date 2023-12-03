import { createElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Reka } from '@rekajs/core';
import { Parser } from '@rekajs/parser';
import * as t from '@rekajs/types';
import { addItem } from '@/lib/actions';

const formActions = {
	addItem,
};

type ActionName = keyof typeof formActions;

export const Renderer = ({ view }: { view?: t.View }) => {
	if (view instanceof t.TagView) {
		if (view.tag === 'text') {
			return <span>{view.props.value}</span>;
		}
		if (view.tag === 'input') {
			return <input {...view.props} />;
		}
		if (view.tag === 'a') {
			return <Link href={view.props.route} />;
		}
		if (view.tag === 'img') {
			return (
				<Image
					width={100}
					height={100}
					src={view.props.src}
					alt={view.props.alt}
					{...view.props}
				/>
			);
		}
		if (view.tag === 'form' && view.props.actionname) {
			let actionName = view.props['actionname'] as ActionName;
			let action = formActions[actionName];
			return (
				<form {...view.props} action={action}>
					{view.children.map(child => (
						<Renderer key={child.id} view={child} />
					))}
				</form>
			);
		}
		return createElement(
			view.tag,
			view.props,
			view.children.map(child => <Renderer key={child.id} view={child} />)
		);
	}
	if (view instanceof t.RekaComponentView) {
		return view.render.map(r => <Renderer key={r.id} view={r} />);
	}
	if (view instanceof t.ExternalComponentView) {
		return view.component.render(view.props);
	}
	if (view instanceof t.SlotView) {
		return view.children.map(r => <Renderer key={r.id} view={r} />);
	}
	if (view instanceof t.ErrorSystemView) {
		return (
			<div className="">
				Something went wrong. <br />
				{view.error}
			</div>
		);
	}
	return null;
};

export default async function RekaRSCRenderer({
	rekaApp,
}: {
	rekaApp: string;
}) {
	const reka = Reka.create();

	reka.load(
		t.state({
			extensions: {},
			program: t.program(Parser.parseProgram(rekaApp)),
		})
	);

	const frame = await reka.createFrame({
		id: 'my-app-component',
		component: {
			name: 'App',
			props: {},
		},
	});

	return <Renderer view={frame.view} />;
}
