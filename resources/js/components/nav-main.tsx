import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import type { NavGroup } from '@/types';

export function NavMain({ groups }: { groups: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { isEnabled } = useFeatureFlags();
    const isCollapsibleEnabled = isEnabled('nav-group-collapsable');

    return (
        <>
            {groups.map((group) => {
                const hasActiveItem = group.items.some((item) => isCurrentUrl(item.href));

                if (isCollapsibleEnabled) {
                    return (
                        <Collapsible
                            key={group.title}
                            defaultOpen={hasActiveItem}
                            className="group/collapsible"
                        >
                            <SidebarGroup className="px-2 py-0">
                                <CollapsibleTrigger asChild>
                                    <SidebarGroupLabel className="flex w-full cursor-pointer items-center justify-between pr-2 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white [&[data-state=open]>svg]:rotate-90">
                                        {group.title}
                                        <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                    </SidebarGroupLabel>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenu>
                                        {group.items.map((item) => (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isCurrentUrl(item.href)}
                                                    tooltip={{ children: item.title }}
                                                >
                                                    <Link href={item.href} prefetch>
                                                        {item.icon && <item.icon />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    );
                }

                // Non-collapsible version (feature flag disabled)
                return (
                    <SidebarGroup key={group.title} className="px-2 py-0">
                        <SidebarGroupLabel className="flex w-full items-center justify-between pr-2 py-2 text-xs font-semibold uppercase tracking-wider text-white/70">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                );
            })}
        </>
    );
}
