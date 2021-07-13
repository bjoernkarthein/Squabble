import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MoodleService {

  private moodleBaseUrl = 'http://localhost/moodle/webservice/rest/server.php?';
  private webServiceUserToken = 'b8f762ebc0e11f9e28d7d1b5ad1f023b';

  constructor(private http: HttpClient) { }

  //TODO: Possibly change type any to interface for the important calls?

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

  /**
   * Starts a quiz attempt for the given quiz with the user that the token is registered to
   *
   * @param quizId Id of the quiz the attempt should be started for
   * @returns An object describing the started attempt
   */
  public startAttemptForQuiz(quizId: number) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'mod_quiz_start_attempt', 'json');
    reqUrl += '&quizid=' + quizId;
    return this.http.get<any>(reqUrl);
  }

  /**
   * Finishes the given quiz attempt
   *
   * @param attemptId Id of the attempt to finish
   * @returns Object with new state of the quiz attempt
   */
  public finishAttemptForQuiz(attemptId: number) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'mod_quiz_process_attempt', 'json');
    reqUrl += '&attemptid=' + attemptId + '&finishattempt=1';
    return this.http.get<any>(reqUrl);
  }

  /**
   * Get the quiz question information for a quiz attempt in progress as long
   * as the user token is the same that started the attempt
   *
   * @param attemptId The id of the attempt the information should be taken from
   * @returns An array of quiz questions
   */
  public getQuizInProgressInformation(attemptId: number) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'mod_quiz_get_attempt_summary', 'json');
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
  public getFinishedQuizInfo(attemptId: number) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'mod_quiz_get_attempt_review', 'json');
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
