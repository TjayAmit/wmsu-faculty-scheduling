import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    Save,
    Sparkles,
    UserCheck,
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
import {
    index as departments,
    show as departmentsShow,
    update as departmentsUpdate,
} from '@/routes/departments';
import type { DepartmentsFormProps } from '@/types';

export default function Edit({ department, teachers = [] }: DepartmentsFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        code: department?.code || '',
        name: department?.name || '',
        description: department?.description || '',
        head_id: department?.head_id?.toString() || '',
        office_location: department?.office_location || '',
        contact_phone: department?.contact_phone || '',
        contact_email: department?.contact_email || '',
        is_active: department?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (department) {
            put(departmentsUpdate.url(department.id));
        }
    };

    const selectedHead = teachers.find(
        (t) => t.id.toString() === data.head_id
    );

    return (
        <>
            <Head title={`Edit ${department?.code} - ${department?.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Back Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <Link href={department ? departmentsShow(department.id) : departments()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to {department ? 'Department Details' : 'Departments'}
                        </Link>
                    </Button>
                </div>

                {/* Page Title */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Edit Department Specifications
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update academic department designation, chairperson leadership, office location, and contact parameters for {department?.name}.
                    </p>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Form Column */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Academic Unit Specifications
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Department Code & Name */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                        <div className="sm:col-span-4 space-y-2">
                                            <Label htmlFor="code" className="text-xs font-semibold">
                                                Department Code <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                placeholder="e.g., DCS, DIT, CED"
                                                required
                                                className="font-mono text-sm uppercase"
                                                maxLength={20}
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Unique academic division acronym.
                                            </p>
                                            <InputError message={errors.code} />
                                        </div>

                                        <div className="sm:col-span-8 space-y-2">
                                            <Label htmlFor="name" className="text-xs font-semibold">
                                                Department Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Department of Computer Science"
                                                required
                                                className="text-sm"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Full official collegiate title.
                                            </p>
                                            <InputError message={errors.name} />
                                        </div>
                                    </div>

                                    {/* Leadership & Office Location */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="head_id" className="text-xs font-semibold">
                                                Department Head / Chairperson
                                            </Label>
                                            <Select
                                                value={data.head_id || 'none'}
                                                onValueChange={(val) => setData('head_id', val === 'none' ? '' : val)}
                                            >
                                                <SelectTrigger id="head_id" className="text-sm">
                                                    <SelectValue placeholder="Select department head" />
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
                                                Faculty member presiding as department administrator.
                                            </p>
                                            <InputError message={errors.head_id} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="office_location" className="text-xs font-semibold">
                                                Office Location
                                            </Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    id="office_location"
                                                    value={data.office_location}
                                                    onChange={(e) => setData('office_location', e.target.value)}
                                                    placeholder="e.g., Education Bldg Rm 204"
                                                    className="pl-9 text-sm"
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Physical building and office room designation.
                                            </p>
                                            <InputError message={errors.office_location} />
                                        </div>
                                    </div>

                                    {/* Contact Phone & Contact Email */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_phone" className="text-xs font-semibold">
                                                Office Contact Phone / Local
                                            </Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    id="contact_phone"
                                                    value={data.contact_phone}
                                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                                    placeholder="e.g., (062) 991-1771 loc 123"
                                                    className="pl-9 text-sm"
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Campus intercom or landline telephone number.
                                            </p>
                                            <InputError message={errors.contact_phone} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact_email" className="text-xs font-semibold">
                                                Official Email Address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                <Input
                                                    id="contact_email"
                                                    type="email"
                                                    value={data.contact_email}
                                                    onChange={(e) => setData('contact_email', e.target.value)}
                                                    placeholder="e.g., cs.dept@wmsu.edu.ph"
                                                    className="pl-9 text-sm"
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Inquiries and official communication mailbox.
                                            </p>
                                            <InputError message={errors.contact_email} />
                                        </div>
                                    </div>

                                    {/* Department Mission & Overview */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-xs font-semibold">
                                            Department Overview & Mandate
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Provide a concise summary of the department's academic scope, degree offerings, or instructional purpose..."
                                            rows={3}
                                            className="text-sm resize-y"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                            Optional description displayed on department profiles and catalog lists.
                                        </p>
                                        <InputError message={errors.description} />
                                    </div>

                                    {/* Active Status Checkbox Banner */}
                                    <div className="rounded-lg border border-border bg-muted/20 p-3.5 flex items-start gap-3">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                            className="mt-0.5"
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active" className="text-xs font-semibold cursor-pointer">
                                                Active Department Division
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                Active departments are eligible for academic program curation, faculty teaching assignments, and timetable scheduling.
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
                                            <Link href={department ? departmentsShow(department.id) : departments()}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar: Directory Live Preview & Governance Context */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                        {/* Live Department Directory Preview */}
                        <Card className="shadow-sm border-dashed">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Live Directory Preview
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-2xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-xs font-semibold px-2 py-0.5 border-primary/20 bg-primary/5 text-primary"
                                        >
                                            {data.code.trim() || 'DEPT'}
                                        </Badge>
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
                                            {data.name.trim() || 'Department Name'}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {data.description.trim() || 'No overview summary provided yet.'}
                                        </p>
                                    </div>

                                    {/* Department Leadership */}
                                    <div className="rounded-md border border-border/60 bg-muted/30 p-2.5 flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <UserCheck className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Department Head
                                            </p>
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {selectedHead
                                                    ? `${selectedHead.first_name} ${selectedHead.last_name}`
                                                    : 'To Be Appointed'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location & Contact Meta */}
                                    <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                                            <span className="truncate">
                                                {data.office_location.trim() || 'Office location pending'}
                                            </span>
                                        </div>

                                        {data.contact_phone.trim() && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                                                <span className="truncate font-mono text-[11px]">
                                                    {data.contact_phone.trim()}
                                                </span>
                                            </div>
                                        )}

                                        {data.contact_email.trim() && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                                                <span className="truncate text-[11px]">
                                                    {data.contact_email.trim()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-[11px] text-muted-foreground text-center">
                                    Real-time preview of this department's listing across collegiate portal directories and reporting summaries.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Academic Governance Guidelines Card */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Collegiate Hierarchy
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3.5 space-y-3 text-xs text-muted-foreground leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Degree Programs:</strong> Once registered, link bachelor and graduate degree programs under this department.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Faculty Roster:</strong> Instructors and professors can be associated with this department for workload distribution.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary shrink-0">•</span>
                                    <span>
                                        <strong className="text-foreground">Course Offerings:</strong> Subjects categorized under this department feed directly into semester scheduling.
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
            { title: 'Departments', href: departments() },
            { title: 'Edit Department', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
