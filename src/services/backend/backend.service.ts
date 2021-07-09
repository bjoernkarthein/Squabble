import { HttpClient } from '@angular/common/http';
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

  public getAuthors() {
    return this.http.get<any>('/api/authors');
  }

  public getUsers() {
    return this.http.get<any>('/api/users');
  }

  public getUser(id: number) {
    return this.http.get<any>('/api/users');
  }

  public createUser(user: User) {
    // Check if user already exists
    this.http.get<any>('api/users/' + user.id);
  }
}

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
}
