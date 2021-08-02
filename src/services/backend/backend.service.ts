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

  public async getRandomUser(uId: number) {
    return await this.http.get<any>('/api/users/random/' + uId).toPromise();
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

  public async getQuizAttemptById(attemptId: number) {
    return await this.http.get<any>('/api/single_player_attempts/' + attemptId).toPromise();
  }

  public async getQuizAttemptsByUsername(username: string) {
    return await this.http.get<any>('/api/single_player_attempts/user/' + username).toPromise();
  }

  public async getQuizAttemptsByQuizId(quizId: string) {
    return await this.http.get<any>('/api/single_player_attempts/quiz/' + quizId).toPromise();
  }

  public async saveSinglePlayerAttempt(spa: SinglePlayerAttempt) {
    const res = await this.getQuizAttemptById(spa.attemptId);
    console.log(res);
    if (res.length > 0) {
      return;
    }
    this.http.post('/api/single_player_attempts', { spa }, this.httpOptions).subscribe(response => {
      console.log(response);
    });
  }

  public async getMultiPlayerAttemptsByCourseAndUser(courseId: string, userId: number): Promise<MultiPlayerAttempt[]> {
    return await this.http.get<any>('/api/multi_player_attempts/course/' + courseId + '/user/' + userId).toPromise();
  }

  public async saveMultiPlayerAttempt(mpa: MultiPlayerAttempt) {
    this.http.post('/api/multi_player_attempts', { mpa }, this.httpOptions).subscribe(response => {
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

export interface SinglePlayerAttempt {
  attemptId: number;
  userId: number;
  usename: string;
  quizId: string;
  quizname?: string;
  totalPoints?: number;
  grade?: number;
  startDate?: string;
  endDate?: string;
}

export interface MultiPlayerAttempt {
  gameId?: number;
  initiatorId: number;
  opponentId: number;
  courseId: string;
  inProgress: boolean;
  currentRound?: number;
  nextTurnId?: number;
  questionIndex?: number;
}
