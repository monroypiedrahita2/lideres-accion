import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LugaresService {
  private apiUrlDepartamentos = 'https://api-colombia.com/api/v1/Department';
  private readonly apiUrlMunicipios = 'https://api-colombia.com/api/v1/Department/';

  constructor(private readonly http: HttpClient) { }

  getDepartamentos(): Observable<any> {
    return this.http.get<any>(this.apiUrlDepartamentos);
  }
  getMunicipios(departamento_id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlMunicipios}${departamento_id}/cities`);
  }
}
