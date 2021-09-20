import { asNativeElements, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuestionParserService {
  public rightAnswer: HTMLCollection;

  constructor() {
  }

  /**
   * Selects the right parsing function according to the provided question type
   *
   * @param question Moodle Question Object
   * @param attemptId attempt ID of the quiz attempt that the question is recieved from
   * @param inProgress If the attempt is still in progress or not
   * @returns The question object returned by the specific function
   */
  public parseQuestion(question: MoodleQuestionType, attemptId: number, inProgress: boolean) {
    const qid = question.slot;
    const questionType = question.type;

    switch (questionType) {
      case Type.MULTIPLE_CHOICE:
        return this.parseMultiChoice(qid, attemptId, inProgress);
      case Type.MATCH:
        return this.parseMatch(qid, attemptId, inProgress);
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

  /**
   * parses a multiple-choice Moodle question to display an interactive component
   *
   * @param qid Moodle question slot ID
   * @param attemptId  Moodle quiz attempt ID the question is taken from
   * @param inProgress If the attempt is still in progress or not
   * @returns A MultiPleChoice question object with the data from the Moodle question
   */
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

      answer = document.querySelector(moodleQId + ' .answer input');
      if (answer) {
        if (answer['type'] === 'radio') {
          question.multipleAllowed = false;
        }
        question.answerFields.push({ name: answer['name'], value: '' });
        document.querySelector(moodleQId + ' .answer input').remove();

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

  /**
   * parses a Moodle matching question to display an interactive component
   *
   * @param qid Moodle question slot ID
   * @param attemptId  Moodle quiz attempt ID the question is taken from
   * @param inProgress If the attempt is still in progress or not
   * @returns A Match question object with the data from the Moodle question
   */
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

  /**
   * parses a Moodle Gap Select question to display an interactive component
   *
   * @param qid Moodle question slot ID
   * @param attemptId  Moodle quiz attempt ID the question is taken from
   * @param inProgress If the attempt is still in progress or not
   * @returns A GapSelect question object with the data from the Moodle question
   */
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
    console.log(qtext);
    const gaps = qtext.split(/[^\S\r\n]{2,}/);
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

  /**
   * parses a Moodle Drag and Drop question to display an interactive component
   *
   * @param qid Moodle question slot ID
   * @param attemptId  Moodle quiz attempt ID the question is taken from
   * @param inProgress If the attempt is still in progress or not
   * @returns A DragText question object with the data from the Moodle question
   */
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

      const answerArray = rightAnswer.split(']');
      answerArray.pop();

      for (const str of answerArray) {
        question.rightAnswers.push(str.split('[')[1]);
      }
    }

    document.querySelector(moodleQId).remove();
    return question;
  }

  /**
   * parses a Moodle numeric question to display an interactive component
   *
   * @param qid Moodle question slot ID
   * @param attemptId  Moodle quiz attempt ID the question is taken from
   * @param inProgress If the attempt is still in progress or not
   * @returns A Numerical question object with the data from the Moodle question
   */
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

  /**
   * parses a Moodle Short Answer question to display an interactive component
   *
   * @param qid Moodle question slot ID
   * @param attemptId  Moodle quiz attempt ID the question is taken from
   * @param inProgress If the attempt is still in progress or not
   * @returns A ShortAnswer question object with the data from the Moodle question
   */
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

  /**
   * parses a Moodle essay question to display an interactive component
   *
   * @param qid Moodle question slot ID
   * @param attemptId  Moodle quiz attempt ID the question is taken from
   * @param inProgress If the attempt is still in progress or not
   * @returns An Essay question object with the data from the Moodle question
   */
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

  /**
   * parses a Moodle true-false question to display an interactive component
   *
   * @param qid Moodle question slot ID
   * @param attemptId  Moodle quiz attempt ID the question is taken from
   * @param inProgress If the attempt is still in progress or not
   * @returns A TrueFalse question object with the data from the Moodle question
   */
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

  /**
   * parses all not supported Moodle question types
   *
   * @param qid Moodle question slot ID
   * @param attemptId  Moodle quiz attempt ID the question is taken from
   * @returns A NotSupported question object with the data from the Moodle question
   */
  private parseNotSupported(qid: number, type: string, attemptId: number): NotSupported {
    const moodleQId = '#question-' + attemptId + '-' + qid;
    const question: NotSupported = {
      id: qid,
      text: 'This Question type is currently not supported by this App (' + type + ')',
    };

    document.querySelector(moodleQId).remove();
    return question;
  }
}

/* Moodle question type enum
  The provided strings for every enum are the question types defined by Moodle.
  These strings have to be identical to all values that Moodle can assign the 'type' property of a Moodle question object.
  If the strings do not match any predefined Moodle type string the parsing fails.
*/
export enum Type {
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
  ESSAY = 'essay',
}

/**
 * interface for a MoodleQuestionType object
 * type: string form to describe the moodle question type
 * html: HTML template of the Moodle question
 * blockedByPrevious: If the question is blocked by the previous question or not
 * slot: Position that the question appears in within the quiz
 */
export interface MoodleQuestionType {
  type: string;
  html: string;
  blockedByPrevious: boolean;
  slot: number;
}

/**
 * interface to descibe the Fields of a Moodle question
 * every field has a name and a value
 * the sequenceCheck of a question and all answer Fields are described by this interface
 */
export interface Field {
  name: string;
  value: string;
}

/**
 * interface for the multiple-choice question type
 * id: Moodle question slot number
 * type: Moodle question type
 * text: Question text
 * multipleAllowed: Determines if multiple answers can be selected or only one
 * answerOptions: All answer option texts for the question
 * sequenceCheck: Moodle sequenceCheck field that has to be sent when saving the quiz results
 * answerFields: All answer field names and values that have to be sent when saving the question
 * rightAnswers: String representation of the correct answers for the question for the multi-player mode
 * rightAnswerText: Moodle Feedback text
 */
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

/**
 * interface for the true-false question type
 * id: Moodle question slot number
 * type: Moodle question type
 * text: Question text
 * sequenceCheck: Moodle sequenceCheck field that has to be sent when saving the quiz results
 * answerFields: All answer field names and values that have to be sent when saving the question
 * rightAnswers: String representation of the correct answers for the question for the multi-player mode
 * rightAnswerText: Moodle Feedback text
 */
interface TrueFalse {
  id: number;
  type: Type;
  text: string;
  sequenceCheck: Field;
  answerFields?: Field[];
  rightAnswer?: string;
  rightAnswerText?: string;
}

/**
 * interface for the numeric question type
 * id: Moodle question slot number
 * type: Moodle question type
 * text: Question text
 * sequenceCheck: Moodle sequenceCheck field that has to be sent when saving the quiz results
 * answerFields: All answer field names and values that have to be sent when saving the question
 * rightAnswers: String representation of the correct answers for the question for the multi-player mode
 * rightAnswerText: Moodle Feedback text
 */
interface Numerical {
  id: number;
  type: Type;
  text: string;
  sequenceCheck?: Field;
  answerFields?: Field[];
  rightAnswer?: string;
  rightAnswerText?: string;
}

/**
 * interface for the short answer question type
 * id: Moodle question slot number
 * type: Moodle question type
 * text: Question text
 * sequenceCheck: Moodle sequenceCheck field that has to be sent when saving the quiz results
 * answerFields: All answer field names and values that have to be sent when saving the question
 * rightAnswers: String representation of the correct answers for the question for the multi-player mode
 * rightAnswerText: Moodle Feedback text
 */
interface ShortAnswer {
  id: number;
  type: Type;
  text: string;
  sequenceCheck?: Field;
  answerFields?: Field[];
  rightAnswer?: string;
  rightAnswerText?: string;
}

/**
 * interface for the true-false question type
 * id: Moodle question slot number
 * type: Moodle question type
 * text: Question text
 * sequenceCheck: Moodle sequenceCheck field that has to be sent when saving the quiz results
 * answerFields: All answer field names and values that have to be sent when saving the question
 */
interface Essay {
  id: number;
  type: Type;
  text: string;
  sequenceCheck?: Field;
  answerFields?: Field[];
}

/**
 * interface for the matching text question type
 * id: Moodle question slot number
 * type: Moodle question type
 * text: Question text
 * gapText: All text snippets in front of the drop-down selections
 * answerOptions: All drop-down answer option texts for the question
 * sequenceCheck: Moodle sequenceCheck field that has to be sent when saving the quiz results
 * answerFields: All answer field names and values that have to be sent when saving the question
 * rightAnswers: String representation of the correct answers for the question for the multi-player mode
 * rightAnswerText: Moodle Feedback text
 */
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

/**
 * interface for the matching text question type
 * id: Moodle question slot number
 * type: Moodle question type
 * gapText: All text snippets in front of the drop-down selections
 * answerOptions: All drop-down answer option texts for the question
 * sequenceCheck: Moodle sequenceCheck field that has to be sent when saving the quiz results
 * answerFields: All answer field names and values that have to be sent when saving the question
 * rightAnswers: String representation of the correct answers for the question for the multi-player mode
 * rightAnswerText: Moodle Feedback text
 */
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

/**
 * interface for the matching text question type
 * id: Moodle question slot number
 * type: Moodle question type
 * text: Question text without the gaps
 * gaps: List of all gaps and what group they belong to
 * answerOptions: All drop-down answer option texts for the question
 * sequenceCheck: Moodle sequenceCheck field that has to be sent when saving the quiz results
 * answerFields: All answer field names and values that have to be sent when saving the question
 * rightAnswers: String representation of the correct answers for the question for the multi-player mode
 * rightAnswerText: Moodle Feedback text
 */
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

/**
 * interface for the matching text question type
 * id: Moodle question slot number
 * text: Question text
 * sequenceCheck: Moodle sequenceCheck field that has to be sent when saving the quiz results
 * answerFields: All answer field names and values that have to be sent when saving the question
 */
interface NotSupported {
  id: number;
  text: string;
  sequenceCheck?: Field;
  answerFields?: Field[];
}
