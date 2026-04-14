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
            <div className="relative hidden h-full flex-col items-center justify-center overflow-hidden bg-muted p-12 lg:flex">
                {/* Subtle Background Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                    }}
                />

                {/* Center Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Large Logo */}
                    <div className="mb-8">
                        <AppLogoIcon className="h-24 w-24 object-contain opacity-90" />
                    </div>

                    {/* Institution Name */}
                    <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
                        Western Mindanao State University
                    </h2>
                    <p className="mb-6 text-sm font-medium text-muted-foreground">
                        College of Education
                    </p>

                    {/* System Name */}
                    <div className="rounded-full border border-border bg-card px-6 py-2">
                        <span className="text-sm font-semibold text-foreground">{name as string}</span>
                    </div>
                </div>

                {/* Bottom Quote */}
                <div className="absolute bottom-12 left-0 right-0 px-12 text-center">
                    <p className="text-xs italic text-muted-foreground">
                        "Excellence in Education, Research, and Service"
                    </p>
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
