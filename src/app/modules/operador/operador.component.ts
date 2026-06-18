import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../core/Services/Cliente.service';
import { Cliente } from '../../core/Models/Cliente.model';
import { MedidorService } from '../../core/Services/Medidor.service';
import { medidor } from '../../core/Models/medidor.model';
import { LecturaService } from '../../core/Services/Lectura.service';
import { Lectura } from '../../core/Models/lectura.model';
import { ReporteDanoService } from '../../core/Services/ReporteDano.service';
import { ReporteDano } from '../../core/Models/ReporteDano.model';
import { TokenService } from '../../core/Services/Token.service';
import { OperadorService } from '../../core/Services/Operador.service';

@Component({
  selector: 'app-operador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operador.component.html',
  styleUrls: ['./operador.component.scss']
})
export class OperadorComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  filtro: string = '';

  operadorActual: any = null;

  selectedCliente: Cliente | null = null;
  medidorCliente: any | null = null; // using any to bypass frontend typing issues for backend properties
  
  activeTab: string = 'lecturas';

  // LECTURAS
  lecturas: any[] = [];
  mostrarModalLectura = false;
  nuevaLectura: any = {
    valorActual: 0,
    fechaToma: new Date().toISOString().split('T')[0],
    idMedidor: 0,
    observaciones: 'Sin observaciones'
  };

  // DAÑOS
  danos: ReporteDano[] = [];
  mostrarModalDano = false;
  nuevoDano: ReporteDano = {
    descripcion: '',
    fechaReporte: new Date().toISOString().split('T')[0],
    estadoReparacion: 'Pendiente'
  };

  constructor(
    private clienteService: ClienteService,
    private medidorService: MedidorService,
    private lecturaService: LecturaService,
    private reporteDanoService: ReporteDanoService,
    private tokenService: TokenService,
    private operadorService: OperadorService
  ) {}

  ngOnInit(): void {
    this.cargarOperador();
    this.cargarClientes();
  }

  cargarOperador() {
    const email = this.tokenService.getUserEmail();
    if (email) {
      this.operadorService.obtenerPorCorreo(email).subscribe({
        next: (op) => this.operadorActual = op,
        error: (err) => console.error('Error al cargar operador actual', err)
      });
    }
  }

  cargarClientes() {
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filtrarClientes();
      },
      error: (err) => console.error('Error al cargar clientes', err)
    });
  }

  filtrarClientes() {
    if (!this.filtro.trim()) {
      this.clientesFiltrados = this.clientes;
      return;
    }
    const filter = this.filtro.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c => 
      c.nombre?.toLowerCase().includes(filter) ||
      c.cedula?.toString().includes(filter)
    );
  }

  abrirExpediente(cliente: Cliente) {
    this.selectedCliente = cliente;
    this.medidorCliente = null;
    this.lecturas = [];
    this.danos = [];
    this.activeTab = 'lecturas';

    this.medidorService.listar().subscribe({
      next: (medidores) => {
        const found = medidores.find((m: any) => m.cliente && (m.cliente.id_cli === cliente.id_cli || m.cliente.id === cliente.id_cli || m.cliente.id === cliente.id));
        if (found) {
          this.medidorCliente = found;
          this.cargarLecturas();
          this.cargarDanos();
        } else {
          console.warn('Este cliente no tiene medidor asignado.');
        }
      },
      error: (err) => console.error('Error al cargar medidores', err)
    });
  }

  cerrarExpediente() {
    this.selectedCliente = null;
    this.medidorCliente = null;
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  // --- CRUD LECTURAS ---
  cargarLecturas() {
    if (!this.medidorCliente) return;
    const idMed = this.medidorCliente.id_med || this.medidorCliente.id;
    this.lecturaService.buscarPorMedidor(idMed).subscribe({
      next: (data: any) => this.lecturas = data,
      error: (err: any) => console.error('Error al cargar lecturas', err)
    });
  }

  abrirRegistroLectura() {
    let valorAnterior = 0;
    if (this.lecturas.length > 0) {
       const ultima = this.lecturas.sort((a,b) => new Date(b.fechaLectura || b.fechaToma).getTime() - new Date(a.fechaLectura || a.fechaToma).getTime())[0];
       valorAnterior = ultima.valorActual || ultima.valorLectura || 0;
    } else if (this.medidorCliente && this.medidorCliente.cliente && this.medidorCliente.cliente.lectura) {
       valorAnterior = this.medidorCliente.cliente.lectura;
    } else if (this.selectedCliente && this.selectedCliente.lectura) {
       valorAnterior = this.selectedCliente.lectura;
    }

    const idMed = this.medidorCliente.id_med || this.medidorCliente.id;
    this.nuevaLectura = {
      valorAnterior: valorAnterior,
      valorLectura: 0,
      valorActual: 0, // Fallback for frontend binding
      consumoM3: 0,
      fechaToma: new Date().toISOString().split('T')[0],
      idMedidor: idMed,
      zona: 'Sin reporte',
      observaciones: 'Ninguna'
    };
    this.mostrarModalLectura = true;
  }

  calcularConsumo() {
    this.nuevaLectura.valorLectura = this.nuevaLectura.valorActual;
    this.nuevaLectura.consumoM3 = Math.max(0, this.nuevaLectura.valorActual - this.nuevaLectura.valorAnterior);
  }

  guardarLectura() {
    this.lecturaService.crear(this.nuevaLectura).subscribe({
      next: () => {
        this.mostrarModalLectura = false;
        this.cargarLecturas();
        alert('Lectura registrada y factura generada con éxito.');
      },
      error: (err: any) => {
        console.error('Error al guardar lectura', err);
        alert('Ocurrió un error al registrar la lectura.');
      }
    });
  }

  // --- CRUD DAÑOS ---
  cargarDanos() {
    if (!this.medidorCliente) return;
    const idMed = this.medidorCliente.id_med || this.medidorCliente.id;
    this.reporteDanoService.listarPorMedidor(idMed).subscribe({
      next: (data) => this.danos = data,
      error: (err) => console.error('Error al cargar daños', err)
    });
  }

  abrirRegistroDano() {
    const idMed = this.medidorCliente.id_med || this.medidorCliente.id;
    const idOp = this.operadorActual ? this.operadorActual.id_oper : 1;
    this.nuevoDano = {
      descripcion: '',
      fechaReporte: new Date().toISOString().split('T')[0],
      estadoReparacion: 'Pendiente',
      medidor: { id_med: idMed },
      operador: { id_oper: idOp } 
    };
    this.mostrarModalDano = true;
  }

  guardarDano() {
    this.reporteDanoService.crear(this.nuevoDano).subscribe({
      next: () => {
        this.mostrarModalDano = false;
        this.cargarDanos();
        alert('Daño reportado con éxito.');
      },
      error: (err) => {
        console.error('Error al reportar daño', err);
        alert('Ocurrió un error al reportar el daño.');
      }
    });
  }

  eliminarDano(id: number) {
    if(confirm('¿Está seguro de eliminar este reporte de daño?')) {
      this.reporteDanoService.eliminar(id).subscribe({
        next: () => {
          this.cargarDanos();
        },
        error: (err) => console.error('Error al eliminar daño', err)
      });
    }
  }
}