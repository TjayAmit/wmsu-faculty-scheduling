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
                    <main className="w-full max-w-6xl px-4 py-12 lg:py-16">
                        {/* Hero Section */}
                        <section className="relative mb-20 overflow-hidden rounded-3xl p-8 lg:p-16">
                            <div className="relative z-10 mx-auto max-w-3xl text-center">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                                    <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                                    WMSU College of Education
                                </div>
                                <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                                    Faculty Scheduling
                                    <span className="mt-2 block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                        Made Simple
                                    </span>
                                </h1>
                                <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
                                    Streamline faculty management with comprehensive profiling, subject scheduling,
                                    and resource allocation for Western Mindanao University.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    {!auth.user ? (
                                        <>
                                            <Link
                                                href={login()}
                                                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            >
                                                Get Started
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </Link>
                                            <Link
                                                href={register()}
                                                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-base font-medium text-card-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground"
                                            >
                                                Create Account
                                            </Link>
                                        </>
                                    ) : (
                                        <Link
                                            href={dashboard()}
                                            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
                                        >
                                            Go to Dashboard
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Bento Features Grid */}
                        <section className="mb-20">
                            <div className="mb-12 text-center">
                                <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                                    Everything You Need
                                </h2>
                                <p className="mx-auto max-w-lg text-muted-foreground">
                                    Powerful tools designed specifically for academic scheduling workflows
                                </p>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
                                {/* Large Feature Card */}
                                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg lg:col-span-2 lg:row-span-2 lg:p-8">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-card-foreground lg:text-2xl">Intelligent Scheduling</h3>
                                    <p className="mb-6 text-muted-foreground lg:text-base">
                                        Advanced conflict detection prevents double-booking and room overlaps. The system automatically suggests optimal time slots based on faculty availability, course requirements, and room capacity.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Auto-detect Conflicts</span>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Smart Suggestions</span>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Room Optimization</span>
                                    </div>
                                </div>

                                {/* Faculty Card */}
                                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">Faculty Profiles</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Complete faculty records with qualifications, specializations, and workload tracking.
                                    </p>
                                </div>

                                {/* Analytics Card */}
                                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">Analytics</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Real-time insights into room utilization, faculty workload, and scheduling efficiency.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* How It Works */}
                        <section className="mb-20 rounded-2xl border border-border bg-card p-8 lg:p-12">
                            <h2 className="mb-10 text-center text-2xl font-bold text-card-foreground lg:text-3xl">How It Works</h2>
                            <div className="grid gap-8 sm:grid-cols-3">
                                <div className="relative text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">1</div>
                                    <h4 className="mb-2 font-semibold text-card-foreground">Create Schedule</h4>
                                    <p className="text-sm text-muted-foreground">Input courses, assign faculty, and select preferred time slots</p>
                                </div>
                                <div className="relative text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">2</div>
                                    <h4 className="mb-2 font-semibold text-card-foreground">Detect Conflicts</h4>
                                    <p className="text-sm text-muted-foreground">System automatically flags overlapping schedules and suggests fixes</p>
                                </div>
                                <div className="relative text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">3</div>
                                    <h4 className="mb-2 font-semibold text-card-foreground">Publish & Share</h4>
                                    <p className="text-sm text-muted-foreground">Finalize and distribute schedules to faculty and students</p>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
