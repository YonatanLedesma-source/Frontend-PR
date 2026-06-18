import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../Environments/environments';
import { Operador } from '../Models/operador.model';

@Injectable({ providedIn: 'root' })
export class OperadorService {
    private url = `${environment.apiUrl}/operadores`;

    constructor(private http: HttpClient) {}

    listar() {
        return this.http.get<Operador[]>(this.url);
    }

    crear(operador: Operador) {
        return this.http.post<Operador>(this.url, operador);
    }

    obtenerPorCorreo(correo: string) {
        return this.http.get<Operador>(`${this.url}/correo/${correo}`);
    }

    eliminar(id: number) {
        return this.http.delete(`${this.url}/${id}`);
    }
}