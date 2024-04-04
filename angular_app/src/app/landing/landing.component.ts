import { Component, Input } from '@angular/core';
import { User } from '../user';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  @Input() user !: User;
  disabled: string = "lp-start-true"
  hidden: string = 'active-join'


}
