import { Component } from '@angular/core';
import { Group } from './groups';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent {
  groups!:Observable<Group[]>

  ngOnInit() {

  }

}
