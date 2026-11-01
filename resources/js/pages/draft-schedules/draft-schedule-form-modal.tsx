import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { store as draftSchedulesStore, update as draftSchedulesUpdate } from '@/routes/draft-schedules';
import type { DraftSchedule } from '@/types';

export interface DraftScheduleFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    draftSchedule?: DraftSchedule | null;
    teachers?: {
        id: number;
        full_name?: string;
        first_name?: string;
        last_name?: string;
        user?: {
            id: number;
            name: string;
        };
    }[];
    schedules?: {
        id: number;
        section?: string | null;
        subject?: {
            id: number;
            code: string;
            title: string;
        };
        semester?: {
            id: number;
            name: string;
            academic_year: string;
        };
    }[];
    isTeacherRole?: boolean;
    currentTeacher?: {
        id: number;
        name: string;
    } | null;
}

export function DraftScheduleFormModal({
    open,
    onOpenChange,
    draftSchedule,
    teachers = [],
    schedules = [],
    isTeacherRole = false,
    currentTeacher = null,
}: DraftScheduleFormModalProps) {
    const isEditing = Boolean(draftSchedule);

    const defaultTeacherId = isTeacherRole && currentTeacher?.id
        ? String(currentTeacher.id)
        : '';

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        teacher_id: defaultTeacherId,
        schedule_id: '',
        notes: '',
    });

    useEffect(() => {
        if (open) {
            clearErrors();
            if (draftSchedule) {
                setData({
                    teacher_id: draftSchedule.teacher_id ? String(draftSchedule.teacher_id) : defaultTeacherId,
                    schedule_id: draftSchedule.schedule_id ? String(draftSchedule.schedule_id) : '',
                    notes: draftSchedule.notes || '',
                });
            } else {
                setData({
                    teacher_id: defaultTeacherId,
                    schedule_id: '',
                    notes: '',
                });
            }
        }
    }, [open, draftSchedule, defaultTeacherId]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEditing && draftSchedule) {
            put(draftSchedulesUpdate(draftSchedule.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(draftSchedulesStore.url(), {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        clearErrors();
    };

    const modalTitle = isTeacherRole
        ? (isEditing ? 'Edit Schedule Request' : 'Request Schedule Assignment')
        : (isEditing ? 'Edit Schedule Assignment' : 'New Schedule Assignment');

    const modalDescription = isTeacherRole
        ? (isEditing ? 'Update your course schedule preference or notes.' : 'Select a course schedule slot to request teaching load for yourself.')
        : (isEditing ? 'Update the assigned faculty teacher or course schedule slot.' : 'Select a faculty teacher and class schedule slot to establish teaching coverage.');

    const submitLabel = isTeacherRole
        ? (isEditing ? 'Save Changes' : 'Submit Schedule Request')
        : (isEditing ? 'Save Changes' : 'Create Assignment');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="p-6 pb-4 border-b border-border/80">
                        <DialogTitle className="text-lg font-bold text-foreground">
                            {modalTitle}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            {modalDescription}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-4">
                        {/* 1. Teacher Selector for Admins (hidden for Teacher role) */}
                        {isTeacherRole ? (
                            <>
                                <input type="hidden" name="teacher_id" value={data.teacher_id} />
                                {errors.teacher_id && <InputError message={errors.teacher_id} />}
                            </>
                        ) : (
                            <div className="space-y-1.5">
                                <Label htmlFor="modal_teacher_id" className="text-xs font-semibold text-foreground">
                                    Teacher <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.teacher_id}
                                    onValueChange={(value) => setData('teacher_id', value)}
                                >
                                    <SelectTrigger id="modal_teacher_id" className="w-full text-xs h-9">
                                        <SelectValue placeholder="Select faculty teacher" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {teachers.map((t) => {
                                            const name =
                                                t.full_name ||
                                                t.user?.name ||
                                                `${t.first_name ?? ''} ${t.last_name ?? ''}`.trim() ||
                                                `Teacher #${t.id}`;
                                            return (
                                                <SelectItem key={t.id} value={String(t.id)} className="text-xs">
                                                    {name}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.teacher_id} />
                            </div>
                        )}

                        {/* 2. Schedule Selector */}
                        <div className="space-y-1.5">
                            <Label htmlFor="modal_schedule_id" className="text-xs font-semibold text-foreground">
                                Course Schedule <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.schedule_id}
                                onValueChange={(value) => setData('schedule_id', value)}
                            >
                                <SelectTrigger id="modal_schedule_id" className="w-full text-xs h-9">
                                    <SelectValue placeholder="Select course schedule slot" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                    {schedules.map((s) => {
                                        const code = s.subject?.code ?? 'N/A';
                                        const title = s.subject?.title ?? 'No title';
                                        const sem = s.semester?.name ?? '';
                                        const sec = s.section ? ` • Sec ${s.section}` : '';
                                        const label = `${code} - ${title}${sem ? ` (${sem}${sec})` : sec ? ` (${sec})` : ''}`;

                                        return (
                                            <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                                                {label}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.schedule_id} />
                        </div>

                        {/* 3. Notes */}
                        <div className="space-y-1.5">
                            <Label htmlFor="modal_notes" className="text-xs font-semibold text-foreground">
                                Notes <span className="text-[11px] text-muted-foreground font-normal">(Optional)</span>
                            </Label>
                            <Textarea
                                id="modal_notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Additional notes, semester directives, or coverage remarks..."
                                rows={3}
                                className="text-xs resize-none"
                            />
                            <InputError message={errors.notes} />
                        </div>
                    </div>

                    <DialogFooter className="p-4 sm:p-6 sm:pt-4 border-t border-border/80 bg-muted/20 gap-2 flex-row justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClose}
                            disabled={processing}
                            className="text-xs h-8"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing}
                            className="text-xs h-8 gap-1.5"
                        >
                            {processing && <Loader2 className="size-3.5 animate-spin" />}
                            <span>{submitLabel}</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
