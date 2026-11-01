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
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative grid min-h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
                {/* ── LEFT PANEL — Full edge-to-edge WMSU College of Education architectural hero ── */}
                <div className="relative hidden h-full w-full flex-col justify-between overflow-hidden bg-[#3b0207] p-10 lg:flex select-none">
                    {/* Full Edge-to-Edge Architectural Photo (no top/bottom black padding) */}
                    <img
                        src="/wmsu_college_of_education.jpg"
                        alt="WMSU College of Education"
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
                    />

                    {/* Smooth, professional collegiate gradient: rich maroon shadow on the left to make text pop, clear fade to the right so the building and grounds remain naturally bright and visible */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                    <div className="pointer-events-none absolute inset-0 bg-[#800000]/20 mix-blend-multiply" />

                    {/* ── Top Header: University & College Identity ── */}
                    <Link href={home()} className="relative z-20 flex items-center gap-3.5 w-fit group">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur-md shadow-md transition-transform group-hover:scale-105">
                            <AppLogoIcon className="w-12 drop-shadow-md" />
                        </div>
                        <div className="flex flex-col drop-shadow-sm">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-200">
                                College of Education
                            </span>
                            <span className="text-lg font-bold tracking-tight text-white leading-tight">
                                {name as string}
                            </span>
                            <span className="text-xs text-zinc-200">
                                Western Mindanao State University
                            </span>
                        </div>
                    </Link>

                    {/* ── Center Content: Clean, professional typography directly on the pane (NO containers, NO badges, NO checkmark bullets) ── */}
                    <div className="relative z-20 my-auto max-w-lg py-12">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight drop-shadow-md">
                            Faculty Scheduling <br />
                            <span className="font-light text-rose-100">Management System</span>
                        </h2>

                        <p className="mt-5 text-base leading-relaxed text-zinc-100/90 drop-shadow-sm">
                            Empowering academic excellence through organized faculty timetables, streamlined room assignments, and conflict-free collegiate scheduling.
                        </p>
                    </div>

                    {/* ── Footer: Institutional Attribution ── */}
                    <div className="relative z-20 flex items-center justify-between border-t border-white/20 pt-6 text-xs text-zinc-200 font-medium">
                        <p className="drop-shadow-xs">
                            &copy; {new Date().getFullYear()} Western Mindanao State University
                        </p>
                        <span className="text-[11px] font-mono tracking-wide text-zinc-200/90 drop-shadow-xs">
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
