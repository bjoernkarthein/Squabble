import { SimpleChanges } from '@angular/core';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, QueryList, ViewChildren } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';
import { DraggableComponent } from '../draggable/draggable.component';
import { DropZoneComponent } from '../drop-zone/drop-zone.component';

@Component({
  selector: 'app-drag-drop-text-question',
  templateUrl: './drag-drop-text-question.component.html',
  styleUrls: ['./drag-drop-text-question.component.scss'],
})
export class DragDropTextQuestionComponent implements OnChanges, AfterViewInit {
  @ViewChildren(DropZoneComponent, { read: ElementRef }) dropZones: QueryList<ElementRef>;
  @ViewChildren(DraggableComponent, { read: ElementRef }) options: QueryList<ElementRef>;

  @Input() public snippets: string[];
  @Input() public gaps: string[];
  @Input() public questionNumber: number;
  @Input() public answerOptions: any[];
  @Input() public rightAnswers: string[] = [];

  @Output() public setRightAnswer = new EventEmitter<string>();
  @Output() public changeAnswer = new EventEmitter<string[]>();

  public gestureArray: Gesture[] = [];
  public givenAnswers: string[] = [];
  public contentScrollActive = true;

  constructor(
    private gestureController: GestureController,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (!changes.questionNumber) {
      return;
    }
    let rightAnswer = '';
    this.givenAnswers = [];

    console.log('right', this.rightAnswers);
    for (let i = 0; i < this.rightAnswers.length; i++) {
      for (const aOption of this.answerOptions) {
        if (aOption.text === this.rightAnswers[i]) {
          const optionIdAndGroup = aOption.id.split('-');
          const id = optionIdAndGroup[0];
          rightAnswer += id + (i < this.rightAnswers.length - 1 ? '###' : '');
        }
      }
    }

    for (const gap of this.gaps) {
      this.givenAnswers.push('0');
    }
    this.changeAnswer.emit(this.givenAnswers);
    this.setRightAnswer.emit(rightAnswer);
  }

  public ngAfterViewInit(): void {
    this.updateGestures();
  }

  public handleDropClick(event: any): void {
    const stext = event.target.textContent;
    const value = event.target.id;

    const index = this.givenAnswers.indexOf(value);
    if (!stext.replace(/\s/g, '').length) {
      return;
    }
    this.givenAnswers[index] = '0';
    this.answerOptions.push({ text: stext, id: event.target.id });
    event.target.innerHTML = '\u00a0';
    event.target.classList.add('clear');
  }

  public getClass(answerOption: string): string {
    const groupAndId = answerOption.split('-');
    return groupAndId[1];
  }

  private updateGestures(): void {
    this.gestureArray.map(gesture => gesture.destroy());
    this.gestureArray = [];

    const arr = this.options.toArray();
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];

      const drag = this.gestureController.create({
        el: item.nativeElement,
        threshold: 0,
        gestureName: 'drag',
        onStart: ev => {
          this.contentScrollActive = false;
          this.changeDetectorRef.detectChanges();
        },
        onMove: ev => {
          item.nativeElement.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
          item.nativeElement.style.zIndex = 10;
          this.checkDropZoneHover(ev.currentX, ev.currentY);
        },
        onEnd: ev => {
          this.contentScrollActive = true;
          this.handleDrop(item, ev.currentX, ev.currentY, i);
        }
      });
      drag.enable();
      this.gestureArray.push(drag);
    }

    this.options.changes.subscribe(res => {
      if (this.gestureArray.length !== this.options.length) {
        this.updateGestures();

        const givenAnswerIds = [];
        for (const answer of this.givenAnswers) {
          givenAnswerIds.push(answer.split('-')[0]);
        }
        this.changeAnswer.emit(givenAnswerIds);
      }
    });
  }

  private checkDropZoneHover(x: number, y: number): void {
    const dropZones = this.dropZones.toArray();
    for (const drop of dropZones) {
      const box = drop.nativeElement.getBoundingClientRect();
      if (this.isInZone(x, y, box)) {
        drop.nativeElement.firstChild.style.background = 'white';
      } else {
        drop.nativeElement.firstChild.style.background = 'none';
      }
    }
  }

  private isInZone(x: number, y: number, dropZone: any): boolean {
    if (x < dropZone.left || x >= dropZone.right) {
      return false;
    }
    if (y < dropZone.top || y >= dropZone.bottom) {
      return false;
    }
    return true;
  }

  private hasSameGroup(index: number, drop: any): boolean {
    const groupAndId = this.answerOptions[index].id.split('-');
    const itemGroup = groupAndId[1];
    const gapGroup = drop.nativeElement.classList[0];
    return itemGroup === gapGroup;
  }

  private handleDrop(item: ElementRef, x: number, y: number, index: number): void {
    const dropZones = this.dropZones.toArray();
    for (let i = 0; i < dropZones.length; i++) {
      const drop = dropZones[i];
      const box = drop.nativeElement.getBoundingClientRect();
      if (this.isInZone(x, y, box) && drop.nativeElement.firstChild.classList.contains('clear') && this.hasSameGroup(index, drop)) {
        const removedItem = this.answerOptions.splice(index, 1);
        this.givenAnswers[i] = removedItem[0].id;
        drop.nativeElement.firstChild.innerHTML = removedItem[0].text;
        drop.nativeElement.firstChild.id = removedItem[0].id;
        drop.nativeElement.firstChild.classList.remove('clear');
        drop.nativeElement.style.cursor = 'pointer';
        drop.nativeElement.firstChild.style.background = 'none';
        item.nativeElement.remove();
      } else {
        item.nativeElement.style.transform = `translate(0,0)`;
        drop.nativeElement.firstChild.style.background = 'none';
      }
    }

    this.changeDetectorRef.detectChanges();
  }

}
