import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { CalendarCheckIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';
import { StackIcon } from '@phosphor-icons/react/dist/ssr/Stack';
import { StorefrontIcon } from '@phosphor-icons/react/dist/ssr/Storefront';
import { TagIcon } from '@phosphor-icons/react/dist/ssr/Tag';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

export const navIcons = {
  'calendar-check': CalendarCheckIcon,
  'chart-pie': ChartPieIcon,
  'check-circle': CheckCircleIcon,
  'gear-six': GearSixIcon,
  package: PackageIcon,
  stack: StackIcon,
  storefront: StorefrontIcon,
  tag: TagIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;
