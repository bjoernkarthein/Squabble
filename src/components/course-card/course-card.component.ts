import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss'],
})
export class CourseCardComponent implements AfterViewInit {
  @ViewChild('description') description: ElementRef;

  @Input() courseName: string;
  @Input() courseDesc: string;
  @Input() courseId: number;
  @Input() courseImage: string;
  @Input() type: string;
  @Input() disabled: boolean;

  constructor() { }

  ngAfterViewInit() {
    document.getElementById(this.courseId.toString()).innerHTML = this.courseDesc;
  }

}
