import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Field } from '../parser/question-parser.service';

@Injectable({
  providedIn: 'root'
})
export class MoodleService {

  private moodleBaseUrl = 'http://localhost/moodle/webservice/rest/server.php?';
  private webServiceUserToken = 'b8f762ebc0e11f9e28d7d1b5ad1f023b';
  private webServiceName = 'webservices';

  constructor(private http: HttpClient) { }

  //TODO: Possibly change type any to interface for the important calls?

  public authenticateAndGetToken(username: string, password: string) {
    let baseUrl = 'http://localhost/moodle/login/token.php?';
    const escPassword = encodeURIComponent(password);
    baseUrl += 'username=' + username + '&password=' + escPassword + '&service=' + this.webServiceName;
    return this.http.get<any>(baseUrl);
  }
  /**
   * Get the site information for the specified moodle server
   *
   * @returns Moodle Site Info
   */
  public getSiteInfo() {
    return this.http.get<any>(this.getRequestUrl(this.webServiceUserToken, 'core_webservice_get_site_info', 'json'));
  }

  /**
   * Gets all courses for the specified moodle server
   *
   * @returns List of all created courses
   */
  public getAllCourses() {
    return this.http.get<any>(this.getRequestUrl(this.webServiceUserToken, 'core_course_get_courses', 'json'));
  }

  public getCourseById(courseId: string) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'core_course_get_courses', 'json');
    reqUrl += '&options[ids][0]=' + courseId;
    return this.http.get<any>(reqUrl);
  }

  public getCourseContent(courseId: string) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'core_course_get_contents', 'json');
    reqUrl += '&courseid=' + courseId;
    return this.http.get<any>(reqUrl);
  }

  /**
   * Gets the general quiz information for a specified course
   *
   * @param courseId The id of the course the quizzes should be loaded from
   * @returns A list of all quizzes in this course
   */
  public getQuizzesFromCourse(courseId: string) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'mod_quiz_get_quizzes_by_courses', 'json');
    reqUrl += '&courseids[0]=' + courseId;
    return this.http.get<any>(reqUrl);
  }

  public async getRandomQuizQuestion(courseId: string) {
    const res = await this.getQuizzesFromCourse(courseId).toPromise();
    const quizzes = res.quizzes;

    let randomQuizIndex = Math.floor(Math.random() * quizzes.length);
    let quiz = quizzes[randomQuizIndex];
    while (!quiz || quiz.hasquestions !== 1) {
      randomQuizIndex = Math.floor(Math.random() * quizzes.length);
      quiz = quizzes[randomQuizIndex];
    }

    const resp = await this.startAttemptForQuiz(quiz.id, this.webServiceUserToken);
    const attempt = resp.attempt.id;
    await this.processQuizAttempt(attempt, this.webServiceUserToken, new Map(), 1);
    const info = await this.getFinishedQuizInfo(attempt, this.webServiceUserToken).toPromise();
    const questions = info.questions;
    const randomQuestionIndex = Math.floor(Math.random() * questions.length);
    const que = questions[randomQuestionIndex];
    return { attemptId: attempt, question: que };
  }

  /**
   * Starts a quiz attempt for the given quiz with the user that the token is registered to
   *
   * @param quizId Id of the quiz the attempt should be started for
   * @returns
   */
  public async startAttemptForQuiz(quizId: string, token: string) {
    let reqUrl = this.getRequestUrl(token, 'mod_quiz_start_attempt', 'json');
    reqUrl += '&quizid=' + quizId;
    return await this.http.get<any>(reqUrl).toPromise();
  }

  /**
   * Finishes the given quiz attempt
   *
   * @param attemptId Id of the attempt to finish
   * @returns
   */
  public async processQuizAttempt(attemptId: number, token: string, data: Map<string, Field[]>, finish: number) {
    let reqUrl = this.getRequestUrl(token, 'mod_quiz_process_attempt', 'json');
    let dataString = '';
    let index = 0;
    data.forEach((array: Field[], key: string) => {
      for (const elem of array) {
        dataString += '&data[' + index + '][name]=' + elem.name + '&data[' + index + '][value]=' + elem.value;
        index++;
      }
    });
    reqUrl += '&attemptid=' + attemptId + '&finishattempt=' + finish + dataString;
    console.log(dataString);
    return await this.http.get<any>(reqUrl).toPromise();
  }

  /**
   * Get the quiz question information for a quiz attempt in progress as long
   * as the user token is the same that started the attempt
   *
   * @param attemptId The id of the attempt the information should be taken from
   * @returns An array of quiz questions
   */
  public getQuizInProgressInformation(attemptId: number, token: string) {
    let reqUrl = this.getRequestUrl(token, 'mod_quiz_get_attempt_summary', 'json');
    reqUrl += '&attemptid=' + attemptId;
    return this.http.get<any>(reqUrl);
  }

  /**
   * Get the quiz question information for a finished quiz attempt as long
   * as the user token is the same that started the attempt
   *
   * @param attemptId The id of the attempt the information should be taken from
   * @returns An array of quiz questions
   */
  public getFinishedQuizInfo(attemptId: number, token: string) {
    let reqUrl = this.getRequestUrl(token, 'mod_quiz_get_attempt_review', 'json');
    reqUrl += '&attemptid=' + attemptId;
    return this.http.get<any>(reqUrl);
  }

  // /**
  //  * Get Quiz Questions for specific quiz
  //  *
  //  * @param quizId Id of the requested quiz
  //  * @returns Quiz question information or an error if the quiz attempt could not be started
  //  */
  // public getQuizInfo(quizId: number) {
  //   this.startAttemptForQuiz(quizId).subscribe(attempt => {
  //     this.finishAttemptForQuiz(attempt.id);
  //     return this.getFinishedQuizInfo(attempt.id);
  //   });
  // }

  /**
   * Returns all registered users for a moodle instance
   *
   * @param key the property to get users by
   * @param value the value of the property
   * @returns List of users that match the value for the property
   */
  public getUsers(key: string, value: string) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'core_user_get_users', 'json');
    reqUrl += '&criteria[0][key]=' + key;
    reqUrl += '&criteria[0][value]=' + value;
    return this.http.get<any>(reqUrl);
  }

  public getCoursesForUser(userId: number) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'core_enrol_get_users_courses', 'json');
    reqUrl += '&userid=' + userId;
    return this.http.get<any>(reqUrl);
  }

  /**
   * Build up the request url to the specified moodle server
   *
   * @param wstoken User token to authenticate request
   * @param wsfunction API function to execute
   * @param moodlewsrestformat Format of the answer
   * @returns The generated url given the inputs
   */
  private getRequestUrl(wstoken: string, wsfunction: string, moodlewsrestformat: string): string {
    return this.moodleBaseUrl + 'wstoken=' + wstoken + '&wsfunction=' + wsfunction + '&moodlewsrestformat=' + moodlewsrestformat;
  }
}
