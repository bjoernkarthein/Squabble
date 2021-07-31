import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
})
export class CourseDetailPage implements OnInit {
  @ViewChild('questions') questions: ElementRef;

  public courseInfo = {};
  public courseContent = {};
  public quizzes = new Map();
  public courseId: string;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private moodleService: MoodleService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.courseId = this.activeRoute.snapshot.paramMap.get('cid');

    this.moodleService.getCourseById(this.courseId).subscribe(info => {
      this.courseInfo = info[0];
    });

    this.moodleService.getCourseContent(this.courseId).subscribe(content => {
      this.courseContent = content[0];
    });

    this.getQuizzes(this.courseId);
  }

  public async startQuizAttempt(quizId: string, disabled: boolean) {
    const attemptInProgress = await Storage.get({ key: 'inProgressAttempt' + quizId });
    console.log(attemptInProgress);
    if (disabled) {
      return;
    } else if (attemptInProgress.value) {
      this.router.navigateByUrl('/mycourses/' + this.courseId + '/myquizzes/' + quizId);
    } else {
      this.presentAlertConfirm(quizId);
    }
  }

  private getQuizzes(courseId: string) {
    this.moodleService.getQuizzesFromCourse(courseId).subscribe(response => {
      const quizzes = response.quizzes;
      for (const quiz of quizzes) {
        const elem: Quiz = {
          title: quiz.name,
          description: quiz.intro,
          hasQuestions: quiz.hasquestions
        };
        this.quizzes.set(quiz.id, elem);
      }
    });
  }

  // private getQuestions(quizId: number) {
  //   this.moodleService.startAttemptForQuiz(quizId).subscribe(response => {
  //     const attempt = response.attempt;
  //     const attemptId = attempt.id;

  //     this.moodleService.finishAttemptForQuiz(attempt.id).subscribe(r => {
  //       this.moodleService.getFinishedQuizInfo(attemptId).subscribe(re => {
  //         const questions = re.questions;
  //         for (const question of questions) {
  //           this.questions.nativeElement.innerHTML += question.html;
  //         }
  //         const field = this.parserService.getRightAnswer();
  //         console.log(field);
  //       });
  //     });
  //   });
  // }

  private async presentAlertConfirm(quizId: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Start Quiz Attempt',
      message: 'You are about to start an attempt for the selected Quiz. Do you wish to continue?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Continue',
          handler: () => {
            this.router.navigateByUrl('/mycourses/' + this.courseId + '/myquizzes/' + quizId);
          }
        }
      ]
    });

    await alert.present();
  }
}

interface Quiz {
  title: string;
  description: string;
  hasQuestions?: number;
}
