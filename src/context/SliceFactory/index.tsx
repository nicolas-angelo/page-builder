'use client';
import React, { createContext, useReducer } from 'react';
import { bindActionCreators } from '@reduxjs/toolkit';
import type { Slice, CaseReducerActions, Dispatch } from '@reduxjs/toolkit';

type SliceState<S> = S extends Slice ? ReturnType<S['getInitialState']> : never;
type SliceName<S> = S extends Slice ? S['name'] : never;
type SliceReducers<S> = S extends Slice ? S['caseReducers'] : never;

type ProviderProps<S extends Slice> = {
	initialState?: Partial<SliceState<S>>;
	children: React.ReactNode;
};

interface SliceCtx<S extends Slice> {
	state: SliceState<S>;
	actions: CaseReducerActions<SliceReducers<S>, SliceName<S>>;
}

type FactoryReturn<S extends Slice> = [
	React.FC<ProviderProps<S>>,
	React.Context<SliceCtx<S>>,
];

export default function createSliceContext<S extends Slice>(
	slice: S
): FactoryReturn<S> {
	const SliceContext = createContext<SliceCtx<S>>({
		state: slice.getInitialState(),
		actions: {} as CaseReducerActions<SliceReducers<S>, SliceName<S>>,
	});

	const initializer = (payload?: Partial<SliceState<S>>) =>
		payload
			? { ...slice.getInitialState(), ...payload }
			: slice.getInitialState();

	function SliceProvider({ initialState, children }: ProviderProps<S>) {
		const initial = initializer(initialState);
		const [state, dispatch] = useReducer(slice.reducer, initial);

		const actions = React.useMemo(
			() => bindActionCreators(slice.actions, dispatch as Dispatch),
			[dispatch]
		) as CaseReducerActions<SliceReducers<S>, SliceName<S>>;

		return (
			<SliceContext.Provider value={{ state, actions }}>
				{children}
			</SliceContext.Provider>
		);
	}

	return [SliceProvider, SliceContext];
}
