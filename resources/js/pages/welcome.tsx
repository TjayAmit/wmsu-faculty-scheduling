import { Head, Link, usePage } from '@inertiajs/react';
import { Fragment } from 'react';
import { dashboard, login, register } from '@/routes';

interface User {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    auth: { user: User | null };
    canRegister?: boolean;
    [key: string]: unknown;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

const SCHEDULE_ROWS = [
    { time: '7 AM',  cells: ['orange',  '',        'blue',    '',        ''      ] },
    { time: '8 AM',  cells: ['',        'emerald', '',        'orange',  'blue'  ] },
    { time: '9 AM',  cells: ['blue',    '',        '',        '',        'orange'] },
    { time: '10 AM', cells: ['',        'orange',  'emerald', '',        ''      ] },
    { time: '11 AM', cells: ['',        '',        '',        'emerald', 'blue'  ] },
] as const;

const SUBJECT_MAP: Record<string, { bg: string; text: string; label: string }> = {
    orange:  { bg: 'bg-orange-100 dark:bg-orange-500/20',   text: 'text-orange-700 dark:text-orange-300',  label: 'MATH 101' },
    blue:    { bg: 'bg-sky-100 dark:bg-sky-500/20',         text: 'text-sky-700 dark:text-sky-300',        label: 'SCI 301'  },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300',label: 'ENG 201'  },
};

const FEATURES = [
    {
        path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        title: 'Subject Scheduling',
        desc: 'Assign subjects to faculty with specific rooms, sections, and time slots in a structured workflow.',
    },
    {
        path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
        title: 'Faculty Management',
        desc: 'Maintain complete faculty records: rank, specialization, contact info, and full subject load history.',
    },
    {
        path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        title: 'Conflict Detection',
        desc: 'Instantly flags overlapping faculty schedules, room conflicts, and section clashes before publishing.',
    },
    {
        path: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        title: 'Room Assignment',
        desc: 'Track classroom availability and auto-assign rooms based on capacity and existing schedule gaps.',
    },
    {
        path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        title: 'Load Monitoring',
        desc: "Monitor each faculty member's teaching load in real time to ensure fair and compliant distribution.",
    },
    {
        path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        title: 'Schedule Reports',
        desc: 'Generate printable and exportable reports per department, section, or individual faculty member.',
    },
];

const STEPS = [
    {
        num: '01',
        title: 'Build Faculty Profiles',
        desc: "Add each faculty member's academic rank, subjects handled, and preferred time availability.",
    },
    {
        num: '02',
        title: 'Assign & Schedule',
        desc: 'Match faculty to subjects, pick time slots and rooms, and let the system flag any conflicts.',
    },
    {
        num: '03',
        title: 'Publish & Monitor',
        desc: 'Finalize the conflict-free schedule, distribute it, and track loads throughout the semester.',
    },
];

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="WMSU Faculty Scheduling System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-background text-foreground">

