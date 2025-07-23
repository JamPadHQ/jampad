import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useCanvasStore } from '@/lib/store';
import { memo, useCallback, useMemo } from 'react';

const formSchema = z.object({
	nickname: z.string().min(2, {
		message: "Nickname must be at least 2 characters.",
	}),
})

type SettingsDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
}

// Memoized form component to prevent unnecessary re-renders
const SettingsForm = memo(({ user, setNickname, onOpenChange }: {
	user: any;
	setNickname: (nickname: string) => Promise<void>;
	onOpenChange: (open: boolean) => void;
}) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: useMemo(() => ({
			nickname: user.nickname,
		}), [user.nickname]),
		mode: 'onBlur', // Only validate on blur to improve typing performance
	})

	const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
		await setNickname(values.nickname)
		toast.success("Settings saved")
		onOpenChange(false)
	}, [setNickname, onOpenChange])

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Configure the canvas and other settings.
					</DialogDescription>
				</DialogHeader>

				<FormField
					control={form.control}
					name="nickname"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nickname</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your nickname"
									{...field}
									// Add performance optimizations
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="off"
									spellCheck={false}
								/>
							</FormControl>
							<FormDescription>
								Your nickname is used to identify you in the room.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<DialogFooter>
					<Button type="submit">Save</Button>
				</DialogFooter>
			</form>
		</Form>
	)
})

function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
	// Selective store subscription to prevent unnecessary re-renders
	const user = useCanvasStore((state) => state.user);
	const setNickname = useCanvasStore((state) => state.setNickname);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<SettingsForm
					user={user}
					setNickname={setNickname}
					onOpenChange={onOpenChange}
				/>
			</DialogContent>
		</Dialog>
	);
}

export default SettingsDialog;