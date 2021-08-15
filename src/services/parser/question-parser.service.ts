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

  public parseQuestion(question: MoodleQuestionType, attemptId: number, inProgress: boolean) {
    const qid = question.slot;
    const questionType = question.type;

    switch (questionType) {
      case Type.MULTIPLE_CHOICE:
        return this.parseMultiChoice(qid, attemptId, inProgress);
      case Type.MATCH:
        return this.parseMatch(qid, attemptId, inProgress);
      //   case Type.CLOZE:
      //     return this.parseCloze(qid);
      //   case Type.DRAG_IMAGE:
      //     return this.parseImage(qid);
      // case Type.DRAG_MARKER:
      //   return this.parseMarker(qid);
      // case Type.ESSAY:
      //   return this.parseEssay(qid, attemptId);
      case Type.DRAG_TEXT:
        return this.parseText(qid, attemptId, inProgress);
      case Type.NUMERICAL:
        return this.parseNumerical(qid, attemptId, inProgress);
      case Type.SHORT_ANSWER:
        return this.parseShort(qid, attemptId, inProgress);
      case Type.TRUE_FALSE:
        return this.parseTrueFalse(qid, attemptId, inProgress);
      case Type.GAP_SELECT:
        return this.parseGapSelect(qid, attemptId, inProgress);
      default:
        return this.parseNotSupported(qid, questionType, attemptId);
    }
  }

  //! ALSO GET ANSWER OPTION VALUES IN CASE OF RELOAD

  private parseMultiChoice(qid: number, attemptId: number, inProgress: boolean): MultipleChoice {
    const moodleQId = '#question-' + attemptId + '-' + qid;

    const qtext = document.querySelector(moodleQId + ' .qtext').textContent;
    const qanswer = document.querySelector(moodleQId + ' .answer').textContent;
    const qansweroptions = qanswer.split('\n');
    qansweroptions.pop();
    const answerOptionsAndSelected: any[] = [];

    for (const a of qansweroptions) {
      answerOptionsAndSelected.push({
        text: a,
        isChecked: false
      });
    }

    const qSequenceName = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };


    const question: MultipleChoice = {
      id: qid,
      type: Type.MULTIPLE_CHOICE,
      text: qtext,
      multipleAllowed: true,
      answerOptions: answerOptionsAndSelected,
      sequenceCheck: qSequence,
      answerFields: []
    };

    let answer = null;
    do {

      // if (inProgress) {
      //   answer = document.querySelector(moodleQId + ' .answer input');
      // } else {
      //   answer = document.querySelector(moodleQId + ' .answer div');
      // }

      answer = document.querySelector(moodleQId + ' .answer input');
      if (answer) {
        // if (inProgress ? answer['type'] === 'radio' : answer.classList[0][0] === 'r') {
        if (answer['type'] === 'radio') {
          question.multipleAllowed = false;
        }

        // if (inProgress) {
        //   question.answerFields.push({ name: answer['name'], value: '' });
        //   document.querySelector(moodleQId + ' .answer input').remove();
        // } else {
        //   let optionName = answer.firstChild.id;
        //   optionName = optionName.replace('-label', '');
        //   question.answerFields.push({ name: optionName, value: '' });
        //   document.querySelector(moodleQId + ' .answer div').remove();
        // }
        question.answerFields.push({ name: answer['name'], value: '' });
        document.querySelector(moodleQId + ' .answer input').remove();

        // if (question.multipleAllowed && inProgress) {
        //   document.querySelector(moodleQId + ' .answer input').remove();
        // }
        if (question.multipleAllowed && inProgress) {
          document.querySelector(moodleQId + ' .answer input').remove();
        }
      }
    } while (answer != null);

    if (!inProgress) {
      let rightAnswer = document.querySelector(moodleQId + ' .rightanswer').textContent;
      question.rightAnswerText = rightAnswer;
      if (question.multipleAllowed) {
        rightAnswer = rightAnswer.replace('The correct answers are: ', '');
      } else {
        rightAnswer = rightAnswer.replace('The correct answer is: ', '');
      }
      question.rightAnswers = rightAnswer.split(', ');
    }

    document.querySelector(moodleQId).remove();
    return question;
  }

  private parseMatch(qid: number, attemptId: number, inProgress: boolean): Match {
    const moodleQId = '#question-' + attemptId + '-' + qid;

    const qtext = document.querySelector(moodleQId + ' .content .qtext').textContent;

    const qSequenceName = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const question: Match = {
      id: qid,
      type: Type.MATCH,
      text: qtext,
      gapText: [],
      answerOptions: [],
      sequenceCheck: qSequence,
      answerFields: [],
      rightAnswers: []
    };

    let aOption = null;
    let i = 1;
    do {
      aOption = document.querySelector(moodleQId + ' .content option[value="' + i + '"]');
      if (aOption) {
        question.answerOptions.push(aOption.textContent);
      }
      i++;
    } while (aOption != null);

    let answer = null;
    do {
      answer = document.querySelector(moodleQId + ' .answer .text');
      if (answer) {
        question.gapText.push(answer.textContent);

        question.answerFields.push({
          name: document.querySelector(moodleQId + ' .answer .select')['name'],
          value: '0'
        });

        document.querySelector(moodleQId + ' .answer .select').remove();
        document.querySelector(moodleQId + ' .answer .text').remove();
      }
    } while (answer != null);

    if (!inProgress) {
      let rightAnswer = document.querySelector(moodleQId + ' .rightanswer').textContent;
      question.rightAnswerText = rightAnswer;
      rightAnswer = rightAnswer.replace('The correct answer is: ', '');

      const regEx = new RegExp('\.+→ ');
      const answerArray = rightAnswer.split(', ');

      for (const str of answerArray) {
        question.rightAnswers.push(str.replace(regEx, ''));
      }
    }

    document.querySelector(moodleQId).remove();
    return question;
  }

  private parseGapSelect(qid: number, attemptId: number, inProgress: boolean): GapSelect {
    const moodleQId = '#question-' + attemptId + '-' + qid;


    const qSequenceName = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const question: GapSelect = {
      id: qid,
      type: Type.GAP_SELECT,
      gapText: [],
      answerOptions: [],
      sequenceCheck: qSequence,
      answerFields: [],
      rightAnswers: []
    };

    let aOption = null;
    let i = 1;
    do {
      aOption = document.querySelector(moodleQId + ' .content option[value="' + i + '"]');
      if (aOption) {
        question.answerOptions.push(aOption.textContent);
      }
      i++;
    } while (aOption != null);

    let answer = null;
    do {
      answer = document.querySelector(moodleQId + ' .content .select');
      if (answer) {
        question.answerFields.push({
          name: document.querySelector(moodleQId + ' .content .select')['name'],
          value: '0'
        });

        document.querySelector(moodleQId + ' .content .select').remove();
      }
    } while (answer != null);

    const qtext = document.querySelector(moodleQId + ' .content .qtext').textContent;
    const gaps = qtext.split(/[ ]+/);
    question.gapText = gaps;

    if (!inProgress) {
      let rightAnswer = document.querySelector(moodleQId + ' .rightanswer').textContent;
      question.rightAnswerText = rightAnswer;
      rightAnswer = rightAnswer.replace('The correct answer is: ', '');

      const regEx = new RegExp('\.+\\[');
      const answerArray = rightAnswer.split(']');
      answerArray.pop();

      for (const str of answerArray) {
        question.rightAnswers.push(str.replace(regEx, ''));
      }
    }

    document.querySelector(moodleQId).remove();
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

  private parseMarker(qid: number, attemptId: number, inProgress: boolean): DragMarker {
    const moodleQId = '#question-' + attemptId + '-' + qid;

    const qtext = document.querySelector(moodleQId + ' .content .qtext').textContent;
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const qimage = document.querySelector(moodleQId + ' .content .dropbackground').attributes['src'].textContent;

    const question: DragMarker = {
      id: qid,
      type: Type.DRAG_MARKER,
      text: qtext,
      image: qimage,
      markers: []
    };

    let marker = null;
    do {
      marker = document.querySelector(moodleQId + ' .content .markertext');
      if (marker != null) {
        question.markers.push(marker.textContent);
        document.querySelector(moodleQId + ' .content .markertext').remove();
      }
    } while (marker != null);

    // document.querySelector('.que.ddmarker').remove();
    return question;
  }

  private parseText(qid: number, attemptId: number, inProgress: boolean): DragText {
    const moodleQId = '#question-' + attemptId + '-' + qid;

    let qtext = document.querySelector(moodleQId + ' .content .qtext').textContent;
    qtext = qtext.replace(/\w*blank\w*/g, '##BLANK##');

    const qSequenceName = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const question: DragText = {
      id: qid,
      type: Type.DRAG_TEXT,
      text: qtext,
      gaps: [],
      answerOptions: [],
      sequenceCheck: qSequence,
      answerFields: [],
      rightAnswers: []
    };

    let answer = null;
    do {
      const gap = document.querySelector(moodleQId + ' .drop');
      answer = document.querySelector(moodleQId + ' .placeinput');
      if (answer) {
        question.answerFields.push({
          name: answer['name'],
          value: '0'
        });
        question.gaps.push(gap.classList[3]);
        document.querySelector(moodleQId + ' .placeinput').remove();
        document.querySelector(moodleQId + ' .drop').remove();
      }
    } while (answer != null);

    let aOption = null;
    do {
      aOption = document.querySelector(moodleQId + ' .draghome');
      if (aOption != null) {
        let answerOptionId = aOption.classList[1];
        const answerOptionGroup = aOption.classList[2];
        answerOptionId = answerOptionId.replace('choice', '');
        question.answerOptions.push({
          id: answerOptionId + '-' + answerOptionGroup,
          text: aOption.textContent
        });
        document.querySelector(moodleQId + ' .draghome').remove();
      }
    } while (aOption != null);

    if (!inProgress) {
      let rightAnswer = document.querySelector(moodleQId + ' .rightanswer').textContent;
      question.rightAnswerText = rightAnswer;
      rightAnswer = rightAnswer.replace('The correct answer is: ', '');

      const regEx = new RegExp('\.+\\[');
      const answerArray = rightAnswer.split(']');
      answerArray.pop();

      for (const str of answerArray) {
        question.rightAnswers.push(str.replace(regEx, ''));
      }
    }

    document.querySelector(moodleQId).remove();
    return question;
  }

  private parseNumerical(qid: number, attemptId: number, inProgress: boolean): Numerical {
    const moodleQId = '#question-' + attemptId + '-' + qid;

    const qtext = document.querySelector(moodleQId + ' .content .qtext').textContent;

    const qSequenceName = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const qAnswerFieldName = document.querySelector(moodleQId + ' .answer input')['name'];
    const qAnswerField: Field = { name: qAnswerFieldName, value: '' };

    const question: Numerical = {
      id: qid,
      type: Type.NUMERICAL,
      text: qtext,
      sequenceCheck: qSequence,
      answerFields: [qAnswerField],
    };

    if (!inProgress) {
      let rightAnswer = document.querySelector(moodleQId + ' .rightanswer').textContent;
      question.rightAnswerText = rightAnswer;
      rightAnswer = rightAnswer.replace('The correct answer is: ', '');
      question.rightAnswer = rightAnswer;
    }

    document.querySelector(moodleQId).remove();
    return question;
  }

  private parseShort(qid: number, attemptId: number, inProgress: boolean): ShortAnswer {
    const moodleQId = '#question-' + attemptId + '-' + qid;

    const qtext = document.querySelector(moodleQId + ' .content .qtext').textContent;

    const qSequenceName = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const qAnswerFieldName = document.querySelector(moodleQId + ' .answer input')['name'];
    const qAnswerField: Field = { name: qAnswerFieldName, value: '' };

    const question: ShortAnswer = {
      id: qid,
      type: Type.SHORT_ANSWER,
      text: qtext,
      sequenceCheck: qSequence,
      answerFields: [qAnswerField]
    };

    if (!inProgress) {
      let rightAnswer = document.querySelector(moodleQId + ' .rightanswer').textContent;
      question.rightAnswerText = rightAnswer;
      rightAnswer = rightAnswer.replace('The correct answer is: ', '');
      question.rightAnswer = rightAnswer;
    }

    document.querySelector(moodleQId).remove();
    return question;
  }

  private parseEssay(qid: number, attemptId: number, inProgress: boolean): Essay {
    const moodleQId = '#question-' + attemptId + '-' + qid;

    const qtext = document.querySelector(moodleQId + ' .content .qtext').textContent;

    const qSequenceName = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const qAnswerFieldName = document.querySelector(moodleQId + ' textarea')['name'];
    const qAnswerField: Field = { name: qAnswerFieldName, value: '' };

    const question: Essay = {
      id: qid,
      type: Type.ESSAY,
      text: qtext,
      sequenceCheck: qSequence,
      answerFields: [qAnswerField]
    };

    document.querySelector(moodleQId).remove();
    return question;
  }

  private parseTrueFalse(qid: number, attemptId: number, inProgress: boolean): TrueFalse {
    const moodleQId = '#question-' + attemptId + '-' + qid;

    const qtext = document.querySelector(moodleQId + ' .content .qtext').textContent;

    const qSequenceName = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['name'];
    const qSequenceValue = document.querySelector(moodleQId + ' .content .formulation.clearfix input')['value'];
    const qSequence: Field = { name: qSequenceName, value: qSequenceValue };

    const qAnswerFieldName = document.querySelector(moodleQId + ' .answer input')['name'];
    const qAnswerField: Field = { name: qAnswerFieldName, value: '' };

    const question: TrueFalse = {
      id: qid,
      type: Type.TRUE_FALSE,
      text: qtext,
      sequenceCheck: qSequence,
      answerFields: [qAnswerField]
    };

    if (!inProgress) {
      let rightAnswer = document.querySelector(moodleQId + ' .rightanswer').textContent;
      question.rightAnswerText = rightAnswer;
      rightAnswer = rightAnswer.replace('The correct answer is \'', '');
      rightAnswer = rightAnswer.replace('\'.', '');
      question.rightAnswer = rightAnswer;
    }

    document.querySelector(moodleQId).remove();
    return question;
  }

  private parseNotSupported(qid: number, type: string, attemptId: number): NotSupported {
    const moodleQId = '#question-' + attemptId + '-' + qid;
    const question: NotSupported = {
      id: qid,
      text: 'This Question type is currently not supported by this App (' + type + ')',
    };

    // document.querySelector(moodleQId).remove();
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

//TODO: comment
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
  GAP_SELECT = 'gapselect',
  ESSAY = 'essay'
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
  rightAnswers?: string[];
  rightAnswerText?: string;
}

interface TrueFalse {
  id: number;
  type: Type;
  text: string;
  sequenceCheck: Field;
  answerFields?: Field[];
  rightAnswer?: string;
  rightAnswerText?: string;
}

interface Numerical {
  id: number;
  type: Type;
  text: string;
  sequenceCheck?: Field;
  answerFields?: Field[];
  rightAnswer?: string;
  rightAnswerText?: string;
}

interface ShortAnswer {
  id: number;
  type: Type;
  text: string;
  sequenceCheck?: Field;
  answerFields?: Field[];
  rightAnswer?: string;
  rightAnswerText?: string;
}

interface Essay {
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
  rightAnswers?: string[];
  parsedRightAnswer?: string;
  rightAnswerText?: string;
}

interface Match {
  id: number;
  type: Type;
  text: string;
  gapText: string[];
  answerOptions: string[];
  sequenceCheck?: Field;
  answerFields?: Field[];
  rightAnswers?: string[];
  rightAnswerText?: string;
}

interface GapSelect {
  id: number;
  type: Type;
  gapText: string[];
  answerOptions: string[];
  sequenceCheck?: Field;
  answerFields?: Field[];
  rightAnswers?: string[];
  rightAnswerText?: string;
}

interface DragImage {
  id: number;
  type: Type;
  text?: string;
  image: string;
  answerOptions: string[];
  sequenceCheck?: Field;
  answerFields?: Field[];
  rightAnswers?: string[];
  parsedRightAnswer?: string;
  rightAnswerText?: string;
}

interface DragText {
  id: number;
  type: Type;
  text: string;
  gaps: any[];
  answerOptions: any[];
  sequenceCheck?: Field;
  answerFields?: Field[];
  rightAnswers?: string[];
  rightAnswerText?: string;
}

interface DragImageOrText {
  id: number;
  type: Type;
  text?: string;
  image?: string;
  answerOptions: string[];
  sequenceCheck?: Field;
  answerFields?: Field[];
  rightAnswers?: string[];
  rightAnswerText?: string;
}

interface DragMarker {
  id: number;
  type: Type;
  text?: string;
  image: string;
  markers: string[];
  sequenceCheck?: Field;
  answerFields?: Field[];
  rightAnswers?: string[];
  rightAnswerText?: string;
}

interface NotSupported {
  id: number;
  text: string;
  sequenceCheck?: Field;
  answerFields?: Field[];
}
