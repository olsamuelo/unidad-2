import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
}

/**
 * CRUD de usuarios. Todas las rutas exigen JWT válido Y rol ADMIN
 * (JwtAuthGuard autentica, RolesGuard exige el rol via @Roles('ADMIN')).
 * Así, un usuario normal recibe 403 Forbidden si intenta usarlas.
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos los usuarios (solo ADMIN)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de usuarios obtenida exitosamente.' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un usuario por id (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario encontrado exitosamente.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crea un usuario administrador o normal (solo ADMIN)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos inválidos.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'El correo ya está registrado.' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza un usuario por ID (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del usuario a actualizar', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario actualizado exitosamente.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'El correo ya está registrado.' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No puedes quitarte tu propio rol de administrador.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    if (currentUser.id === id && dto.role && dto.role !== 'ADMIN') {
      throw new ForbiddenException('No puedes quitarte tu propio rol de administrador');
    }
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un usuario por ID (solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar', type: Number })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Usuario eliminado exitosamente.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado.' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No puedes eliminar tu propia cuenta.',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    if (currentUser.id === id) {
      throw new ForbiddenException('No puedes eliminar tu propia cuenta');
    }
    await this.usersService.remove(id);
  }
}
