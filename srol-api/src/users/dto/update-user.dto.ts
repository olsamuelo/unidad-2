import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * Igual que CreateUserDto pero con todos los campos opcionales:
 * al editar un usuario, el admin puede cambiar solo lo que necesite
 * (por ejemplo, el rol, sin tocar la contraseña).
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
