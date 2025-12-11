import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './users-grid.component.html',
  styleUrl: './users-grid.component.scss',
})
export class UsersGridComponent implements OnInit {
  columnDefs = [
    { field: 'id', sortable: true },
    { field: 'name', filter: true },
    { field: 'email' },
    { field: 'phone' },
  ];

  rowData: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http
      .get('https://jsonplaceholder.typicode.com/users')
      .subscribe((data: any) => (this.rowData = data));
  }
}
