import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MiltipleChoiceQuestionComponent } from './multiple-choice-question.component';

describe('MiltipleChoiceQuestionComponent', () => {
  let component: MiltipleChoiceQuestionComponent;
  let fixture: ComponentFixture<MiltipleChoiceQuestionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MiltipleChoiceQuestionComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MiltipleChoiceQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
