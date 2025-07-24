import { useCanvasStore } from '@/lib/store';
import { CanvasState, Member } from '@/lib/types';
import { MousePointer2 } from 'lucide-react';

const MemberCursor = ({ member, canvasState }: { member: Member, canvasState: CanvasState }) => {
	if (!member.cursor) {
		return null;
	}

	const scale = 1 / canvasState.zoom;

	return (
		<div
			className="absolute"
			style={{
				left: `${member.cursor.x}px`,
				top: `${member.cursor.y}px`,
				transition: 'left 0.1s, top 0.1s',
				zIndex: 9999,
				pointerEvents: 'none',
				transform: `scale(${scale})`,
				transformOrigin: 'top left'
			}}
		>
			<MousePointer2
				className="-translate-x-1 -translate-y-1"
				style={{
					fill: member.color,
					color: member.color
				}}
			/>
			<div
				className="absolute whitespace-nowrap rounded-md px-2 py-1 text-sm"
				style={{
					left: '20px',
					top: '15px',
					backgroundColor: member.color,
					color: 'white'
				}}
			>
				{member.nickname}
			</div>
		</div>
	);
};

export const MemberCursors = ({ canvasState }: { canvasState: CanvasState }) => {
	const { members, user } = useCanvasStore();

	const otherMembers = members.filter((member) => member.sessionId !== user.sessionId);

	return (
		<>
			{otherMembers.map((member) => (
				<MemberCursor key={member.sessionId} member={member} canvasState={canvasState} />
			))}
		</>
	);
};
