import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    GraduationCap,
    Layers,
    Plus,
    Sparkles,
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as programs, store as programsStore } from '@/routes/programs';
import type { DegreeLevel, DepartmentOption } from '@/types';

interface CreateProps {
    departments?: DepartmentOption[];
    degreeLevels?: (DegreeLevel | string)[];
}

const DEGREE_LEVEL_LABELS: Record<string, string> = {
    bachelor: "Bachelor's Degree",
    master: "Master's Degree",
    doctoral: "Doctoral Degree",
    certificate: "Certificate Program",
};

const DURATION_PRESETS = ['2', '3', '4', '5'];
const UNITS_PRESETS = ['72', '120', '140', '156', '168'];

export default function Create({ departments = [], degreeLevels = [] }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        degree_level: 'bachelor',
        department_id: '',
        description: '',
        duration_years: '4',
        total_units: '120',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(programsStore.url());
    };

    const getDegreeLevelValue = (level: DegreeLevel | string): string => {
        return typeof level === 'string' ? level : level.value;
    };

    const getDegreeLevelLabel = (level: DegreeLevel | string): string => {
        const val = getDegreeLevelValue(level);
        return (
            DEGREE_LEVEL_LABELS[val] ||
            (typeof level === 'object' && 'label' in level ? level.label : val)
        );
    };

    const selectedDepartment = departments.find(
        (d) => d.id.toString() === data.department_id
    );

    return (
        <>
            <Head title="Create Program" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Back Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <Link href={programs()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Programs
                        </Link>
                    </Button>
                </div>

                {/* Page Title */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Register Degree Program
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Configure collegiate degree curricula, major disciplines, departmental affiliation, and required academic units.
                    </p>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Form Column */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Program Curriculum Specifications
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Program Code & Program Name */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                        <div className="sm:col-span-4 space-y-2">
                                            <Label htmlFor="code" className="text-xs font-semibold">
                                                Program Code <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                placeholder="e.g., BSCS, BEED, BSIT"
                                                required
                                                className="font-mono text-sm uppercase"
                                                maxLength={20}
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Unique degree abbreviation.
                                            </p>
                                            <InputError message={errors.code} />
                                        </div>

                                        <div className="sm:col-span-8 space-y-2">
                                            <Label htmlFor="name" className="text-xs font-semibold">
                                                Program Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Bachelor of Science in Computer Science"
                                                required
                                                className="text-sm"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Full official title of the degree qualification.
                                            </p>
                                            <InputError message={errors.name} />
                                        </div>
                                    </div>

                                    {/* Department & Degree Level */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="department_id" className="text-xs font-semibold">
                                                Collegiate Department <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.department_id}
                                                onValueChange={(val) => setData('department_id', val)}
                                            >
                                                <SelectTrigger id="department_id" className="text-sm">
                                                    <SelectValue placeholder="Select supervising department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                                            {dept.code} — {dept.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[11px] text-muted-foreground">
                                                Academic department administering this program.
                                            </p>
                                            <InputError message={errors.department_id} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="degree_level" className="text-xs font-semibold">
                                                Degree Classification <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.degree_level}
                                                onValueChange={(val) => setData('degree_level', val)}
                                            >
                                                <SelectTrigger id="degree_level" className="text-sm">
                                                    <SelectValue placeholder="Select degree level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {degreeLevels.map((level) => {
                                                        const val = getDegreeLevelValue(level);
                                                        return (
                                                            <SelectItem key={val} value={val}>
                                                                {getDegreeLevelLabel(level)}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[11px] text-muted-foreground">
                                                Undergraduate, master's, doctoral, or certificate tier.
                                            </p>
                                            <InputError message={errors.degree_level} />
                                        </div>
                                    </div>

                                    {/* Duration & Total Units with Presets */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="duration_years" className="text-xs font-semibold">
                                                    Duration (Years) <span className="text-destructive">*</span>
                                                </Label>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Standard: 4 Years
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="duration_years"
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    step="0.5"
                                                    value={data.duration_years}
                                                    onChange={(e) => setData('duration_years', e.target.value)}
                                                    required
                                                    className="text-sm w-28"
                                                />
                                                <div className="flex items-center gap-1">
                                                    {DURATION_PRESETS.map((yr) => (
                                                        <button
                                                            key={yr}
                                                            type="button"
                                                            onClick={() => setData('duration_years', yr)}
                                                            className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                                                                data.duration_years === yr
                                                                    ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                                                    : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                                                            }`}
                                                        >
                                                            {yr} yrs
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <InputError message={errors.duration_years} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="total_units" className="text-xs font-semibold">
                                                    Total Credit Units <span className="text-destructive">*</span>
                                                </Label>
                                                <span className="text-[11px] text-muted-foreground">
                                                    Range: 1 – 500 units
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="total_units"
                                                    type="number"
                                                    min="1"
                                                    max="500"
                                                    step="0.5"
                                                    value={data.total_units}
                                                    onChange={(e) => setData('total_units', e.target.value)}
                                                    required
                                                    className="text-sm w-28"
                                                />
                                                <div className="flex flex-wrap items-center gap-1">
                                                    {UNITS_PRESETS.map((unit) => (
                                                        <button
                                                            key={unit}
                                                            type="button"
                                                            onClick={() => setData('total_units', unit)}
                                                            className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                                                                data.total_units === unit
                                                                    ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                                                    : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                                                            }`}
                                                        >
                                                            {unit}u
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <InputError message={errors.total_units} />
                                        </div>
                                    </div>

                                    {/* Description / Program Overview */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-xs font-semibold">
                                            Program Overview & Educational Objectives
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Provide a concise description of program objectives, career pathways, or specialized major concentrations..."
                                            rows={3}
                                            className="text-sm resize-y"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Optional overview visible on program summaries and student academic plans.
                                        </p>
                                        <InputError message={errors.description} />
                                    </div>

                                    {/* Active Program Toggle */}
                                    <div className="rounded-lg border border-border bg-muted/20 p-3.5 flex items-start gap-3">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                            className="mt-0.5"
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active" className="text-xs font-semibold cursor-pointer">
                                                Active Academic Degree Program
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                When enabled, this program is active for section cohort creation, curriculum mapping, and timetable schedule generation.
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
                                            <Plus className="mr-1.5 h-4 w-4" />
                                            {processing ? 'Registering Program…' : 'Register Program'}
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="text-xs">
                                            <Link href={programs()}>Cancel</Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar: Live Program Catalog Preview & Curriculum Context */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                        {/* Live Program Card Preview */}
                        <Card className="shadow-sm border-dashed">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Live Degree Catalog Preview
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
                                                {data.code.trim() || 'PROG'}
                                            </Badge>
                                            <Badge variant="secondary" className="text-[10px] capitalize">
                                                {getDegreeLevelLabel(data.degree_level)}
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
                                            {data.name.trim() || 'Degree Program Title'}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {data.description.trim() || 'No curriculum description specified yet.'}
                                        </p>
                                    </div>

                                    {/* Department Badge */}
                                    <div className="rounded-md border border-border/60 bg-muted/30 p-2.5 flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Administering Department
                                            </p>
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {selectedDepartment
                                                    ? `${selectedDepartment.code} — ${selectedDepartment.name}`
                                                    : 'No Department Assigned'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                                        <div className="rounded border border-border/50 bg-background/50 p-2 text-center">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                Duration
                                            </p>
                                            <p className="font-semibold text-foreground text-sm mt-0.5">
                                                {data.duration_years || '4'} Years
                                            </p>
                                        </div>
                                        <div className="rounded border border-border/50 bg-background/50 p-2 text-center">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                Credit Load
                                            </p>
                                            <p className="font-semibold text-foreground text-sm mt-0.5">
                                                {data.total_units || '120'} Units
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[11px] text-muted-foreground text-center">
                                    Live simulation of how this academic program card renders in collegiate prospectus and section enrollment views.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Curriculum Planning & Sections Reference */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Academic Curriculum Synergy
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3.5 space-y-3 text-xs text-muted-foreground leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Cohort Sections:</strong> After saving, generate year-level sections (e.g. {data.code ? `${data.code}-1A` : 'BSCS-1A'}) in the <Link href="/sections" className="text-primary hover:underline font-medium">Sections</Link> module.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Curriculum Roadmaps:</strong> Bind term-by-term subject prerequisites and unit distributions in the <Link href="/curricula" className="text-primary hover:underline font-medium">Curriculum</Link> module.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Accreditation Standards:</strong> Ensure total units conform with CHED curriculum policies for {getDegreeLevelLabel(data.degree_level)}.
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

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Programs', href: programs() },
            { title: 'Register Program', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
