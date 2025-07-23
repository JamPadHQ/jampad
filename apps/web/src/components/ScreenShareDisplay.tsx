import React, { useRef, useEffect, useState } from 'react';
import { ScreenShare } from '@/lib/types';
import { streamManager } from '@/lib/streamManager';

interface ScreenShareDisplayProps {
	screenShare: ScreenShare;
}

const ScreenShareDisplay: React.FC<ScreenShareDisplayProps> = ({ screenShare }) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);

	useEffect(() => {
		const unsubscribe = streamManager.subscribe(screenShare.streamId, (mediaStream) => {
			setStream(mediaStream);
		});
		return unsubscribe;
	}, [screenShare.streamId]);

	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
		}
	}, [stream]);

	return (
		<foreignObject
			x={screenShare.position.x}
			y={screenShare.position.y}
			width={screenShare.width}
			height={screenShare.height}
			style={{
				border: '2px solid #ccc',
				borderRadius: '8px',
				overflow: 'hidden'
			}}
		>
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'contain'
				}}
			/>
		</foreignObject>
	);
};

export default ScreenShareDisplay; 