                {/* ── STICKY NAV ── */}
                <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/wmsu_logo.png" alt="WMSU" className="h-9 w-9" />
                            <div className="hidden sm:flex sm:flex-col">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                    College of Education
                                </span>
                                <span className="text-sm font-semibold leading-tight">
                                    Faculty Scheduling System
                                </span>
                            </div>
                        </Link>
                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        Sign In
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── HERO ── */}
                <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-20">
                    {/* Soft radial bg wash */}
                    <div className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center">
                        <div className="mt-[-4rem] h-[40rem] w-[80rem] rounded-full bg-primary/[0.06] blur-3xl" />
                    </div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

                            {/* Left — headline */}
                            <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
                                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-1.5 text-sm font-medium text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    WMSU College of Education
                                </span>

                                <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.2rem] lg:leading-[1.1]">
                                    Smarter Teacher
                                    <span className="block bg-gradient-to-r from-primary via-orange-500 to-amber-400 bg-clip-text text-transparent">
                                        Scheduling &
                                    </span>
                                    Monitoring
                                </h1>

                                <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                                    A centralized system for the College of Education to build conflict-free
                                    subject schedules, manage faculty loads, and publish finalized timetables.
                                </p>

                                <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                                    {!auth.user ? (
                                        <>
                                            <Link
                                                href={login()}
                                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 hover:shadow-lg"
                                            >
                                                Get Started
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </Link>
                                            {canRegister && (
                                                <Link
                                                    href={register()}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3 text-base font-semibold text-card-foreground shadow-sm transition hover:bg-accent"
                                                >
                                                    Create Account
                                                </Link>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href={dashboard()}
                                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
                                        >
                                            Open Dashboard
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>

                                {/* Quick trust row */}
                                <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
                                    {['Conflict Detection', 'Real-time Monitoring', 'Printable Reports'].map((t) => (
                                        <span key={t} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Right — schedule mockup */}
                            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                                {/* Glow halo */}
                                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />

                                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                                    {/* Window chrome */}
                                    <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                                        <div className="flex gap-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Schedule — BEED 2A
                                        </span>
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                            S1 · 2024–25
                                        </span>
                                    </div>

                                    {/* Timetable grid */}
                                    <div className="p-4">
                                        <div className="grid grid-cols-[3rem_repeat(5,1fr)] gap-1.5">
                                            <div />
                                            {DAYS.map((d) => (
                                                <div key={d} className="py-1 text-center text-[11px] font-semibold text-muted-foreground">
                                                    {d}
                                                </div>
                                            ))}
                                            {SCHEDULE_ROWS.map(({ time, cells }) => (
                                                <Fragment key={time}>
                                                    <div className="flex items-center text-[10px] text-muted-foreground">
                                                        {time}
                                                    </div>
                                                    {(cells as readonly string[]).map((color, i) => {
                                                        const s = color ? SUBJECT_MAP[color] : null;
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`rounded py-2 text-center text-[10px] font-semibold leading-tight ${s ? `${s.bg} ${s.text}` : ''}`}
                                                            >
                                                                {s?.label ?? ''}
                                                            </div>
                                                        );
                                                    })}
                                                </Fragment>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Faculty legend */}
                                    <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-3">
                                        {[
                                            { name: 'Dr. Santos', color: 'orange' },
                                            { name: 'Prof. Reyes', color: 'blue' },
                                            { name: 'Ms. Garcia', color: 'emerald' },
                                        ].map(({ name, color }) => {
                                            const s = SUBJECT_MAP[color];
                                            return (
                                                <span
                                                    key={name}
                                                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                    {name}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Floating "no conflicts" badge */}
                                <div className="absolute -bottom-4 -left-3 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-lg">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                        <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="leading-tight">
                                        <p className="text-xs font-semibold text-card-foreground">No conflicts detected</p>
                                        <p className="text-[10px] text-muted-foreground">All schedules are clear</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── STATS BAR ── */}
                <div className="border-y border-border bg-muted/30">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                            {[
                                { value: '60+',  label: 'Faculty Members' },
                                { value: '4',    label: 'Academic Programs' },
                                { value: '200+', label: 'Scheduled Classes' },
                                { value: '0',    label: 'Unresolved Conflicts' },
                            ].map(({ value, label }) => (
                                <div key={label} className="text-center">
                                    <dt className="text-2xl font-extrabold text-foreground sm:text-3xl">{value}</dt>
                                    <dd className="mt-1 text-sm text-muted-foreground">{label}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>

                {/* ── FEATURES GRID ── */}
                <section className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Built for Academic Scheduling
                            </h2>
                            <p className="mt-3 text-lg text-muted-foreground">
                                Every tool your scheduling office needs in one place
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {FEATURES.map(({ path, title, desc }) => (
                                <div
                                    key={title}
                                    className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md dark:hover:border-primary/30"
                                >
                                    <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 text-primary transition-transform duration-200 group-hover:scale-110">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-base font-semibold text-card-foreground">{title}</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section className="bg-muted/30 py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-14 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
                            <p className="mt-3 text-muted-foreground">
                                Three steps to a conflict-free semester
                            </p>
                        </div>
                        <div className="grid gap-10 sm:grid-cols-3">
                            {STEPS.map(({ num, title, desc }, i) => (
                                <div key={num} className="relative flex flex-col items-center text-center">
                                    {i < STEPS.length - 1 && (
                                        <div className="absolute left-1/2 top-6 hidden h-px w-full translate-x-[3rem] border-t border-dashed border-border sm:block" />
                                    )}
                                    <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground shadow-lg">
                                        {num}
                                    </div>
                                    <h4 className="mb-2 font-semibold text-foreground">{title}</h4>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                {!auth.user && (
                    <section className="py-16 sm:py-20">
                        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
                            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] to-transparent px-8 py-12 sm:px-14">
                                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                                    Ready to get started?
                                </h2>
                                <p className="mb-8 text-muted-foreground">
                                    Join the College of Education and bring order to your faculty scheduling.
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <Link
                                        href={login()}
                                        className="rounded-xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
                                    >
                                        Sign In
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-xl border border-border bg-card px-7 py-3 text-base font-semibold text-card-foreground shadow-sm hover:bg-accent"
                                        >
                                            Create Account
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── FOOTER ── */}
                <footer className="border-t border-border py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
                            <div className="flex items-center gap-2.5">
                                <img src="/wmsu_logo.png" alt="WMSU" className="h-6 w-6" />
                                <span className="text-sm text-muted-foreground">
                                    Western Mindanao State University &mdash; College of Education
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                &copy; {new Date().getFullYear()} Faculty Scheduling System
                            </p>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
