// types.ts
export interface Servicio {
  id_servicio: number;
  nombre: string;
  precio: number;
  duracion: number;  // ojo que aquí se llama 'duracion' y no 'duracion_estimada'
  tipo: string;
    duracion_estimada?: number; // Agrega esta propiedad con el tipo correcto (number)

}
