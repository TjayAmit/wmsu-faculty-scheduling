import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    itemName?: string;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    title = 'Delete',
    itemName,
    onConfirm,
    isLoading = false,
}: ConfirmDeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[440px] gap-0 overflow-hidden p-0">
                <div className="flex items-start gap-4 p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="pt-0.5">
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                {itemName ? (
                                    <>
                                        Are you sure you want to delete{' '}
                                        <span className="font-medium text-foreground">{itemName}</span>?{' '}
                                        This action cannot be undone.
                                    </>
                                ) : (
                                    'Are you sure? This action cannot be undone.'
                                )}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>
                <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isLoading}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isLoading ? 'Deleting…' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
