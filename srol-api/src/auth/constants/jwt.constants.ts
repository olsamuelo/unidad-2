/**
 * Configuración centralizada del JWT.
 * Se usa tanto al firmar tokens (AuthModule) como al validarlos (JwtStrategy),
 * evitando que el secreto quede duplicado en dos archivos distintos.
 */
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'una_clave_secreta_larga_para_jwt_gir6091',
  expiresIn: '8h',
};
