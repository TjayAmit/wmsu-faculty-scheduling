import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

interface User {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    auth: {
        user: User | null;
    };
    canRegister?: boolean;
    [key: string]: unknown;
}

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
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
            <div className="flex min-h-screen flex-col items-center bg-background px-4 py-6 text-foreground lg:justify-center lg:px-6 lg:py-8">
                <header className="mb-6 flex w-full max-w-[90vw] items-center justify-between text-sm not-has-[nav]:hidden">
                    <div className="flex items-center gap-3">
                        <img src="/wmsu_logo.png" alt="WMSU Logo" className="h-12 w-12" />
                        <div>
                            <p className="text-xs text-muted-foreground">College of Education</p>
                            <h1 className="text-sm font-bold">Faculty Scheduling System</h1>
                            <p className="text-[11px] italic text-muted-foreground">Western Mindanao State University</p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-lg border border-primary/20 bg-card px-5 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/10"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-lg border border-transparent px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-lg border border-primary/20 bg-card px-5 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/10"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full flex-1 flex-col items-center justify-center">
                    <main className="w-full max-w-5xl px-6 py-16 lg:py-24">
                        {/* Hero Section */}
                        <section className="mb-24 text-center">
                            <div className="mb-8 flex items-center justify-center gap-3">
                                <img src="/wmsu_logo.png" alt="WMSU" className="h-16 w-16 opacity-90" />
                                <div className="text-left">
                                    <p className="text-sm text-muted-foreground">Western Mindanao State University</p>
                                    <p className="font-semibold text-foreground">College of Education</p>
                                </div>
                            </div>

                            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground lg:text-7xl">
                                Faculty Scheduling
                                <span className="block text-muted-foreground">Simplified</span>
                            </h1>

                            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                                An integrated system for managing faculty profiles, organizing course schedules,
                                and optimizing academic resources across all departments.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                {!auth.user ? (
                                    <>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-8 py-4 text-base font-medium text-background transition-all hover:bg-foreground/90"
                                        >
                                            Sign In
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-8 py-4 text-base font-medium text-card-foreground transition-all hover:bg-accent"
                                        >
                                            Create Account
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-foreground px-8 py-4 text-base font-medium text-background transition-all hover:bg-foreground/90"
                                    >
                                        Go to Dashboard
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </section>

                        {/* Features - Clean List Style */}
                        <section className="mb-24">
                            <div className="grid gap-12 lg:grid-cols-3">
                                {/* Feature 1 */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
                                        <svg className="h-7 w-7 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-lg font-semibold text-foreground">Conflict-Free Scheduling</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        Automatic detection of overlapping schedules, room conflicts, and faculty availability issues before they become problems.
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
                                        <svg className="h-7 w-7 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-lg font-semibold text-foreground">Faculty Management</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        Comprehensive profiles tracking qualifications, specializations, preferences, and workload distribution across departments.
                                    </p>
                                </div>

                                {/* Feature 3 */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
                                        <svg className="h-7 w-7 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-lg font-semibold text-foreground">Resource Analytics</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        Data-driven insights on room utilization, faculty workload balance, and scheduling patterns to optimize operations.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Divider */}
                        <div className="mb-24 border-t border-border"></div>

                        {/* Simple Process */}
                        <section className="mb-16 text-center">
                            <h2 className="mb-4 text-2xl font-semibold text-foreground">Simple Process</h2>
                            <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
                                Three straightforward steps to efficient academic scheduling
                            </p>
                            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border font-medium text-foreground">1</span>
                                    <span className="text-muted-foreground">Define courses & faculty</span>
                                </div>
                                <svg className="hidden h-4 w-4 text-muted-foreground sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <div className="flex items-center gap-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border font-medium text-foreground">2</span>
                                    <span className="text-muted-foreground">Auto-resolve conflicts</span>
                                </div>
                                <svg className="hidden h-4 w-4 text-muted-foreground sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <div className="flex items-center gap-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border font-medium text-foreground">3</span>
                                    <span className="text-muted-foreground">Publish & notify</span>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>

                {/* Footer */}
                <footer className="mt-auto w-full border-t border-border bg-card py-6">
                    <div className="flex w-full flex-col items-center justify-between gap-4 px-4 sm:flex-row">
                        <div className="flex items-center gap-3">
                            <img src="/wmsu_logo.png" alt="WMSU Logo" className="h-10 w-10 opacity-80" />
                            <div className="text-sm">
                                <p className="font-semibold text-card-foreground">Western Mindanao State University</p>
                                <p className="text-xs text-muted-foreground">College of Education</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                            <span className="text-xs">© {new Date().getFullYear()} All rights reserved</span>
                            <Link href={login()} className="text-xs hover:text-foreground">Faculty Portal</Link>
                            <a href="https://wmsu.edu.ph" target="_blank" rel="noopener noreferrer" className="text-xs hover:text-foreground">WMSU Website</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
