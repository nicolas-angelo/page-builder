'use client';
import * as React from 'react';
import { ChevronRightIcon, PlusIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { IconButton } from '@/components/ui/icon-button';
import { cn, CREATE_BEZIER_TRANSITION } from '@/utils';
// import { Info } from '../info';

type SettingSectionProps = {
	title: string;
	info?: string;
	onAdd?: () => void;
	children?: React.ReactNode;
	collapsedOnInitial?: boolean;
	className?: string;
};

const SettingSection = (props: SettingSectionProps) => {
	const [isOpen, setIsOpen] = React.useState(
		props.collapsedOnInitial !== undefined ? !props.collapsedOnInitial : false
	);

	return (
		<div
			className={cn(
				'border-outline setting-section flex flex-col border-b border-solid px-5 py-1.5 last:border-none',
				props.className
			)}
		>
			<motion.div
				className="relative mb-1 mt-2 flex cursor-pointer items-center"
				initial={false}
				animate={{ paddingBottom: isOpen ? '10px' : 0 }}
				onClick={() => setIsOpen(!isOpen)}
			>
				<header className="flex flex-1 items-center">
					<span className="flex items-center text-sm font-medium text-slate-800">
						{props.title}
						{/* {props.info && <Info info={props.info} />} */}
					</span>

					<IconButton className="ml-1">
						<ChevronRightIcon
							className={cn('ease-bezier duration-400 transition', {
								'rotate-[90deg]': isOpen,
							})}
						/>
					</IconButton>
				</header>

				{props.onAdd && (
					<IconButton
						onClick={e => {
							if (!props.onAdd) {
								return;
							}

							setIsOpen(true);
							e.stopPropagation();

							props.onAdd();
						}}
					>
						<PlusIcon />
					</IconButton>
				)}
			</motion.div>
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.section
						className="-mx-4"
						key="content"
						initial="collapsed"
						animate="open"
						exit="collapsed"
						variants={{
							open: { opacity: 1, height: 'auto', overflow: 'unset' },
							collapsed: {
								opacity: 0,
								height: 0,
								paddingBottom: 0,
								overflow: 'hidden',
							},
						}}
						transition={CREATE_BEZIER_TRANSITION()}
					>
						<div className="h-full px-4 py-2 pb-4">{props.children}</div>
					</motion.section>
				)}
			</AnimatePresence>
		</div>
	);
};

export default SettingSection;
