import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private httpOptions = {
    headers: new HttpHeaders({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json'
    })
  };

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
    this.getUser(user.id).subscribe(response => {
      if (response.length > 0) {
        return;
      }
      console.log('here');
      this.http.post('/api/users', { user }, this.httpOptions).subscribe(res => {
        console.log(res);
      });
    });
  }

  public async getAttempt(quizId: string) {
    return await this.http.get<any>('/api/webuserattempts/' + quizId).toPromise();
  }

  public async createAttempt(quizId: string, attemptId: number) {
    const res = await this.getAttempt(quizId);
    console.log(res);
    if (res.length > 0) {
      return;
    }
    this.http.post('/api/webuserattempts', { quizId, attemptId }, this.httpOptions).subscribe(response => {
      console.log(response);
    });
  }
}

export interface User {
  id: number;
  email?: string;
  token?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  loggedIn?: boolean;
}
