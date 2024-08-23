import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(
    private snackBar: MatSnackBar,
    private toastr: ToastrService
  ) {}

  showSuccess(message: string): void {
    this.toastr.success(message, 'Success');
  }

  showError(message: string): void {
    this.toastr.error(message, 'Error');
  }

  showInfo(message: string): void {
    this.toastr.info(message, 'Info');
  }

  showWarning(message: string): void {
    this.toastr.warning(message, 'Warning');
  }

  showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }


}
