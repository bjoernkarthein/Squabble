import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Field, Type } from '../parser/question-parser.service';

@Injectable({
  providedIn: 'root'
})
export class MoodleService {

  public moodleInstalationUrl = 'http://localhost/moodle';
  private moodleBaseUrl = this.moodleInstalationUrl + '/webservice/rest/server.php?';
  //! Needs to be hidden somehow
  private webServiceUserToken = 'b8f762ebc0e11f9e28d7d1b5ad1f023b';
  private studentService = 'comp_quiz_student';

  constructor(private http: HttpClient) { }

  /**
   * Retrieve a user token for a given user for the webservice 'comp_quiz_student'
   *
   * @param username The users username
   * @param password The users password
   * @returns An object with the token of the user, if the provided user information is correct and the user
   * is allowed to create a token for the studentService
   */
  public authenticateAndGetToken(username: string, password: string) {
    let baseUrl = this.moodleInstalationUrl + '/login/token.php?';
    const escPassword = encodeURIComponent(password);
    baseUrl += 'username=' + username + '&password=' + escPassword + '&service=' + this.studentService;
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

  /**
   * Get general course information for a given course
   *
   * @param courseId The moodle course id
   * @returns An object with general course information like title and description
   */
  public getCourseById(courseId: string) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'core_course_get_courses', 'json');
    reqUrl += '&options[ids][0]=' + courseId;
    return this.http.get<any>(reqUrl);
  }

  /**
   * Get detailed course information for a given course
   *
   * @param courseId The moodle course id
   * @returns An object with detailed course information like the courses structure
   */
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
   * Checks if a given course has enough distinct, supported questions
   *
   * @param courseId The moodle coure id of the course to check
   * @param threshHold The minimum amount of questions the course needs to have
   * @returns true if the course has at least as much distinct, supported questions as threshHold
   */
  public async checkQuestionAmount(courseId: string, threshHold: number): Promise<boolean> {
    const res = await this.getQuizzesFromCourse(courseId).toPromise();
    const quizzes = res.quizzes;
    const hasEnoughQuestions = await this.countQuestions(quizzes, threshHold);
    return hasEnoughQuestions;
  }

  /**
   * Retrieve a specified amount of distinct, supported questions from the given course
   *
   * @param courseId The moodle course id
   * @param amount The amount of questions to get
   * @returns An array of objects with the attempt id created by moodle and the moodle question object
   * All questions in the array are guaranteed to be supported and distinct
   */
  public async getRandomQuizQuestion(courseId: string, amount: number): Promise<any[]> {
    const notSupported = [Type.ESSAY, Type.CLOZE, Type.DRAG_IMAGE, Type.DRAG_MARKER];
    const questionsArray = [];
    const questionIds = [];

    const res = await this.getQuizzesFromCourse(courseId).toPromise();
    const quizzes = res.quizzes;

    for (let i = 0; i < amount; i++) {
      let nextQuestionFound = false;
      while (!nextQuestionFound) {
        const randomQuestionObject = await this.getRandomQuestion(quizzes);
        const randomQuestion = randomQuestionObject.question;
        const attempt = randomQuestionObject.attemptId;
        const uniqueId = randomQuestionObject.questionUniqueId;

        if (!questionIds.includes(uniqueId) && !notSupported.includes(randomQuestion.type)) {
          questionIds.push(uniqueId);
          questionsArray.push({ attemptId: attempt, question: randomQuestion });
          nextQuestionFound = true;
        }
      }
    }
    return questionsArray;
  }

  /**
   * Starts a quiz attempt for the given quiz with the user that the token is registered to
   *
   * @param quizId Id of the quiz the attempt should be started for
   * @param token The token of the user that wants to process his attempt
   * (Only works if this user does not have another attempt in progress for the same quiz)
   * @returns An object with the attemptId and other information about the created attempt
   */
  public async startAttemptForQuiz(quizId: string, token: string) {
    let reqUrl = this.getRequestUrl(token, 'mod_quiz_start_attempt', 'json');
    reqUrl += '&quizid=' + quizId;
    return await this.http.get<any>(reqUrl).toPromise();
  }

  /**
   * Processes a given quiz attempt
   *
   * @param attemptId The id of the quiz attempt
   * @param token The token of the user that wants to process his attempt
   * (The token needs to belong to the user that started the attempt)
   * @param data The answer data to change or add to the quiz attempt
   * @param finish Wether to finish the attempt or not (1 -> finish)
   * @returns the new status of the quiz attempt
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

    return await this.http.get<any>(reqUrl).toPromise();
  }

  /**
   * Get the quiz question information for a quiz attempt in progress as long
   * as the user token is the same that started the attempt
   *
   * @param attemptId The id of the attempt the information should be taken from
   * @param token The token of the user that wants to retrieve the information
   * (The token needs to belong to the user that started the attempt)
   * @returns An object with quiz in progress information
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
   * @param token The token of the user that wants to retrieve the information
   * (The token needs to belong to the user that finished the attempt)
   * @returns An object with quiz in progress information
   */
  public getFinishedQuizInfo(attemptId: number, token: string) {
    let reqUrl = this.getRequestUrl(token, 'mod_quiz_get_attempt_review', 'json');
    reqUrl += '&attemptid=' + attemptId;
    return this.http.get<any>(reqUrl);
  }

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

  /**
   * Returns all the courses a specific user is enrolled in
   *
   * @param userId The moodle user id
   * @returns A list of courses
   */
  public getCoursesForUser(userId: number) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'core_enrol_get_users_courses', 'json');
    reqUrl += '&userid=' + userId;
    return this.http.get<any>(reqUrl);
  }

  /**
   * Returns all enrolled users for a specific course
   *
   * @param courseId The moodle id of the course
   * @returns An array of all enrolled users
   */
  public async getEnrolledUsersForCourse(courseId: string) {
    let reqUrl = this.getRequestUrl(this.webServiceUserToken, 'core_enrol_get_enrolled_users', 'json');
    reqUrl += '&courseid=' + courseId;
    return await this.http.get<any>(reqUrl).toPromise();
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

  /**
   * Gets a random quiz question from a set of quizzes
   *
   * @param quizArray The set of quizzes from where to select the question from
   * @returns An object with the attemptId created by moodle, a unique question-id and the moodle question object
   */
  private async getRandomQuestion(quizArray: any[]): Promise<any> {
    let randomQuizIndex = Math.floor(Math.random() * quizArray.length);
    let quiz = quizArray[randomQuizIndex];

    while (!quiz || quiz.hasquestions !== 1) {
      randomQuizIndex = Math.floor(Math.random() * quizArray.length);
      quiz = quizArray[randomQuizIndex];
    }

    const resp = await this.startAttemptForQuiz(quiz.id, this.webServiceUserToken);
    const attempt = resp.attempt.id;
    await this.processQuizAttempt(attempt, this.webServiceUserToken, new Map(), 1);
    const info = await this.getFinishedQuizInfo(attempt, this.webServiceUserToken).toPromise();
    const questions = info.questions;
    const quizId = info.attempt.quiz;
    const randomQuestionIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomQuestionIndex];
    const questionSlot = randomQuestion.slot;
    const questionId = quizId.toString() + questionSlot.toString();

    return { attemptId: attempt, questionUniqueId: questionId, question: randomQuestion };
  }

  /**
   * Counts all supported questions for a given set of quizzes and compares them to a threshHold
   *
   * @param quizArray The set of quizzes
   * @param threshHold The minimum amount of questions needed
   * @returns If the given quizzes contain at least as much questions as the threshhold
   */
  private async countQuestions(quizArray: any[], threshHold: number): Promise<boolean> {
    const notSupported = [Type.ESSAY, Type.CLOZE, Type.DRAG_IMAGE, Type.DRAG_MARKER];
    let questionCount = 0;

    for (const quiz of quizArray) {
      if (quiz.hasquestions === 0) {
        continue;
      }
      const resp = await this.startAttemptForQuiz(quiz.id, this.webServiceUserToken);
      const attempt = resp.attempt.id;
      await this.processQuizAttempt(attempt, this.webServiceUserToken, new Map(), 1);
      const info = await this.getFinishedQuizInfo(attempt, this.webServiceUserToken).toPromise();
      const questions = info.questions;

      for (const question of questions) {
        if (!notSupported.includes(question.type)) {
          questionCount++;
          if (questionCount >= threshHold) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

/**
 * Enum to store some reference values for good question amounts
 * MINIMUM means that at least 3 Questions have to be provided by the course because one round needs 3 Questions
 * AVERAGE could enable different questions for each round
 * OPTIMAL is one value that enables a good experience with mixed questions
 * Keep in mind the higher this value, the better and more random the question selection will be.
 */
export enum QuestionAmount {
  MINIMUM = 3
}
