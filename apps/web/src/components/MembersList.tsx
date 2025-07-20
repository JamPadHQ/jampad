import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';
import { UserIcon, UsersIcon } from 'lucide-react';
import { useCanvasStore } from '@/lib/store';

function MembersList() {
	const user = useCanvasStore((state) => state.user)
	const members = useCanvasStore((state) => state.members)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='outline' className='relative'>
					<UsersIcon className='w-4 h-4' />
					<span className='text-xs'>{members.length}</span>
					<span className='sr-only'>Members</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent sideOffset={10} side='right' align='start' className='w-52'>
				<DropdownMenuLabel>Members</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{members.map((member) => (
					<DropdownMenuItem key={member.nickname}>
						<UserIcon className='w-4 h-4' />
						{member.nickname}

						{user.nickname === member.nickname && <span className='text-xs text-gray-500 ml-auto'>You</span>}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default MembersList;