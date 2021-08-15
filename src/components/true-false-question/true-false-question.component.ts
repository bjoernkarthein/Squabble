import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-true-false-question',
  templateUrl: './true-false-question.component.html',
  styleUrls: ['./true-false-question.component.scss'],
})
export class TrueFalseQuestionComponent implements OnInit, AfterViewInit {

  @Input() public text: string;
  @Input() public questionNumber: number;
  @Input() public rightAnswer: string;

  @Output() public setRightAnswer = new EventEmitter<string>();
  @Output() public changeAnswer = new EventEmitter<string[]>();

  constructor() { }

  ngAfterViewInit(): void {
    this.changeAnswer.emit(['-1']);
  }

  ngOnInit() {
    if (this.rightAnswer === 'True') {
      this.setRightAnswer.emit('1');
    } else {
      this.setRightAnswer.emit('0');
    }
  }

  public radioGroupChange(event: any) {

    this.changeAnswer.emit([event.detail.value]);
  }

}
