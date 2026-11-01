import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative grid min-h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
                {/* ── LEFT PANEL — Bright, natural WMSU College of Education visual banner ── */}
                <div className="relative hidden h-full w-full flex-col justify-between overflow-hidden bg-slate-900 p-10 lg:flex select-none">
                    {/* Natural Daylight Architectural Photo */}
                    <img
                        src="/wmsu_college_of_education.jpg"
                        alt="WMSU College of Education"
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center brightness-105 saturate-110"
                    />

                    {/* Soft, natural lighting: gentle translucent gradient on the left for text contrast, leaving the building, sky, and grounds bright and sunlit */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/35" />

                    {/* ── Top Header: University & College Identity ── */}
                    <Link href={home()} className="relative z-20 flex items-center gap-3.5 w-fit group">
                        {/* Direct Logo (No wrapper container) */}
                        <AppLogoIcon className="h-12 w-12 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-transform group-hover:scale-105" />
                        <div className="flex flex-col drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-200">
                                College of Education
                            </span>
                            <span className="text-lg font-bold tracking-tight text-white leading-tight">
                                Faculty Management
                            </span>
                            <span className="text-xs text-zinc-100 font-medium">
                                Western Mindanao State University
                            </span>
                        </div>
                    </Link>

                    {/* ── Center Content: Clean typography directly on the pane ── */}
                    <div className="relative z-20 my-auto max-w-lg py-12">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                            Faculty Scheduling <br />
                            <span className="font-light text-rose-100">Management System</span>
                        </h2>

                        <p className="mt-5 text-base leading-relaxed text-zinc-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] font-medium">
                            Empowering academic excellence through organized faculty timetables, streamlined room assignments, and conflict-free collegiate scheduling.
                        </p>
                    </div>

                    {/* ── Footer: Institutional Attribution ── */}
                    <div className="relative z-20 flex items-center justify-between border-t border-white/25 pt-6 text-xs text-zinc-100 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                        <p>
                            &copy; {new Date().getFullYear()} Western Mindanao State University
                        </p>
                        <span className="text-[11px] font-mono tracking-wide text-zinc-100">
                            Baliwasan Campus • Zamboanga City
                        </span>
                    </div>
                </div>

                {/* ── RIGHT PANEL — Login Form Area ── */}
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
