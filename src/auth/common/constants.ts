export const jwtConstants = {
    secret: process.env.JWT_SECRET || 'secretKey', // Cambia esto en producción!
    expiresIn: process.env.JWT_EXPIRES_IN || '60m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};