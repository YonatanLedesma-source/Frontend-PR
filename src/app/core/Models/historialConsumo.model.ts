export interface HistorialConsumo {
    id_hiscon?: number;
    periodo: string;
    consumoM3?: number;
    costo?: number;
    fechaLectura?: string;
    id_cli?: number;
    cliente?: any;

    idConsumo?: number;
    idMedidor?: number;
    lecturaActual?: number;
    metrosConsumidos?: number;
    valorTotal?: number;
}