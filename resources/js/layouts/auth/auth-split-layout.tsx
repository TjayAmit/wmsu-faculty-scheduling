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
                <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#5c000c] via-[#3d0007] to-[#1f0003] p-10 lg:flex select-none">
                    {/* Architectural Background Image (Bright, vivid, clearly visible) */}
                    <img
                        src="/wmsu_college_of_education.jpg"
                        alt="WMSU College of Education"
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-85 brightness-105 contrast-105"
                    />

                    {/* Warm University Maroon & Sunlight Overlays */}
                    {/* 1. Subtle Crimson wash for collegiate identity */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#800000]/45 via-[#500008]/40 to-[#250004]/60 mix-blend-multiply" />

                    {/* 2. Soft horizontal vignette: darker on the left to protect text, clear on the right to show the building */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />

                    {/* 3. Subtle bottom & top edge shading for header and footer contrast */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35" />

                    {/* Ambient warm crimson glow accent */}
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#800000]/30 blur-[100px]" />

                    {/* ── Header: Logo & Brand ── */}
                    <Link href={home()} className="relative z-20 flex items-center gap-3 w-fit group">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30 backdrop-blur-md shadow-lg transition-transform group-hover:scale-105">
                            <AppLogoIcon className="w-12 drop-shadow-md" />
                        </div>
                        <div className="flex flex-col drop-shadow-sm">
                            <span className="text-[11px] uppercase tracking-wider text-rose-200 font-semibold">
                                College of Education
                            </span>
                            <span className="font-bold text-white text-lg leading-tight tracking-tight">
                                {name as string}
                            </span>
                            <span className="text-[11px] text-zinc-200 font-medium">
                                Western Mindanao State University
                            </span>
                        </div>
                    </Link>

                    {/* ── Main Copy & Value Propositions ── */}
                    <div className="relative z-20 my-auto max-w-lg py-8">
                        <div className="rounded-2xl border border-white/15 bg-black/30 p-7 backdrop-blur-md shadow-2xl">
                            <div className="mb-6">
                                <span className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-[#800000]/70 px-3.5 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
                                    <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                                    Faculty Scheduling System
                                </span>

                                <h2 className="mb-3 text-3xl font-bold leading-tight text-white lg:text-4xl tracking-tight drop-shadow-sm">
                                    Manage Schedules
                                    <span className="mt-1 block text-rose-100 font-normal">
                                        with Confidence
                                    </span>
                                </h2>

                                <p className="text-sm leading-relaxed text-zinc-100/90 font-normal">
                                    Organize faculty loads, assign subject schedules, and catch conflicts before they become problems.
                                </p>
                            </div>

                            {/* Feature check list */}
                            <ul className="flex flex-col gap-3">
                                {[
                                    'Automatic conflict detection',
                                    'Room & time slot optimization',
                                    'Faculty teaching load monitoring',
                                    'Printable schedule reports',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#800000] text-white shadow-xs ring-1 ring-white/30">
                                            <svg
                                                className="h-3 w-3 stroke-[3]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </span>
                                        <span className="text-sm font-medium text-white drop-shadow-xs">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="relative z-20 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-zinc-200">
                        <p className="font-medium drop-shadow-xs">
                            &copy; {new Date().getFullYear()} Western Mindanao State University
                        </p>
                        <span className="text-[11px] font-mono font-medium text-zinc-200/90 drop-shadow-xs">
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
