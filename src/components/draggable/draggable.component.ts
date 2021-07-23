import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-draggable',
  templateUrl: './draggable.component.html',
  styleUrls: ['./draggable.component.scss'],
})
export class DraggableComponent implements OnInit {

  @Input() public text: string;
  @Input() public image: string;

  constructor() { }

  ngOnInit() { }

}
