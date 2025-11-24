
const CLOUDFRONT_DOMAIN = process.env.REACT_APP_CLOUDFRONT_URL;
console.log(CLOUDFRONT_DOMAIN);


/**
 * Construye la URL de CloudFront para solicitar la imagen con transformaciones.
 * @param {string} s3Path - El path del objeto S3 devuelto por el backend (ej: "/local/courses/27.jpg").
 * @param {number} [width=400] - Ancho deseado de la imagen.
 * @param {number} [quality=80] - Calidad deseada (0-100).
 * @returns {string} La URL completa de CloudFront.
 */
export const getImageUrl = (s3Path, width = 400, quality = 80) => {
    if (!s3Path) {
        return ""; // O una URL de imagen de fallback
    }

    // 2. Limpia el path eliminando la barra inicial (/) si existe.
    const cleanPath = s3Path.startsWith("/") ? s3Path.substring(1) : s3Path;

    // 3. Define los parámetros de transformación
    const params = new URLSearchParams({
        w: width, // Parámetro de ancho
        q: quality, // Parámetro de calidad
        // Puedes añadir 'f: "webp"' para optimizar el formato en navegadores compatibles
    }).toString();

    // 4. Concatena todo: Dominio + Path del curso + Parámetros
    return `${ CLOUDFRONT_DOMAIN }/${cleanPath}?${params}`;
};