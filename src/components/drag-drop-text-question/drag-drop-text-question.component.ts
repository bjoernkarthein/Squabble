import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';
import { DraggableComponent } from '../draggable/draggable.component';
import { DropZoneComponent } from '../drop-zone/drop-zone.component';

@Component({
  selector: 'app-drag-drop-text-question',
  templateUrl: './drag-drop-text-question.component.html',
  styleUrls: ['./drag-drop-text-question.component.scss'],
})
export class DragDropTextQuestionComponent implements AfterViewInit {
  @ViewChildren(DropZoneComponent, { read: ElementRef }) dropZones: QueryList<ElementRef>;
  @ViewChildren(DraggableComponent, { read: ElementRef }) options: QueryList<ElementRef>;

  @Input() public snippets: string[];
  @Input() public questionNumber: number;
  @Input() public answerOptions: any[];
  @Output() public changeAnswer = new EventEmitter<string[]>();
  public gestureArray: Gesture[] = [];
  public givenAnswers: string[] = [];
  public contentScrollActive = true;

  constructor(
    private gestureController: GestureController,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  public ngAfterViewInit(): void {
    for (const zone of this.dropZones) {
      this.givenAnswers.push('0');
    }
    this.updateGestures();
  }

  public handleDropClick(event: any): void {
    // const text = event.target.textContent;
    // const index = this.givenAnswers.indexOf(text);
    // if (text === '') {
    //   return;
    // }
    // this.givenAnswers[index] = '0';
    // this.answerOptions.push(text);
    // event.target.innerHTML = '';
    // event.target.style.background = 'none';
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
        console.log('changed');
        console.log(this.givenAnswers);
        this.changeAnswer.emit(this.givenAnswers);
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

  private handleDrop(item: ElementRef, x: number, y: number, index: number): void {
    const dropZones = this.dropZones.toArray();
    for (let i = 0; i < dropZones.length; i++) {
      const drop = dropZones[i];
      const box = drop.nativeElement.getBoundingClientRect();
      if (this.isInZone(x, y, box)) {
        const removedItem = this.answerOptions.splice(index, 1);
        this.givenAnswers[i] = removedItem[0].id;
        drop.nativeElement.firstChild.innerHTML = removedItem[0].text;
        drop.nativeElement.style.cursor = 'pointer';
        item.nativeElement.remove();
      } else {
        item.nativeElement.style.transform = `translate(0,0)`;
      }
    }

    // drop.nativeElement.style.background = 'none';
    this.changeDetectorRef.detectChanges();
  }

}
