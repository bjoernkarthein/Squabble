import { TestBed } from '@angular/core/testing';

import { QuestionParserService } from './question-parser.service';

describe('QuestionParserService', () => {
  let service: QuestionParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
