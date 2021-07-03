import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MoodleService {

  private moodleBaseUrl = 'http://localhost/moodle/webservice/rest/server.php?';
  private webServiceUserToken = 'bc5bdc9864c5e40365ab5e33dd188ad2';

  constructor(private http: HttpClient) { }

  //TODO: Possibly change type any to interface for the important calls?
   public getCourseInfo() {
    return this.http.get<any>(this.getRequestUrl(this.webServiceUserToken, 'core_webservice_get_site_info' , 'json'));
   }

   private getRequestUrl(wstoken: string, wsfunction: string, moodlewsrestformat: string): string {
    return this.moodleBaseUrl + 'wstoken=' + wstoken + '&wsfunction=' + wsfunction + '&moodlewsrestformat=' + moodlewsrestformat;
   }
}
