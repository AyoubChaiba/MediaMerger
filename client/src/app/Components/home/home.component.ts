import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProfileComponent } from '../pop-Up models/admin-profile/admin-profile.component';
import { DeleteAllMediaComponent } from '../pop-Up models/delete-all-music/delete-all-music.component';
import { DeleteFileComponent } from '../pop-Up models/delete-file/delete-file.component';
import { DeletePhotosComponent } from '../pop-Up models/delete-photos/delete-photos.component';
import { DeleteFileModalComponent } from '../pop-Up models/delete-music-modal/delete-file-modal.component';
import { TruncatePipe } from '../../../pipes/truncate.pipe';
import { SweetAlert } from '../../DecoratedAlert/sweet-alert';
import { DeleteFileInHomeComponent } from '../pop-Up models/delete-files-in-home/delete-file-in-home.component';
import { AudioSettingsComponent } from '../pop-Up models/audio-settings/audio-settings.component';
import { FileUploadService } from './file-upload.service';

declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DeleteFileInHomeComponent,
    CommonModule,
    DeleteFileModalComponent,
    DeleteAllMediaComponent,
    DeleteFileComponent,
    AdminProfileComponent,
    DeletePhotosComponent,
    TruncatePipe,
    AudioSettingsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  videoSettings: { timeInterval: number; repeatCount: number } = {
    timeInterval: 0,
    repeatCount: 0,
  };
  adminName: string = 'Abdullah';
  selectedImage: string | ArrayBuffer | null = null;
  AllMusicFiles: File[] = [];
  fileIndexToDelete: number | null = null;
  isLoading: boolean = false;
  videoReady: boolean = false;
  videoUrl: string | null = null;

  constructor(private fileUploadService: FileUploadService) {}
  ngOnInit(): void {
    this.adminName =
      localStorage.getItem('alzkr-al7kym-adminName') || 'Abdullah';
  }
  updateAdminName(newName: string) {
    this.adminName = newName;
    localStorage.setItem('alzkr-al7kym-adminName', this.adminName);
  }

  setVideoSettings($event: any) {
    this.videoSettings = $event;
  }

  handleAudioUpload() {
    const inputElement = document.getElementById('audio-upload') as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    }
  }

  handleVideoUpload() {
    const inputElement = document.getElementById('video-upload') as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    }
  }

  handleAudioFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0 && target.files[0].type.startsWith('audio/')) {
      const file = target.files[0];
      this.AllMusicFiles.unshift(file);
    } else {
      SweetAlert.giveAlert('خطا', 'قم ب اختيار ملف صوتي صحيح');
    }
  }

  handleVideoFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  eraseAllMusic() {
    this.AllMusicFiles = [];
  }

  swapAudioFileInput($event: Event, fileIndex: number) {
    const target = $event.target as HTMLInputElement;
    if (target.files && target.files.length > 0 && target.files[0].type.startsWith('audio/')) {
      const file = target.files[0];
      this.AllMusicFiles[fileIndex] = file;
    } else {
      SweetAlert.giveAlert('خطا', 'قم ب اختيار ملف صوتي صحيح');
    }
  }

  openDeleteModal(index: number) {
    this.fileIndexToDelete = index;
    const deleteModal = new bootstrap.Modal(
      document.getElementById('deleteMusicInHomeModal')!
    );
    deleteModal.show();
  }

  deleteMusicFile(index: number) {
    if (index !== null && index >= 0 && index < this.AllMusicFiles.length) {
      this.AllMusicFiles.splice(index, 1);
    }
  }

  uploadData() {
    if (!this.selectedImage || this.AllMusicFiles.length === 0) {
      SweetAlert.giveAlert('خطا', 'الرجاء تحميل كل من الصورة وملفات الصوت.');
      return;
    }

    SweetAlert.giveAlert('تحميل...', 'يرجى الانتظار بينما يتم دمج صورة وصوت.', true);

    this.isLoading = true;
    this.fileUploadService.uploadData(this.selectedImage, this.AllMusicFiles, this.videoSettings).subscribe(
      (response) => {
        const url = window.URL.createObjectURL(response);
        this.videoUrl = url;
        SweetAlert.giveAlert('مبروك', 'تم تحويل الفيديو بنجاح!');
        this.isLoading = false;
        this.videoReady = true;
      },
      (error) => {
        SweetAlert.giveAlert('خطأ', 'حدث خطأ أثناء رفع الفيديو.');
        this.isLoading = false;
      }
    );
  }


  downloadVideo() {
    if (this.videoUrl) {
      const a = document.createElement('a');
      a.href = this.videoUrl;
      a.download = 'merged_video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      SweetAlert.giveAlert('خطأ', 'لا يوجد فيديو متاح للتحميل.');
    }
  }

  openVideoInNewTab() {
    if (this.videoUrl) {
      window.open(this.videoUrl, '_blank');
    } else {
      SweetAlert.giveAlert('خطأ', 'لا يوجد فيديو متاح للعرض.');
    }
  }


}
