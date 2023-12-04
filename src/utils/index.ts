import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as t from '@rekajs/types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const CREATE_BEZIER_TRANSITION = (
	opts: Partial<{ duration: number; delay: number }> = {
		duration: 0.4,
		delay: 0,
	}
) => ({
	ease: [0.19, 1, 0.22, 1],
	duration: opts.duration,
	delay: opts.delay,
});

export const getTemplateName = (template: t.Template) => {
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

export const insertAt = <T>(array: T[], item: T, index: number): T[] => {
	if (index < 0 || index > array.length) {
		throw new Error('Index out of bounds');
	}
	return [...array.slice(0, index), item, ...array.slice(index)];
};