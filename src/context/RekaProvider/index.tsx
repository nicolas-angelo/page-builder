'use client';
import React, { useRef, useReducer } from 'react';
import { Reka } from '@rekajs/core';
import { RekaProvider as RekaJSProvider } from '@rekajs/react';
import * as t from '@rekajs/types';

import { bindActionCreators } from '@reduxjs/toolkit';
import type { Dispatch } from '@reduxjs/toolkit';
import {
	slice,
	RekaState,
	UpdateTreePayload,
} from '@/context/RekaProvider/reducer';

export enum EditorMode {
	Preview = 'preview',
	UI = 'ui',
	Code = 'code',
}

type ProviderProps = { rekaApp?: string; children: React.ReactNode };
type DispatchCallback<S> = (state: S) => void;
type CustomDispatchWithCallback<A, S> = (
	action: A,
	callback?: DispatchCallback<S>
) => void;

type DemoProps = { name: string };
const Demo = ({ name }: DemoProps) => {
	return <div className="bg-indigo-400 p-3">hello {name}</div>;
};

interface RekaCtx {
	editorState: ReturnType<(typeof slice)['getInitialState']>;
	actions: typeof slice.actions;
	editorMode: EditorMode;
	setEditorMode: (mode: EditorMode) => void;
	updateTreeWithCallback: CustomDispatchWithCallback<
		UpdateTreePayload,
		RekaState
	>;
}

const RekaContext = React.createContext<RekaCtx>({
	editorState: slice.getInitialState(),
	actions: slice.actions,
	editorMode: EditorMode.UI,
	setEditorMode: () => {},
	updateTreeWithCallback: () => {},
});

export const useRekaEditor = () => React.useContext(RekaContext);

const initializer = (payload?: Partial<RekaState>) =>
	payload
		? { ...slice.getInitialState(), ...payload }
		: slice.getInitialState();

export default function RekaProvider({
	rekaApp = '',
	children,
}: ProviderProps) {
	const rekaRef = useRef<Reka>();
	const [mode, setMode] = React.useState<EditorMode>(EditorMode.UI);

	const callbackRef = React.useRef<DispatchCallback<RekaState>>();
	const initial = initializer(slice.getInitialState());
	const [state, dispatch] = useReducer(slice.reducer, initial);

	if (!rekaRef.current) {
		const reka = Reka.create({
			externals: {
				components: [
					t.externalComponent({
						name: 'Demo',
						meta: {
							canHaveChildren: false,
						},
						props: [
							t.componentProp({
								name: 'name',
								kind: t.primitiveKind({ primitive: 'string' }),
							}),
						],
						render: (props: DemoProps) => <Demo {...props} />,
					}),
				],
				functions: self => {
					return [
						t.externalFunc({
							name: 'getPosts',
							func: () => {
								return self.getExternalState('posts');
							},
						}),
					];
				},
			},
		});
		reka.load(
			t.state({
				extensions: {},
				program: t.program({
					globals: [],
					components: [
						t.rekaComponent({
							name: 'App',
							props: [],
							state: [],
							template: t.tagTemplate({
								tag: 'root',
								props: {
									className: t.literal({ value: 'h-full bg-white' }),
								},
								children: [],
							}),
						}),
					],
				}),
			})
		);
		// Parser.parseProgram(rekaApp);
		// 		this.reka.load(
		// 			t.unflatten(getCollaborativeYjsRekaState().toJSON() as any),
		// 			false
		// );

		reka.createFrame({
			id: 'main-app',
			evaluateImmediately: true,
			component: {
				name: 'App',
			},
		});
		rekaRef.current = reka;
	}

	const actions = React.useMemo(
		() => bindActionCreators(slice.actions, dispatch as Dispatch),
		[dispatch]
	);

	const updateTreeWithCallback: CustomDispatchWithCallback<
		UpdateTreePayload,
		RekaState
	> = (action, callback) => {
		callbackRef.current = callback;
		actions.updateTree(action);
	};

	React.useEffect(() => {
		callbackRef.current?.(state);
	}, [state.outlineItems]);

	React.useEffect(() => {
		return () => rekaRef.current?.dispose();
	}, []);

	return (
		<RekaContext.Provider
			value={{
				editorState: state,
				actions,
				editorMode: mode,
				setEditorMode: setMode,
				updateTreeWithCallback,
			}}
		>
			<RekaJSProvider key={rekaRef.current.id} reka={rekaRef.current}>
				{children}
			</RekaJSProvider>
		</RekaContext.Provider>
	);
}

export const withReka =
	(Component: React.FC<any>, rekaApp = '') =>
	(props: any) => (
		<RekaProvider rekaApp={rekaApp}>
			<Component {...props} />
		</RekaProvider>
	);
