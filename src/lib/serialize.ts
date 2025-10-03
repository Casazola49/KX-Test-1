/**
 * Utilidades para serializar datos de Firebase y evitar errores de hidratación
 */

/**
 * Serializa recursivamente un objeto, convirtiendo timestamps de Firebase
 * y otros objetos complejos a valores simples
 */
export function serializeFirebaseData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeFirebaseData(item)) as T;
  }

  // Si el objeto tiene un método toJSON, usarlo
  if (typeof (data as any).toJSON === 'function') {
    return (data as any).toJSON();
  }

  // Si es un timestamp de Firebase (tiene seconds y nanoseconds)
  if (typeof (data as any).seconds === 'number' && typeof (data as any).nanoseconds === 'number') {
    return new Date((data as any).seconds * 1000 + (data as any).nanoseconds / 1000000).toISOString() as T;
  }

  // Para objetos regulares, serializar recursivamente cada propiedad
  const serialized: any = {};
  for (const [key, value] of Object.entries(data)) {
    serialized[key] = serializeFirebaseData(value);
  }

  return serialized as T;
}

/**
 * Serializa específicamente los datos del podio
 */
export function serializePodiumData(podiumData: any) {
  return serializeFirebaseData(podiumData);
}