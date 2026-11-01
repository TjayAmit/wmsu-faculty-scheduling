import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    GraduationCap,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    School,
    Shield,
    Sparkles,
    Trash2,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { fmtDate } from '@/lib/utils';
import {
    destroy as departmentsDestroy,
    edit as departmentsEdit,
    index as departments,
} from '@/routes/departments';
import { index as programsIndex, show as programsShow } from '@/routes/programs';
import { index as teachersIndex, show as teachersShow } from '@/routes/teachers';
import type { DepartmentsShowProps } from '@/types';

export default function Show({ department }: DepartmentsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(departmentsDestroy(department.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const facultyCount = department.teachers?.length || 0;
    const programsCount = department.programs?.length || 0;

    const headInitials = department.head
        ? `${department.head.first_name[0] || ''}${department.head.last_name[0] || ''}`.toUpperCase()
        : 'DH';

    return (
        <>
            <Head title={`Department - ${department.code} (${department.name})`} />

            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6 w-full">
                {/* Header & Navigation */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={departments()}
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Departments
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {department.name}
                            </h1>
                            <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                                {department.code}
                            </span>
                            <Badge
                                className={
                                    department.is_active
                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                        : 'border-border bg-muted text-muted-foreground'
                                }
                            >
                                {department.is_active ? 'Active Department' : 'Inactive'}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                                ID: #{department.id}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Collegiate organizational unit managing academic degree programs and instructional faculty
                        </p>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href={departmentsEdit(department.id)}>
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit Department</span>
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDelete(true)}
                            className="gap-1.5"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                        </Button>
                    </div>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
                    {/* Main Content (8 cols) */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Hero Overview Card */}
                        <Card className="relative overflow-hidden border-border/80 shadow-sm">
                            <div className="absolute top-0 right-0 h-44 w-44 rounded-bl-full pointer-events-none bg-gradient-to-bl from-primary/10 to-transparent" />

                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                        <School className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">
                                            Collegiate Profile
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Institutional mandate and operational overview
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {/* Description Quote */}
                                {department.description && (
                                    <div className="rounded-lg border bg-muted/20 p-4 text-sm text-foreground leading-relaxed">
                                        <p className="italic text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold not-italic">
                                            Department Mission & Scope
                                        </p>
                                        {department.description}
                                    </div>
                                )}

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <GraduationCap className="h-3.5 w-3.5 text-primary" />
                                            <span>Programs</span>
                                        </div>
                                        <p className="text-xl font-bold text-foreground mt-2 font-mono">
                                            {programsCount} <span className="text-xs font-normal text-muted-foreground">Offered</span>
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Users className="h-3.5 w-3.5 text-primary" />
                                            <span>Faculty</span>
                                        </div>
                                        <p className="text-xl font-bold text-foreground mt-2 font-mono">
                                            {facultyCount} <span className="text-xs font-normal text-muted-foreground">Members</span>
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <UserCheck className="h-3.5 w-3.5 text-primary" />
                                            <span>Leadership</span>
                                        </div>
                                        <p className="text-sm font-semibold text-foreground mt-2 truncate">
                                            {department.head ? department.head.first_name + ' ' + department.head.last_name : 'Pending'}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border bg-card p-3.5 shadow-2xs">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Building2 className="h-3.5 w-3.5 text-primary" />
                                            <span>Status</span>
                                        </div>
                                        <p className="text-sm font-semibold text-foreground mt-2">
                                            {department.is_active ? 'Active Division' : 'Archived'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Degree Programs Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Academic Degree Programs ({programsCount})
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs mt-0.5">
                                        Degree curricula administered under {department.code}
                                    </CardDescription>
                                </div>

                                <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
                                    <Link href={programsIndex()}>
                                        <span>All Programs</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardHeader>

                            <CardContent>
                                {programsCount > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {department.programs?.map((program) => (
                                            <div
                                                key={program.id}
                                                className="flex flex-col justify-between rounded-lg border bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary border border-primary/20">
                                                            {program.code}
                                                        </span>
                                                        {program.degree_level && (
                                                            <Badge variant="outline" className="text-[10px] capitalize">
                                                                {program.degree_level}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground line-clamp-2 mt-1">
                                                        {program.name}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 mt-2 border-t text-xs text-muted-foreground">
                                                    <span>
                                                        {program.duration_years ? `${program.duration_years} Years` : '4 Years'}
                                                    </span>
                                                    <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1">
                                                        <Link href={programsShow(program.id)}>
                                                            <span>Details</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed bg-muted/20">
                                        <GraduationCap className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm font-medium text-foreground">
                                            No programs assigned yet
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Assign degree programs to this department in the Programs module.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Instructional Faculty Members Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Department Faculty ({facultyCount})
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-xs mt-0.5">
                                        Teaching personnel assigned to {department.name}
                                    </CardDescription>
                                </div>

                                <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2.5 gap-1">
                                    <Link href={teachersIndex()}>
                                        <span>Faculty Directory</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardHeader>

                            <CardContent>
                                {facultyCount > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {department.teachers?.map((t) => {
                                            const initials = `${t.first_name[0] || ''}${t.last_name[0] || ''}`.toUpperCase();
                                            return (
                                                <div
                                                    key={t.id}
                                                    className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-2xs hover:border-primary/40 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Avatar className="h-9 w-9 border border-primary/20 bg-primary/10 text-primary font-bold text-xs">
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-foreground truncate">
                                                                {t.first_name} {t.last_name}
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground font-mono">
                                                                {t.employee_id} • {t.rank || 'Faculty'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2">
                                                        <Link href={teachersShow(t.id)}>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg border-dashed bg-muted/20">
                                        <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                        <p className="text-sm font-medium text-foreground">
                                            No faculty members listed
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Assign instructors to this department in the Faculty Staff module.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Metadata (4 cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Department Leadership Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Department Chairperson / Dean
                                        </CardTitle>
                                    </div>
                                    {department.head && (
                                        <Button asChild variant="ghost" size="sm" className="h-6 text-xs px-2 gap-1">
                                            <Link href={teachersShow(department.head.id)}>
                                                <span>Profile</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                <CardDescription className="text-xs">
                                    Primary academic officer
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {department.head ? (
                                    <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3.5">
                                        <Avatar className="h-10 w-10 border border-primary/20 bg-primary/10 text-primary font-bold">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {headInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {department.head.first_name} {department.head.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                ID: {department.head.employee_id}
                                            </p>
                                            {department.head.email && (
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                    {department.head.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed bg-muted/10 p-3.5 text-center text-xs text-muted-foreground">
                                        <p>No Department Head assigned.</p>
                                        <Button asChild variant="link" size="sm" className="text-xs h-auto p-0 mt-1">
                                            <Link href={departmentsEdit(department.id)}>+ Assign Chairperson</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Campus Headquarters & Contact Card */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Office & Contact Info
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Official communication channels
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div className="space-y-1.5 border-b pb-2.5">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                        Office Location
                                    </span>
                                    <p className="text-muted-foreground leading-relaxed pl-5">
                                        {department.office_location || 'Campus Center, WMSU Main'}
                                    </p>
                                </div>

                                {department.contact_phone && (
                                    <div className="space-y-1 border-b pb-2.5">
                                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5 text-primary" />
                                            Telephone Hotline
                                        </span>
                                        <p className="font-mono text-muted-foreground pl-5">
                                            {department.contact_phone}
                                        </p>
                                    </div>
                                )}

                                {department.contact_email && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                                                <Mail className="h-3.5 w-3.5 text-primary" />
                                                Official Email
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopyEmail(department.contact_email!)}
                                                className="h-5 text-[11px] px-1 text-muted-foreground hover:text-foreground"
                                            >
                                                {copiedEmail ? (
                                                    <Check className="h-3 w-3 text-emerald-600 mr-1" />
                                                ) : (
                                                    <Copy className="h-3 w-3 mr-1" />
                                                )}
                                                {copiedEmail ? 'Copied' : 'Copy'}
                                            </Button>
                                        </div>
                                        <a
                                            href={`mailto:${department.contact_email}`}
                                            className="block font-medium text-primary hover:underline pl-5 truncate"
                                        >
                                            {department.contact_email}
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Lifecycle & Auditing */}
                        <Card className="border-border/80 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Lifecycle & Auditing
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Department ID</span>
                                    <span className="font-mono font-semibold text-foreground">
                                        #{department.id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Created At</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(department.created_at)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <span className="font-medium text-foreground">
                                        {fmtDate(department.updated_at)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDeleteDialog
                open={showDelete}
                onOpenChange={setShowDelete}
                title="Delete Academic Department"
                itemName={`${department.code} - ${department.name}`}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Departments', href: departments() },
            { title: 'View Department', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
