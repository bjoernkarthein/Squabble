import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuestionParserService {
  public numberFields: HTMLCollection;
  public questionTexts: HTMLCollection;
  public answerOptions: HTMLCollection;
  public feedback: Feedback;
  public rightAnswer: HTMLCollection;

  constructor() {
    this.feedback = { block: null };
  }

  public parseQuestion() { }

  public getNumberField(): string {
    const numberField = document.getElementsByClassName('no');
    return numberField[0].textContent;
  }

  public getQuestionText(): any {
    const questionText = document.getElementsByClassName('qtext');
    return questionText[0].textContent;
  }

  public getAnswerBlocks(): HTMLCollection {
    this.answerOptions = document.getElementsByClassName('answer');
    return this.answerOptions;
  }

  public getFeedback(): Feedback {
    this.feedback.block = document.getElementsByClassName('feedback');
    this.feedback.general = document.getElementsByClassName('generalfeedback');
    this.feedback.specific = document.getElementsByClassName('specificfeedback');
    return this.feedback;
  }

  public getRightAnswer(): string {
    const rightAnswer = document.getElementsByClassName('rightanswer');
    return rightAnswer[0].textContent;
  }
}

interface Feedback {
  block: HTMLCollection;
  general?: HTMLCollection;
  specific?: HTMLCollection;
}
