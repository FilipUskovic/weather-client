import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-city-serach',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './city-serach.component.html',
  styleUrl: './city-serach.component.scss'
})
export class CitySerachComponent {

  @Output() citySelected = new EventEmitter<string>();
  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      city: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.citySelected.emit(this.searchForm.get('city')?.value);
    }
  }
}
