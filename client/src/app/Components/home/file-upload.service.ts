import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private apiUrl = 'http://localhost:3000/upload';

  constructor(private http: HttpClient) {}

  uploadData(selectedImage: string | ArrayBuffer | null, AllMusicFiles: File[],videoSettings: { timeInterval: number; repeatCount: number }): Observable<Blob> {
    const formData = new FormData();

    if (selectedImage) {
      const imageBlob = this.dataURItoBlob(selectedImage as string);
      formData.append('image', imageBlob, 'image.png');
    }

    AllMusicFiles.forEach((file, index) => {
      formData.append('audio', file, file.name);
    });

    formData.append('timeInterval', videoSettings.timeInterval.toString());
    formData.append('repeatCount', videoSettings.repeatCount.toString());

    return this.http.post(this.apiUrl, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json',
      }),
      responseType: 'blob'
    });
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = window.atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
}
