import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }

  //TODO: Possibly change type any to interface for the important calls?
  public getAllTables() {
    return this.http.get<any>('/api');
  }

  public getUsers() {
    return this.http.get<any>('/api/users');
  }

  public getUser(id: number) {
    return this.http.get<any>('/api/users/' + id);
  }

  public createUser(user: User) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    this.getUser(user.id).subscribe(response => {
      if (response.length > 0) {
        return;
      }
      this.http.post('api/users', { user }, httpOptions);
    });
  }
}

export interface User {
  id: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
}
