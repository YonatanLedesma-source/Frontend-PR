export interface Financiacion {
    id_finan?: number; // Coincide exactamente con tu entidad de Spring Boot
    concepto: string;
    numero_cuotas?: number; // Para compatibilidad
    numeroCuotas?: number;
    montoTotal?: number;
    cuotaMensual?: number;
    saldoPendiente?: number;
}