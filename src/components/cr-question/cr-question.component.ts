import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-cr-question',
  templateUrl: './cr-question.component.html',
  styleUrls: ['./cr-question.component.scss'],
})
export class CrQuestionComponent implements OnInit {

  @Input() public text: string;
  @Input() public questionNumber: number;
  @Output() public changeAnswer = new EventEmitter<string[]>();

  constructor() { }

  ngOnInit() { }

  //TODO: possibly change so answer is not updated on every keystroke
  public inputChange(event: any): void {
    this.changeAnswer.emit([event.target.value]);
  }

}
