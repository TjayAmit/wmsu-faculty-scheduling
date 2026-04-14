import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col overflow-hidden bg-muted p-10 text-foreground lg:flex">
                {/* Logo & Brand */}
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-3"
                >
                    <AppLogoIcon className="h-10 w-10 object-contain" />
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted-foreground">College of Education</span>
                        <span className="font-semibold text-foreground">{name as string}</span>
                        <span className="text-[10px] italic text-muted-foreground">Western Mindanao State University</span>
                    </div>
                </Link>

                {/* Main Content */}
                <div className="relative z-20 mt-auto flex flex-1 flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                            Faculty Scheduling
                            <span className="block text-muted-foreground">System</span>
                        </h2>
                        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                            Manage faculty profiles, organize course schedules, and optimize academic resources across all departments.
                        </p>
                    </div>

                    {/* Feature List */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-foreground">Conflict Detection</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-foreground">Room Optimization</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-foreground">Faculty Profiles</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
