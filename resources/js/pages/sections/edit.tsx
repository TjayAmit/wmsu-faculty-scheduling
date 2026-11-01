import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    GraduationCap,
    Layers,
    Save,
    Sparkles,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import {
    index as sections,
    show as sectionsShow,
    update as sectionsUpdate,
} from '@/routes/sections';
import type { SectionsFormProps } from '@/types';

const YEAR_LEVELS = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
    { value: '5', label: '5th Year' },
];

const CAPACITY_PRESETS = ['35', '40', '45', '50', '60'];

export default function Edit({
    section,
    programs = [],
    semesters = [],
    teachers = [],
}: SectionsFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        section_code: section?.section_code || '',
        program_id: section?.program_id?.toString() || '',
        semester_id: section?.semester_id?.toString() || '',
        year_level: section?.year_level?.toString() || '1',
        max_students: section?.max_students?.toString() || '50',
        current_students: section?.current_students?.toString() || '0',
        adviser_id: section?.adviser_id?.toString() || '',
        is_active: section?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (section) {
            put(sectionsUpdate.url(section.id));
        }
    };

    const selectedProgram = programs.find((p) => p.id.toString() === data.program_id);
    const selectedSemester = semesters.find((s) => s.id.toString() === data.semester_id);
    const selectedTeacher = teachers.find((t) => t.id.toString() === data.adviser_id);

    const max = parseInt(data.max_students, 10) || 50;
    const current = parseInt(data.current_students, 10) || 0;
    const fillPercent = Math.min(100, Math.round((current / (max || 1)) * 100));

    return (
        <>
            <Head title={`Edit Section ${section?.section_code}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Back Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <Link href={section ? sectionsShow(section.id) : sections()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to {section ? 'Section Details' : 'Sections'}
                        </Link>
                    </Button>
                </div>

                {/* Page Title */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Edit Section Specifications
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update student cohort enrollment caps, program association, and assigned faculty adviser for {section?.section_code}.
                    </p>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Form Column */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Section Cohort Specifications
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Section Code & Year Level */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                        <div className="sm:col-span-7 space-y-2">
                                            <Label htmlFor="section_code" className="text-xs font-semibold">
                                                Section Code <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="section_code"
                                                value={data.section_code}
                                                onChange={(e) => setData('section_code', e.target.value.toUpperCase())}
                                                placeholder="e.g., BEED-2A, BSIT-1A, BSED-ENG 3-B"
                                                required
                                                className="font-mono text-sm uppercase"
                                                maxLength={20}
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Official class identifier used across timetable scheduling.
                                            </p>
                                            <InputError message={errors.section_code} />
                                        </div>

                                        <div className="sm:col-span-5 space-y-2">
                                            <Label htmlFor="year_level" className="text-xs font-semibold">
                                                Year Level <span className="text-destructive">*</span>
                                            </Label>
                                            <div className="flex flex-col gap-1.5">
                                                <Select
                                                    value={data.year_level}
                                                    onValueChange={(val) => setData('year_level', val)}
                                                >
                                                    <SelectTrigger id="year_level" className="text-sm">
                                                        <SelectValue placeholder="Select year level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {YEAR_LEVELS.map((yr) => (
                                                            <SelectItem key={yr.value} value={yr.value}>
                                                                {yr.label} (Year {yr.value})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <div className="flex items-center gap-1">
                                                    {YEAR_LEVELS.map((yr) => (
                                                        <button
                                                            key={yr.value}
                                                            type="button"
                                                            onClick={() => setData('year_level', yr.value)}
                                                            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                                                data.year_level === yr.value
                                                                    ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                                                    : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                                                            }`}
                                                        >
                                                            Y{yr.value}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <InputError message={errors.year_level} />
                                        </div>
                                    </div>

                                    {/* Program & Semester */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="program_id" className="text-xs font-semibold">
                                                Degree Program <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.program_id}
                                                onValueChange={(val) => setData('program_id', val)}
                                            >
                                                <SelectTrigger id="program_id" className="text-sm">
                                                    <SelectValue placeholder="Select degree program" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {programs.map((program) => (
                                                        <SelectItem key={program.id} value={program.id.toString()}>
                                                            {program.code ? `${program.code} — ` : ''}{program.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[11px] text-muted-foreground">
                                                Curriculum track and degree program.
                                            </p>
                                            <InputError message={errors.program_id} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="semester_id" className="text-xs font-semibold">
                                                Academic Semester <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.semester_id}
                                                onValueChange={(val) => setData('semester_id', val)}
                                            >
                                                <SelectTrigger id="semester_id" className="text-sm">
                                                    <SelectValue placeholder="Select semester" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {semesters.map((sem) => (
                                                        <SelectItem key={sem.id} value={sem.id.toString()}>
                                                            {sem.name} ({sem.academic_year || sem.year || 'Current AY'})
                                                            {sem.is_current ? ' — Current' : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[11px] text-muted-foreground">
                                                Target academic year and semester term.
                                            </p>
                                            <InputError message={errors.semester_id} />
                                        </div>
                                    </div>

                                    {/* Capacity & Current Enrollment */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="max_students" className="text-xs font-semibold">
                                                    Maximum Student Capacity <span className="text-destructive">*</span>
                                                </Label>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Range: 1 – 200 seats
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="max_students"
                                                    type="number"
                                                    min="1"
                                                    max="200"
                                                    value={data.max_students}
                                                    onChange={(e) => setData('max_students', e.target.value)}
                                                    required
                                                    className="text-sm w-28"
                                                />
                                                <div className="flex flex-wrap items-center gap-1">
                                                    {CAPACITY_PRESETS.map((cap) => (
                                                        <button
                                                            key={cap}
                                                            type="button"
                                                            onClick={() => setData('max_students', cap)}
                                                            className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                                                                data.max_students === cap
                                                                    ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                                                    : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                                                            }`}
                                                        >
                                                            {cap}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <InputError message={errors.max_students} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="current_students" className="text-xs font-semibold">
                                                    Current Enrolled Students
                                                </Label>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Active headcount
                                                </span>
                                            </div>
                                            <Input
                                                id="current_students"
                                                type="number"
                                                min="0"
                                                max={data.max_students || 200}
                                                value={data.current_students}
                                                onChange={(e) => setData('current_students', e.target.value)}
                                                className="text-sm"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Enrolled students in this cohort.
                                            </p>
                                            <InputError message={errors.current_students} />
                                        </div>
                                    </div>

                                    {/* Section Adviser */}
                                    <div className="space-y-2">
                                        <Label htmlFor="adviser_id" className="text-xs font-semibold">
                                            Designated Section Adviser (Optional)
                                        </Label>
                                        <Select
                                            value={data.adviser_id || 'none'}
                                            onValueChange={(val) => setData('adviser_id', val === 'none' ? '' : val)}
                                        >
                                            <SelectTrigger id="adviser_id" className="text-sm">
                                                <SelectValue placeholder="Select faculty adviser" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none" className="text-muted-foreground italic">
                                                    None / To Be Appointed
                                                </SelectItem>
                                                {teachers.map((teacher) => (
                                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                        {teacher.first_name} {teacher.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[11px] text-muted-foreground">
                                            Faculty adviser guiding this section cohort.
                                        </p>
                                        <InputError message={errors.adviser_id} />
                                    </div>

                                    {/* Active Section Checkbox Banner */}
                                    <div className="rounded-lg border border-border bg-muted/20 p-3.5 flex items-start gap-3">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                            className="mt-0.5"
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active" className="text-xs font-semibold cursor-pointer">
                                                Active Section Cohort
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                Active sections appear in the Schedules module for timetable slot creation, faculty draft proposals, and classroom allocation.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-xs font-medium"
                                        >
                                            <Save className="mr-1.5 h-4 w-4" />
                                            {processing ? 'Saving Changes…' : 'Save Changes'}
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="text-xs">
                                            <Link href={section ? sectionsShow(section.id) : sections()}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar: Live Cohort Preview & Timetable Alignment */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                        {/* Live Section Card Preview */}
                        <Card className="shadow-sm border-dashed">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Live Cohort Preview
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <Badge
                                                variant="outline"
                                                className="font-mono text-xs font-semibold px-2 py-0.5 border-primary/20 bg-primary/5 text-primary"
                                            >
                                                {data.section_code.trim() || 'SEC-CODE'}
                                            </Badge>
                                            <Badge variant="secondary" className="text-[10px]">
                                                Year {data.year_level}
                                            </Badge>
                                        </div>
                                        {data.is_active ? (
                                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] h-5 px-1.5 gap-1 shadow-none">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1">
                                                <XCircle className="h-3 w-3" />
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-base text-foreground leading-snug">
                                            {selectedProgram
                                                ? `${selectedProgram.name} (${data.section_code.trim() || 'Section'})`
                                                : 'Degree Program Section'}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                            <span>
                                                {selectedSemester
                                                    ? `${selectedSemester.name} (${selectedSemester.academic_year || selectedSemester.year || ''})`
                                                    : 'Academic Semester Term'}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Assigned Adviser */}
                                    <div className="rounded-md border border-border/60 bg-muted/30 p-2.5 flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <UserCheck className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Class Adviser
                                            </p>
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {selectedTeacher
                                                    ? `${selectedTeacher.first_name} ${selectedTeacher.last_name}`
                                                    : 'To Be Appointed'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Enrollment Gauge */}
                                    <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                                        <div className="flex items-center justify-between text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5 text-primary" />
                                                <span>Capacity Allocation</span>
                                            </span>
                                            <span>
                                                <strong className="text-foreground">{current}</strong> / {max} students
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${fillPercent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
                                            <span>{max - current} seats remaining</span>
                                            <span>{fillPercent}% filled</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[11px] text-muted-foreground text-center">
                                    Real-time simulation of this cohort section card in schedule creation dropdowns and academic lists.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Scheduling Alignment Reference */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Timetable Integration
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3.5 space-y-3 text-xs text-muted-foreground leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Schedule Dropdown:</strong> This section code ({data.section_code || 'BEED-2A'}) is immediately available for selection in <Link href="/schedules/create" className="text-primary hover:underline font-medium">Create Schedule</Link>.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Classroom Sizing:</strong> Assign classrooms that have seating capacity equal to or greater than {data.max_students || 50} students.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Conflict Checking:</strong> The scheduling engine ensures no two classes for this section are scheduled at the same time period.
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Sections', href: sections() },
            { title: 'Edit Section', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
