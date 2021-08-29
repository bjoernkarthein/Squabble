import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MoodleQuestionType } from '../parser/question-parser.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  public startGame = new BehaviorSubject<any>(null);
  public refreshList = new BehaviorSubject<boolean>(true);

  private APIUrl = 'https://squabble-api.herokuapp.com';

  private httpOptions = {
    headers: new HttpHeaders({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  public getAllTables() {
    return this.http.get<any>(this.APIUrl).toPromise();
  }

  public getUsers() {
    return this.http.get<any>(this.APIUrl + '/users').toPromise();
  }

  public getUser(id: number) {
    return this.http.get<any>(this.APIUrl + '/users/' + id).toPromise();
  }

  public async getRandomOpponentFromCourse(uId: number, cId: string) {
    return await this.http.get<any>(this.APIUrl + '/users/random/currentUser/' + uId + '/course/' + cId).toPromise();
  }

  public async getAllOtherUsersFromCourse(uId: number, cId: string) {
    return await this.http.get<any>(this.APIUrl + '/users/currentUser/' + uId + '/course/' + cId).toPromise();
  }

  public async createUser(user: User) {
    const existingUsers = await this.getUser(user.id);
    if (existingUsers.length > 0) {
      return;
    }

    await this.http.post(this.APIUrl + '/users', { user }, this.httpOptions).toPromise();
  }

  public async getCourses() {
    return await this.http.get<any>(this.APIUrl + '/courses').toPromise();
  }

  public async getCourse(id: number) {
    return await this.http.get<any>(this.APIUrl + '/courses/' + id).toPromise();
  }

  public async saveCourse(course: Course) {
    const existingCourses = await this.getCourse(course.id);
    if (existingCourses.length > 0) {
      return;
    }

    await this.http.post(this.APIUrl + '/courses', { course }, this.httpOptions).toPromise();
  }

  public async existsUserCourseMapping(courseId: number, userId: number) {
    const userCourseMappings = await this.http.get<any>(this.APIUrl + '/user_courses/user/' + userId + '/course/' + courseId).toPromise();
    return userCourseMappings.length > 0;
  }

  public async saveUserCourseMapping(courseId: number, userId: number) {
    const alreadyExists = await this.existsUserCourseMapping(courseId, userId);
    if (alreadyExists) {
      return;
    }

    await this.http.post(this.APIUrl + '/user_courses', { courseId, userId }, this.httpOptions).toPromise();
  }

  public async getQuizAttemptById(attemptId: number) {
    return await this.http.get<any>(this.APIUrl + '/single_player_attempts/' + attemptId).toPromise();
  }

  public async getQuizAttemptsByUsername(username: string) {
    return await this.http.get<any>(this.APIUrl + '/single_player_attempts/user/' + username).toPromise();
  }

  public async getQuizAttemptsByQuizId(quizId: string) {
    return await this.http.get<any>(this.APIUrl + '/single_player_attempts/quiz/' + quizId).toPromise();
  }

  public async saveSinglePlayerAttempt(spa: SinglePlayerAttempt) {
    const res = await this.getQuizAttemptById(spa.attemptId);

    if (res.length > 0) {
      return;
    }
    await this.http.post(this.APIUrl + '/single_player_attempts', { spa }, this.httpOptions).toPromise();
  }

  public async getMultiPlayerAttemptsByCourseAndUser(courseId: string, userId: number): Promise<MultiPlayerAttempt[]> {
    return await this.http.get<any>(this.APIUrl + '/multi_player_attempts/course/' + courseId + '/user/' + userId).toPromise();
  }

  public async getMultiPlayerAttemptById(attemptId: string): Promise<MultiPlayerAttempt> {
    const res = await this.http.get<any>(this.APIUrl + '/multi_player_attempts/' + attemptId).toPromise();
    return res[0];
  }

  public async saveMultiPlayerAttempt(mpa: MultiPlayerAttempt) {
    await this.http.post(this.APIUrl + '/multi_player_attempts', { mpa }, this.httpOptions).toPromise();
  }

  public async updateMultiPlayerAttempt(mpa: MultiPlayerAttempt) {
    await this.http.put(this.APIUrl + '/multi_player_attempts', { mpa }, this.httpOptions).toPromise();
  }

  public async saveMultiPlayerQuestion(mpq: MultiPlayerQuestion) {
    await this.http.post(this.APIUrl + '/multi_player_game_questions', { mpq }, this.httpOptions).toPromise();
  }

  public async updateMultiPlayerQuestion(mpq: MultiPlayerQuestion) {
    await this.http.put(this.APIUrl + '/multi_player_game_questions', { mpq }, this.httpOptions).toPromise();
  }

  public async getMultiPlayerQuestions(gameId: string, roundId: number) {
    return await this.http.get<any>(this.APIUrl + '/multi_player_game_questions/' + gameId + '/round/' + roundId).toPromise();
  }

  public async saveMultiPlayerAnswer(multiPlayerAnswers: MultiPlayerAnswer[]) {
    for (const mpa of multiPlayerAnswers) {
      await this.http.post(this.APIUrl + '/multi_player_game_answers', { mpa }, this.httpOptions).toPromise();
    }
  }

  public async getMultiPlayerStatisticById(userId: number, courseId: number) {
    return await this.http.get<any>(this.APIUrl + '/multi_player_statistics/user/' + userId + '/course/' + courseId).toPromise();
  }

  public async getMultiPlayerStatisticByCourseId(courseId: string) {
    return await this.http.get<any>(this.APIUrl + '/multi_player_statistics/course/' + courseId).toPromise();
  }

  public async addMultiPlayerStatistic(statistic: MultiPlayerStatistic) {
    const existingStatistics = await this.getMultiPlayerStatisticById(statistic.userId, statistic.courseId);
    if (existingStatistics.length > 0) {
      return;
    }
    await this.http.post(this.APIUrl + '/multi_player_statistics', { statistic }, this.httpOptions).toPromise();
  }

  public async updateMultiPlayerStatistic(statistic: MultiPlayerStatistic) {
    await this.http.put(this.APIUrl + '/multi_player_statistics', { statistic }, this.httpOptions).toPromise();
  }

  public async sendInvitationMail(inviter: User, user: User) {
    await this.http.post(this.APIUrl + '/send_mail', { inviter, user }, this.httpOptions).toPromise();
  }
}

/**
 * interface for the User type
 * id: unique moodle user id
 * email: user email
 * token: the users token for the student webservice in moodle
 * firstname: users first name
 * lastname: users last name
 * username: users user name
 * loggedIn: if the user is currently logged in or not
 * profileimageurlsmall: users small profile image url
 * profileimageurl: users normal profile image url
 */
export interface User {
  id: number;
  email?: string;
  token?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  loggedIn?: boolean;
  profileimageurlsmall?: string;
  profileimageurl?: string;
}

/**
 * interface for the course type
 * id: unique moodle course id
 * name: courses displayname
 * description: courses description
 * quizCount: Amount of quizzes in the course
 */
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

export interface MultiPlayerStatistic {
  userId: number;
  courseId: number;
  totalWins: number;
  totalLosses: number;
  totalRight: number;
  totalWrong: number;
}
