import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from 'src/schemas/users/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, denegar por defecto (opcional)
    if (!requiredRoles || requiredRoles.length === 0) {
      throw new ForbiddenException(
        'Este recurso requiere roles específicos, pero no se definieron roles necesarios.',
      );
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException(
        'No se encontró información de roles en tu token de autenticación.',
      );
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Requieres uno de estos roles: ${requiredRoles.join(', ')}. Tu rol actual: ${user.roles.join(', ')}`,
      );
    }

    return true;
  }
}