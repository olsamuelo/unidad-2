import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Extrae el usuario autenticado (adjuntado por JwtStrategy) del request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
