import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
  @Input() public answerOptions: string[];
  public gestureArray: Gesture[] = [];
  public givenAnswers: string[] = [];

  constructor(
    private gestureController: GestureController,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  public ngAfterViewInit(): void {
    for (const zone of this.dropZones) {
      this.givenAnswers.push('');
    }
    this.updateGestures();
    console.log(this.dropZones);
  }

  public handleDropClick(event: any): void {
    const text = event.target.textContent;
    const index = this.givenAnswers.indexOf(text);
    if (text === '') {
      return;
    }
    this.givenAnswers[index] = '';
    console.log(this.givenAnswers);
    this.answerOptions.push(text);
    event.target.innerHTML = '';
    event.target.style.background = 'none';
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
          this.changeDetectorRef.detectChanges();
        },
        onMove: ev => {
          item.nativeElement.style.transform = `translate(${ev.deltaX}px, ${ev.deltaY}px)`;
          item.nativeElement.style.zIndex = 10;
          this.checkDropZoneHover(ev.currentX, ev.currentY);
        },
        onEnd: ev => {
          this.handleDrop(item, ev.currentX, ev.currentY, i);
        }
      });
      drag.enable();
      this.gestureArray.push(drag);
    }

    this.options.changes.subscribe(res => {
      if (this.gestureArray.length !== this.options.length) {
        console.log('changed');
        this.updateGestures();
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
        this.givenAnswers[i] = removedItem[0];
        drop.nativeElement.firstChild.innerHTML = removedItem[0];
        drop.nativeElement.style.cursor = 'pointer';
        item.nativeElement.remove();
        console.log(this.givenAnswers);
      } else {
        item.nativeElement.style.transform = `translate(0,0)`;
      }
    }

    // drop.nativeElement.style.background = 'none';
    this.changeDetectorRef.detectChanges();
  }

}
