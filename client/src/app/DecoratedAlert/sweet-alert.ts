import Swal from 'sweetalert2';

export class SweetAlert {
  static giveAlert(textHeadLine: string, textAlert: string, showLoading: boolean = false) {
    if (showLoading) {
      Swal.fire({
        title: textHeadLine,
        text: textAlert,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.fire({
        title: textHeadLine,
        text: textAlert,
      });
    }
  }
}
