import { Head, Link } from '@inertiajs/react';
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

            <div className="relative grid min-h-dvh flex-col items-center justify-center lg:max-w-none lg:grid-cols-12 lg:px-0">
                {/* ── LEFT PANEL — WMSU College of Education Collegiate Visual Hero (7 cols on lg) ── */}
                <div className="relative hidden h-full w-full flex-col justify-between overflow-hidden bg-[#400207] p-8 lg:col-span-7 lg:flex xl:p-12 select-none">
                    {/* Architectural Background Image */}
                    <img
                        src="/wmsu_college_of_education.jpg"
                        alt="WMSU College of Education"
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center brightness-105 saturate-110"
                    />

                    {/* Smooth, multi-stop collegiate crimson atmospheric wash:
                        - Deep rich maroon on the left for text contrast
                        - Translucent warm middle transition
                        - Transparent right edge revealing the sunlit building and sky */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#4d0108]/95 via-[#5c030d]/70 via-[#800000]/30 to-transparent" />
                    
                    {/* Soft vertical grounding vignette */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#2e0004]/60 via-transparent to-[#1f0003]/80" />

                    {/* Subtle ambient warm glow */}
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#800000]/35 blur-3xl" />

                    {/* ── Top Header: University & College Identity ── */}
                    <Link href={home()} className="relative z-20 flex items-center gap-3.5 w-fit group">
                        <AppLogoIcon className="h-13 w-13 shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-transform group-hover:scale-105" />
                        <div className="flex flex-col drop-shadow-sm">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-300">
                                College of Education
                            </span>
                            <span className="text-xl font-extrabold tracking-tight text-white leading-tight">
                                Faculty Management
                            </span>
                            <span className="text-xs text-rose-100/90 font-medium tracking-wide">
                                Western Mindanao State University
                            </span>
                        </div>
                    </Link>

                    {/* ── Center Content: Dignified, balanced academic typography ── */}
                    <div className="relative z-20 my-auto max-w-xl py-10">
                        {/* Institutional Badge */}
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-[#800000]/65 px-3 py-1 text-xs font-semibold text-rose-100 shadow-sm backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-300 animate-pulse" />
                            Official Faculty Portal
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[2.75rem] leading-[1.12] drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
                            Faculty Scheduling <br />
                            <span className="font-light text-rose-200">Management System</span>
                        </h1>

                        <div className="mt-5 border-l-2 border-rose-400/80 pl-4">
                            <p className="max-w-lg text-sm sm:text-base leading-relaxed text-rose-50/95 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                                Streamlining academic timetables, collegiate room allocations, and faculty workload coordination with institutional confidence.
                            </p>
                        </div>

                        {/* Subtle Key Highlights */}
                        <div className="mt-7 flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-lg border border-white/15 bg-black/30 px-3 py-1 text-rose-100 backdrop-blur-xs font-medium shadow-xs">
                                Automated Conflict Detection
                            </span>
                            <span className="rounded-lg border border-white/15 bg-black/30 px-3 py-1 text-rose-100 backdrop-blur-xs font-medium shadow-xs">
                                Room & Lab Optimization
                            </span>
                            <span className="rounded-lg border border-white/15 bg-black/30 px-3 py-1 text-rose-100 backdrop-blur-xs font-medium shadow-xs">
                                Workload Analytics
                            </span>
                        </div>
                    </div>

                    {/* ── Footer: Clean institutional attribution ── */}
                    <div className="relative z-20 flex items-center justify-between border-t border-rose-400/20 pt-5 text-xs text-rose-100/90 font-medium">
                        <p className="drop-shadow-xs">
                            &copy; {new Date().getFullYear()} Western Mindanao State University
                        </p>
                        <span className="text-[11px] font-mono tracking-wide text-rose-200/90 drop-shadow-xs">
                            Baliwasan, Zamboanga City
                        </span>
                    </div>
                </div>

                {/* ── RIGHT PANEL — Polished, Centered Login Form (5 cols on lg) ── */}
                <div className="flex h-full w-full items-center justify-center p-6 sm:p-10 lg:col-span-5 lg:p-12 xl:p-16 bg-background">
                    <div className="w-full max-w-sm space-y-6">
                        {/* Mobile logo header */}
                        <Link
                            href={home()}
                            className="relative z-20 mb-2 flex items-center justify-center gap-2.5 lg:hidden"
                        >
                            <AppLogoIcon className="h-11 w-11" />
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                    College of Education
                                </span>
                                <span className="text-base font-bold tracking-tight text-foreground">
                                    Faculty Management
                                </span>
                            </div>
                        </Link>

                        <div className="flex flex-col space-y-1.5 text-left">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                {title || 'Welcome back'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {description || 'Sign in with your institutional account to continue'}
                            </p>
                        </div>

                        {children}

                        {/* Subtle Security Badge */}
                        <div className="border-t pt-4 text-center">
                            <p className="text-[11px] text-muted-foreground">
                                Western Mindanao State University • Secure Academic Portal
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
