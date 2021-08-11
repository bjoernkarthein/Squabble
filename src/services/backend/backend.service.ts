import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MoodleQuestionType } from '../parser/question-parser.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  public startGame = new BehaviorSubject<any>(null);

  private httpOptions = {
    headers: new HttpHeaders({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  //TODO: Possibly change type any to interface for the important calls?
  public getAllTables() {
    return this.http.get<any>('/api').toPromise();
  }

  public getUsers() {
    return this.http.get<any>('/api/users').toPromise();
  }

  public getUser(id: number) {
    return this.http.get<any>('/api/users/' + id).toPromise();
  }

  public async getRandomOpponentFromCourse(uId: number, cId: string) {
    return await this.http.get<any>('/api/users/random/currentUser/' + uId + '/course/' + cId).toPromise();
  }

  public async getAllOtherUsersFromCourse(uId: number, cId: string) {
    return await this.http.get<any>('/api/users/currentUser/' + uId + '/course/' + cId).toPromise();
  }

  public async createUser(user: User) {
    const existingUsers = await this.getUser(user.id);
    if (existingUsers.length > 0) {
      return;
    }

    await this.http.post('/api/users', { user }, this.httpOptions).toPromise();
  }

  public async getCourses() {
    return await this.http.get<any>('/api/courses').toPromise();
  }

  public async getCourse(id: number) {
    return await this.http.get<any>('/api/courses/' + id).toPromise();
  }

  public async saveCourse(course: Course) {
    const existingCourses = await this.getCourse(course.id);
    if (existingCourses.length > 0) {
      return;
    }

    await this.http.post('/api/courses', { course }, this.httpOptions).toPromise();
  }

  public async existsUserCourseMapping(courseId: number, userId: number) {
    const userCourseMappings = await this.http.get<any>('/api/user_courses/user/' + userId + '/course/' + courseId).toPromise();
    return userCourseMappings.length > 0;
  }

  public async saveUserCourseMapping(courseId: number, userId: number) {
    const alreadyExists = await this.existsUserCourseMapping(courseId, userId);
    if (alreadyExists) {
      return;
    }

    await this.http.post('/api/user_courses', { courseId, userId }, this.httpOptions).toPromise();
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

    if (res.length > 0) {
      return;
    }
    await this.http.post('/api/single_player_attempts', { spa }, this.httpOptions).toPromise();
  }

  public async getMultiPlayerAttemptsByCourseAndUser(courseId: string, userId: number): Promise<MultiPlayerAttempt[]> {
    return await this.http.get<any>('/api/multi_player_attempts/course/' + courseId + '/user/' + userId).toPromise();
  }

  public async getMultiPlayerAttemptById(attemptId: string): Promise<MultiPlayerAttempt> {
    const res = await this.http.get<any>('/api/multi_player_attempts/' + attemptId).toPromise();
    return res[0];
  }

  public async saveMultiPlayerAttempt(mpa: MultiPlayerAttempt) {
    await this.http.post('/api/multi_player_attempts', { mpa }, this.httpOptions).toPromise();
  }

  public async updateMultiPlayerAttempt(mpa: MultiPlayerAttempt) {
    await this.http.put('/api/multi_player_attempts', { mpa }, this.httpOptions).toPromise();
  }

  public async saveMultiPlayerQuestion(mpq: MultiPlayerQuestion) {
    await this.http.post('/api/multi_player_game_questions', { mpq }, this.httpOptions).toPromise();
  }

  public async updateMultiPlayerQuestion(mpq: MultiPlayerQuestion) {
    await this.http.put('/api/multi_player_game_questions', { mpq }, this.httpOptions).toPromise();
  }

  public async getMultiPlayerQuestions(gameId: string, roundId: number) {
    return await this.http.get<any>('/api/multi_player_game_questions/' + gameId + '/round/' + roundId).toPromise();
  }

  public async saveMultiPlayerAnswer(multiPlayerAnswers: MultiPlayerAnswer[]) {
    for (const mpa of multiPlayerAnswers) {
      await this.http.post('/api/multi_player_game_answers', { mpa }, this.httpOptions).toPromise();
    }
  }

  public async sendInvitationMail(inviter: User, user: User) {
    await this.http.post('/api/send_mail', { inviter, user }, this.httpOptions).toPromise();
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

export interface Course {
  id: number;
  name: string;
  description: string;
  quizCount?: number;
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
  turns: number;
  questionsAreSet: boolean;
  initiatorPoints?: number;
  opponentPoints?: number;
}

export interface MultiPlayerQuestion {
  gameId: number;
  attemptId: number;
  roundNumber: number;
  questionSlot: number;
  question: MoodleQuestionType;
  rightAnswers?: string;
  playerOneRight?: boolean;
  playerTwoRight?: boolean;
}

export interface MultiPlayerAnswer {
  gameId: number;
  roundNumber: number;
  questionSlot: number;
  answerOption: string;
  answerValue: string;
}
