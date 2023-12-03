'use client';
import { useMemo } from 'react';
import { useParams, useSelectedLayoutSegments } from 'next/navigation';
import DashboardTwoToneIcon from '@mui/icons-material/DashboardTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import ExtensionTwoToneIcon from '@mui/icons-material/ExtensionTwoTone';
import DesignServicesTwoToneIcon from '@mui/icons-material/DesignServicesTwoTone';

const getBaseNavItems = (segments: string[]) => [
	{
		name: 'Dashboard',
		href: '/',
		icon: DashboardTwoToneIcon,
		isActive: segments.length === 0,
	},
	{
		name: 'Designer',
		href: '/designer',
		icon: DesignServicesTwoToneIcon,
		isActive: segments[0] === 'designer',
	},
	{
		name: 'Components',
		href: '/components',
		icon: ExtensionTwoToneIcon,
		isActive: segments[0] === 'components',
	},
	{
		name: 'Datasets',
		href: '/datasets',
		icon: DescriptionTwoToneIcon,
		isActive: segments[0] === 'datasets',
	},
	{
		name: 'Settings',
		href: '/settings',
		icon: SettingsTwoToneIcon,
		isActive: segments[0] === 'settings',
	},
];

export default function useNavItems({ agentId }: { agentId?: string } = {}) {
	const segments = useSelectedLayoutSegments();
	const { id } = useParams() as { id?: string };

	const formattedSegments = segments.filter(
		segment => !segment.startsWith('(')
	);

	const tabs = useMemo(() => {
		return getBaseNavItems(formattedSegments);
	}, [segments, id, agentId]);

	return tabs;
}
