import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Marca un endpoint con los roles permitidos, leídos luego por RolesGuard. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
