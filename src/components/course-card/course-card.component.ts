import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss'],
})
export class CourseCardComponent implements AfterViewInit {
  @ViewChild('description') description: ElementRef;


  @Input() courseName: string;
  @Input() courseDesc: string;
  @Input() courseImage: string;

  constructor() { }

  ngAfterViewInit() {
    this.description.nativeElement.innerHTML = this.courseDesc;
  }

}
