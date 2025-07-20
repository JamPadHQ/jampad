import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';
import { UsersIcon } from 'lucide-react';
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
				{members.length === 0 ? (
					<DropdownMenuItem disabled>
						<span className='text-muted-foreground'>No members online</span>
					</DropdownMenuItem>
				) : (
					members.map((member) => (
						<DropdownMenuItem key={member.nickname} className='flex items-center gap-2'>
							<div
								className='w-3 h-3 rounded-full'
								style={{ backgroundColor: member.color }}
							/>
							<span>{member.nickname}</span>
							{user.nickname === member.nickname && (
								<span className='text-xs text-muted-foreground ml-auto'>You</span>
							)}
						</DropdownMenuItem>
					))
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default MembersList;