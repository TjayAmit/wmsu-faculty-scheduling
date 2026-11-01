import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
                {/* ── LEFT PANEL — WMSU College of Education visual banner ── */}
                <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-zinc-950 p-10 lg:flex select-none">
                    {/* Architectural Background Image */}
                    <img
                        src="/wmsu_college_of_education.jpg"
                        alt="WMSU College of Education"
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-35 brightness-90 contrast-110"
                    />

                    {/* Gradient overlays for crisp contrast & atmosphere */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/80" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-zinc-950/80" />

                    {/* Dot grid texture */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />

                    {/* Ambient university brand glows */}
                    <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
                    <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

                    {/* ── Header: Logo & Brand ── */}
                    <Link href={home()} className="relative z-20 flex items-center gap-3 w-fit group">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30 backdrop-blur-md transition-transform group-hover:scale-105">
                            <AppLogoIcon className="w-12" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                                College of Education
                            </span>
                            <span className="font-bold text-white text-base leading-tight tracking-tight">
                                {name as string}
                            </span>
                            <span className="text-[10px] italic text-zinc-400">
                                Western Mindanao State University
                            </span>
                        </div>
                    </Link>

                    {/* ── Main Copy & Value Propositions ── */}
                    <div className="relative z-20 my-auto py-10">
                        <div className="mb-8">
                            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30 backdrop-blur-md">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                Faculty Scheduling System
                            </span>

                            <h2 className="mb-4 text-3xl font-bold leading-tight text-white lg:text-4xl tracking-tight">
                                Manage Schedules
                                <span className="mt-1 block text-zinc-300 font-normal">
                                    with Confidence
                                </span>
                            </h2>

                            <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
                                Organize faculty loads, assign subject schedules, and catch conflicts before they become problems.
                            </p>
                        </div>

                        {/* Feature check list */}
                        <ul className="flex flex-col gap-3.5 max-w-sm">
                            {[
                                'Automatic conflict detection',
                                'Room & time slot optimization',
                                'Faculty teaching load monitoring',
                                'Printable schedule reports',
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/25 text-primary ring-1 ring-primary/30">
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2.5}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </span>
                                    <span className="text-sm font-medium text-zinc-200">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Footer ── */}
                    <div className="relative z-20 border-t border-zinc-800/80 pt-5 flex items-center justify-between text-xs text-zinc-400">
                        <p>
                            &copy; {new Date().getFullYear()} Western Mindanao State University
                        </p>
                        <span className="text-[11px] font-mono text-zinc-400">
                            WMSU • Baliwasan Campus
                        </span>
                    </div>
                </div>

                {/* ── RIGHT PANEL — Form Area ── */}
                <div className="w-full lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        {/* Mobile logo */}
                        <Link
                            href={home()}
                            className="relative z-20 flex items-center justify-center lg:hidden"
                        >
                            <AppLogoIcon className="h-10 fill-current text-black sm:h-12 dark:text-white" />
                        </Link>

                        <div className="flex flex-col items-start gap-1 text-left sm:items-center sm:text-center">
                            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                            <p className="text-sm text-balance text-muted-foreground">{description}</p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
