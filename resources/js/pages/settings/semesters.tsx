import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { fmtDate } from '@/lib/utils';
import { store as semestersStore } from '@/routes/semesters';
import type { Semester } from '@/types';

interface SemesterTypeOption {
    value: string;
    label: string;
}

interface SemestersProps {
    semesterTypes?: SemesterTypeOption[];
    semesters?: Semester[];
}

const defaultSemesterTypes: SemesterTypeOption[] = [
    { value: 'first', label: 'First Semester' },
    { value: 'second', label: 'Second Semester' },
    { value: 'summer', label: 'Summer' },
];

export default function Semesters({
    semesterTypes = defaultSemesterTypes,
    semesters = [],
}: SemestersProps) {
    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        academic_year: '',
        semester_type: '',
        start_date: '',
        end_date: '',
        is_current: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(semestersStore.url(), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="Semester settings" />

            <h1 className="sr-only">Semester settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Semester configuration"
                    description="Configure academic terms, semester dates, and active session status"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Semester Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. 1st Semester 2024-2025"
                            required
                            aria-invalid={!!errors.name}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="academic_year">Academic Year</Label>
                            <Input
                                id="academic_year"
                                value={data.academic_year}
                                onChange={(e) => setData('academic_year', e.target.value)}
                                placeholder="e.g. 2024-2025"
                                required
                                aria-invalid={!!errors.academic_year}
                            />
                            <InputError message={errors.academic_year} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="semester_type">Semester Type</Label>
                            <Select
                                value={data.semester_type}
                                onValueChange={(val) => setData('semester_type', val)}
                            >
                                <SelectTrigger id="semester_type" aria-invalid={!!errors.semester_type}>
                                    <SelectValue placeholder="Select semester type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesterTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.semester_type} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                required
                                aria-invalid={!!errors.start_date}
                            />
                            <InputError message={errors.start_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                required
                                aria-invalid={!!errors.end_date}
                            />
                            <InputError message={errors.end_date} />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_current"
                            checked={data.is_current}
                            onCheckedChange={(checked) => setData('is_current', !!checked)}
                        />
                        <Label htmlFor="is_current" className="text-sm font-normal cursor-pointer">
                            Set as current active semester
                        </Label>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing} className="min-w-32">
                            {processing ? (
                                <>
                                    <Spinner className="size-4 mr-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Semester'
                            )}
                        </Button>

                        {recentlySuccessful && (
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                Saved successfully.
                            </p>
                        )}
                    </div>
                </form>

                {semesters && semesters.length > 0 && (
                    <>
                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    Configured Semesters
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Overview of all academic semesters recorded in the system
                                </p>
                            </div>

                            <div className="rounded-lg border border-border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                            <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                                                Name
                                            </TableHead>
                                            <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                                                Year
                                            </TableHead>
                                            <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                                                Dates
                                            </TableHead>
                                            <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {semesters.map((sem) => (
                                            <TableRow key={sem.id} className="hover:bg-muted/30">
                                                <TableCell className="py-2.5 text-xs font-medium text-foreground">
                                                    {sem.name}
                                                </TableCell>
                                                <TableCell className="py-2.5 text-xs text-muted-foreground">
                                                    {sem.academic_year}
                                                </TableCell>
                                                <TableCell className="py-2.5 text-xs text-muted-foreground">
                                                    {fmtDate(sem.start_date)} – {fmtDate(sem.end_date)}
                                                </TableCell>
                                                <TableCell className="py-2.5">
                                                    {sem.is_current ? (
                                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 text-[11px]">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-[11px]">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

Semesters.layout = {
    breadcrumbs: [
        {
            title: 'Semester settings',
            href: '/settings/semesters',
        },
    ],
};
