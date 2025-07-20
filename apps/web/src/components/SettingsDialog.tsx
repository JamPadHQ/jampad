import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useCanvasStore } from '@/lib/store';
import { getColorForNickname } from '@/lib/colors';

const formSchema = z.object({
	nickname: z.string().min(2, {
		message: "Nickname must be at least 2 characters.",
	}),
})

type SettingsDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
}

function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
	const { settings, setSettings } = useCanvasStore();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			nickname: settings.user.nickname,
		},
	})

	function onSubmit(values: z.infer<typeof formSchema>) {
		setSettings({
			user: {
				nickname: values.nickname,
				color: getColorForNickname(values.nickname),
			},
		})
		toast.success("Settings saved")
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
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
										<Input placeholder="Enter your nickname" {...field} />
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
			</DialogContent>
		</Dialog>
	);
}

export default SettingsDialog;