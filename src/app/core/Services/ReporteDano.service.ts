import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteDano } from '../Models/ReporteDano.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteDanoService {
  private url = 'http://localhost:8081/api/danos';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<ReporteDano[]> {
    return this.http.get<ReporteDano[]>(this.url);
  }

  listarPorMedidor(idMedidor: number): Observable<ReporteDano[]> {
    return this.http.get<ReporteDano[]>(`${this.url}/medidor/${idMedidor}`);
  }

  obtenerPorId(id: number): Observable<ReporteDano> {
    return this.http.get<ReporteDano>(`${this.url}/${id}`);
  }

  crear(reporte: ReporteDano): Observable<ReporteDano> {
    return this.http.post<ReporteDano>(this.url, reporte);
  }

  actualizar(id: number, reporte: ReporteDano): Observable<ReporteDano> {
    return this.http.put<ReporteDano>(`${this.url}/${id}`, reporte);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
