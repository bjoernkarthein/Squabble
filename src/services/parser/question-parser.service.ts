import { asNativeElements, Injectable } from '@angular/core';

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
      // case Type.DRAG_MARKER:
      //   return this.parseMarker(qid);
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

  //! ALSO GET ANSWER OPTION VALUES IN CASE OF RELOAD

  private parseMultiChoice(qid: number): MultipleChoice {
    const qtext = document.querySelector('.que.multichoice .qtext').textContent;
    const qanswer = document.querySelector('.que.multichoice .answer').textContent;
    const qansweroptions = qanswer.split('\n');
    qansweroptions.pop();
    const answerOptionsAndSelected: any[] = [];
    for (const a of qansweroptions) {
      answerOptionsAndSelected.push({
        text: a,
        isChecked: false
      });
    }

    const qSequenceName = document.querySelector('.que.multichoice .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector('.que.multichoice .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };


    const question: MultipleChoice = {
      id: qid,
      type: Type.MULTIPLE_CHOICE,
      text: qtext,
      multipleAllowed: false,
      answerOptions: answerOptionsAndSelected,
      sequenceCheck: qSequence,
      answerFields: []
    };

    let answer = null;
    do {
      answer = document.querySelector('.que.multichoice .answer input');
      if (answer) {
        question.answerFields.push({ name: answer['name'], value: '' });
        document.querySelector('.que.multichoice .answer input').remove();
        document.querySelector('.que.multichoice .answer input').remove();
      }
    } while (answer != null);

    document.querySelector('.que.multichoice').remove();
    return question;
  }

  private parseMatch(qid: number) {
    const qtext = document.querySelector('.que.match .content .qtext').textContent;

    const qSequenceName = document.querySelector('.que.match .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector('.que.match .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const question: Match = {
      id: qid,
      type: Type.MATCH,
      text: qtext,
      gapText: [],
      answerOptions: [],
      sequenceCheck: qSequence,
      answerFields: []
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

    let answer = null;
    do {
      answer = document.querySelector('.que.match .answer .text');
      if (answer) {
        question.gapText.push(answer.textContent);

        question.answerFields.push({
          name: document.querySelector('.que.match .answer .select')['name'],
          value: '0'
        });

        document.querySelector('.que.match .answer .select').remove();
        document.querySelector('.que.match .answer .text').remove();
      }
    } while (answer != null);

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
    // eslint-disable-next-line @typescript-eslint/dot-notation
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

    // document.querySelector('.que.ddmarker').remove();
    return question;
  }

  private parseText(qid: number) {
    let qtext = document.querySelector('.que.ddwtos .content .qtext').textContent;
    qtext = qtext.replace(/\w*blank\w*/g, '##BLANK##');

    const qSequenceName = document.querySelector('.que.ddwtos .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector('.que.ddwtos .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const question: DragText = {
      id: qid,
      type: Type.DRAG_TEXT,
      text: qtext,
      answerOptions: [],
      sequenceCheck: qSequence,
      answerFields: []
    };

    let answer = null;
    do {
      answer = document.querySelector('.que.ddwtos .placeinput');
      if (answer) {
        question.answerFields.push({
          name: answer['name'],
          value: '0'
        });
        document.querySelector('.que.ddwtos .placeinput').remove();
      }
    } while (answer != null);

    let aOption = null;
    do {
      aOption = document.querySelector('.que.ddwtos .draghome');
      if (aOption != null) {
        let answerOptionId = aOption.classList[1];
        answerOptionId = answerOptionId.replace('choice', '');
        question.answerOptions.push({
          id: answerOptionId,
          text: aOption.textContent
        });
        document.querySelector('.que.ddwtos .draghome').remove();
      }
    } while (aOption != null);

    document.querySelector('.que.ddwtos').remove();
    return question;
  }

  private parseNumerical(qid: number) {
    const qtext = document.querySelector('.que.numerical .content .qtext').textContent;

    const qSequenceName = document.querySelector('.que.numerical .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector('.que.numerical .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const qAnswerFieldName = document.querySelector('.que.numerical .answer input')['name'];
    const qAnswerField: Field = { name: qAnswerFieldName, value: '' };

    const question: Numerical = {
      id: qid,
      type: Type.NUMERICAL,
      text: qtext,
      sequenceCheck: qSequence,
      answerFields: [qAnswerField]
    };

    document.querySelector('.que.numerical').remove();
    return question;
  }

  private parseShort(qid: number): ShortAnswer {
    const qtext = document.querySelector('.que.shortanswer .content .qtext').textContent;

    const qSequenceName = document.querySelector('.que.shortanswer .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector('.que.shortanswer .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const qAnswerFieldName = document.querySelector('.que.shortanswer .answer input')['name'];
    const qAnswerField: Field = { name: qAnswerFieldName, value: '' };

    const question: ShortAnswer = {
      id: qid,
      type: Type.SHORT_ANSWER,
      text: qtext,
      sequenceCheck: qSequence,
      answerFields: [qAnswerField]
    };

    document.querySelector('.que.shortanswer').remove();
    return question;
  }

  private parseTrueFalse(qid: number): TrueFalse {
    const qtext = document.querySelector('.que.truefalse .content .qtext').textContent;
    const qSequenceName = document.querySelector('.que.truefalse .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector('.que.truefalse .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const qAnswerFieldName = document.querySelector('.que.truefalse .answer input')['name'];
    const qAnswerField: Field = { name: qAnswerFieldName, value: '' };

    const question: TrueFalse = {
      id: qid,
      type: Type.TRUE_FALSE,
      text: qtext,
      sequenceCheck: qSequence,
      answerFields: [qAnswerField]
    };

    document.querySelector('.que.truefalse').remove();
    return question;
  }

  private parseNotSupported(qid: number, type: string): NotSupported {
    const question: NotSupported = {
      id: qid,
      text: 'This Question type is currently not supported by this App (' + type + ')',
    };

    // document.querySelector('.que.' + type).remove();
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
}

export interface Field {
  name: string;
  value: string;
}

interface MultipleChoice {
  id: number;
  type: Type;
  text: string;
  multipleAllowed: boolean;
  answerOptions: any[];
  sequenceCheck: Field;
  answerFields?: Field[];
}

interface TrueFalse {
  id: number;
  type: Type;
  text: string;
  sequenceCheck: Field;
  answerFields?: Field[];
}

interface Numerical {
  id: number;
  type: Type;
  text: string;
  sequenceCheck?: Field;
  answerFields?: Field[];
}

interface ShortAnswer {
  id: number;
  type: Type;
  text: string;
  sequenceCheck?: Field;
  answerFields?: Field[];
}

interface Cloze {
  id: number;
  type: Type;
  text: string;
  answerOptions: string[];
  sequenceCheck?: Field;
  answerFields?: Field[];
}

interface Match {
  id: number;
  type: Type;
  text: string;
  gapText: string[];
  answerOptions: string[];
  sequenceCheck?: Field;
  answerFields?: Field[];
}

interface DragImage {
  id: number;
  type: Type;
  text?: string;
  image: string;
  answerOptions: string[];
  sequenceCheck?: Field;
  answerFields?: Field[];
}

interface DragText {
  id: number;
  type: Type;
  text: string;
  answerOptions: any[];
  sequenceCheck?: Field;
  answerFields?: Field[];
}

interface DragImageOrText {
  id: number;
  type: Type;
  text?: string;
  image?: string;
  answerOptions: string[];
  sequenceCheck?: Field;
  answerFields?: Field[];
}

interface DragMarker {
  id: number;
  type: Type;
  text?: string;
  image: string;
  markers: string[];
  sequenceCheck?: Field;
  answerFields?: Field[];
}

interface NotSupported {
  id: number;
  text: string;
  sequenceCheck?: Field;
  answerFields?: Field[];
}
