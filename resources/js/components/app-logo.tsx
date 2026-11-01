import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-white/20 p-1">
                <AppLogoIcon className="size-full object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-white">
                    Faculty Scheduling
                </span>
                <span className="text-[10px] text-white/75">
                    Western Mindanao State University
                </span>
            </div>
        </>
    );
}
