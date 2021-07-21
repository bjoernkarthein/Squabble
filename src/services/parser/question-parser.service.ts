import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuestionParserService {
  public feedback: Feedback;
  public rightAnswer: HTMLCollection;

  constructor() {
    this.feedback = { block: null };
  }

  public parseQuestion(question: MoodleQuestionType) {
    const qid = question.slot - 1;
    const questionType = question.type;

    switch (questionType) {
      case Type.MULTIPLE_CHOICE:
        return this.parseMultiChoice(qid);
      case Type.MATCH:
        return this.parseMatch(qid);
      //   case Type.CLOZE:
      //     return this.parseCloze(qid);
      //   case Type.DRAG_IMAGE:
      //     return this.parseImage(qid);
        case Type.DRAG_MARKER:
          return this.parseMarker(qid);
        case Type.DRAG_TEXT:
          return this.parseText(qid);
      case Type.NUMERICAL:
        return this.parseNumerical(qid);
      case Type.SHORT_ANSWER:
        return this.parseShort(qid);
      case Type.TRUE_FALSE:
        return this.parseTrueFalse(qid);
      default:
        return this.parseNotSupported(qid, questionType);
    }
  }

  public getNumberField(id: number): string {
    const numberField = document.getElementsByClassName('no');
    return numberField[id].textContent;
  }

  public getQuestionText(id: number, type: string): string {
    // Do this for all subanswers
    if (type === Type.CLOZE) {
      return document.getElementsByClassName('subquestion')[0].nextSibling.textContent;
    }

    const questionText = document.getElementsByClassName('qtext');
    return questionText[id] ? questionText[id].textContent : '';
  }

  private parseMultiChoice(qid: number): MultipleChoice {
    const qtext = document.querySelector('.que.multichoice .qtext').textContent;
    const qanswer = document.querySelector('.que.multichoice .answer').textContent;
    const qansweroptions = qanswer.split('\n');
    qansweroptions.pop();

    const question: MultipleChoice = {
      id: qid,
      type: Type.MULTIPLE_CHOICE,
      text: qtext,
      multipleAllowed: false,
      answerOptions: qansweroptions
    };

    document.querySelector('.que.multichoice').remove();
    return question;
  }

  private parseMatch(qid: number) {
    const qtext = document.querySelector('.que.match .content .qtext').textContent;
    let gText = document.querySelector('.que.match .content .rightanswer').textContent;
    gText = gText.replace('The correct answer is: ', '');
    gText = gText.replace(/→/g, '##GAP##');

    const question: Match = {
      id: qid,
      type: Type.MATCH,
      text: qtext,
      gapText: gText,
      answerOptions: []
    };

    let aOption = null;
    let i = 1;
    do {
      aOption = document.querySelector('.que.match .content option[value="' + i + '"]');
      if (aOption) {
        question.answerOptions.push(aOption.textContent);
      }
      i++;
    } while (aOption != null);

    document.querySelector('.que.match').remove();
    return question;
  }

  private parseCloze(id: number) {
    // TODO
    document.querySelector('.que.multianswer').remove();
  }

  private parseImage(id: number) {
    // TODO
    document.querySelector('.que.ddimageortext').remove();
  }

  private parseMarker(qid: number) {
    const qtext = document.querySelector('.que.ddmarker .content .qtext').textContent;
    const qimage = document.querySelector('.que.ddmarker .content .dropbackground').attributes['src'].textContent;

    const question: DragMarker = {
      id: qid,
      type: Type.DRAG_MARKER,
      text: qtext,
      image: qimage,
      markers: []
    };

    let marker = null;
    do {
      marker = document.querySelector('.que.ddmarker .content .markertext');
      if (marker != null) {
        question.markers.push(marker.textContent);
        document.querySelector('.que.ddmarker .content .markertext').remove();
      }
    } while (marker != null);

    document.querySelector('.que.ddmarker').remove();
    return question;
  }

  private parseText(qid: number) {
    let qtext = document.querySelector('.que.ddwtos .content .qtext').textContent;
    qtext = qtext.replace(/\w*blank\w*/g, '##BLANK##');

    const question: DragText = {
      id: qid,
      type: Type.DRAG_TEXT,
      text: qtext,
      answerOptions: []
    };

    let aOption = null;
    do {
      aOption = document.querySelector('.que.ddwtos .draghome');
      if (aOption != null) {
        question.answerOptions.push(aOption.textContent);
        document.querySelector('.que.ddwtos .draghome').remove();
      }
    } while (aOption != null);

    document.querySelector('.que.ddwtos').remove();
    return question;
  }

  private parseNumerical(qid: number) {
    const qtext = document.querySelector('.que.numerical .content .qtext').textContent;
    const question: Numerical = {
      id: qid,
      type: Type.NUMERICAL,
      text: qtext
    };

    document.querySelector('.que.numerical').remove();
    return question;
  }

  private parseShort(qid: number): ShortAnswer {
    const qtext = document.querySelector('.que.shortanswer .content .qtext').textContent;
    const question: TrueFalse = {
      id: qid,
      type: Type.SHORT_ANSWER,
      text: qtext
    };

    document.querySelector('.que.shortanswer').remove();
    return question;
  }

  private parseTrueFalse(qid: number): TrueFalse {
    const qtext = document.querySelector('.que.truefalse .content .qtext').textContent;
    const question: TrueFalse = {
      id: qid,
      type: Type.TRUE_FALSE,
      text: qtext
    };

    document.querySelector('.que.truefalse').remove();
    return question;
  }

  private parseNotSupported(qid: number, type: string): NotSupported {
    const question: NotSupported = {
      id: qid,
      text: 'This Question type is currently not supported by this App',
      type: Type.NOT_SUPPORTED
    };

    document.querySelector('.que.' + type).remove();
    return question;
  }
}

interface Feedback {
  block: HTMLCollection;
  general?: HTMLCollection;
  specific?: HTMLCollection;
}

export interface MoodleQuestionType {
  type: string;
  html: string;
  blockedByPrevious: boolean;
  slot: number;
}

enum Type {
  MULTIPLE_CHOICE = 'multichoice',
  NUMERICAL = 'numerical',
  SHORT_ANSWER = 'shortanswer',
  TRUE_FALSE = 'truefalse',
  CLOZE = 'multianswer',
  MATCH = 'match',
  DRAG_TEXT = 'ddwtos',
  DRAG_MARKER = 'ddmarker',
  DRAG_IMAGE = 'ddimageortext',
  NOT_SUPPORTED = 'notsupported'
}

interface MultipleChoice {
  id: number;
  type: Type;
  text: string;
  multipleAllowed: boolean;
  answerOptions: string[];
}

interface TrueFalse {
  id: number;
  type: Type;
  text: string;
}

interface Numerical {
  id: number;
  type: Type;
  text: string;
}

interface ShortAnswer {
  id: number;
  type: Type;
  text: string;
}

interface Cloze {
  id: number;
  type: Type;
  text: string;
  answerOptions: string[];
}

interface Match {
  id: number;
  type: Type;
  text: string;
  gapText: string;
  answerOptions: string[];
}

interface DragImage {
  id: number;
  type: Type;
  text?: string;
  image: string;
  answerOptions: string[];
}

interface DragText {
  id: number;
  type: Type;
  text: string;
  answerOptions: string[];
}

interface DragImageOrText {
  id: number;
  type: Type;
  text?: string;
  image?: string;
  answerOptions: string[];
}

interface DragMarker {
  id: number;
  type: Type;
  text?: string;
  image: string;
  markers: string[];
}

interface NotSupported {
  id: number;
  type: Type;
  text: string;
}
