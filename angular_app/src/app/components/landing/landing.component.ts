import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { User } from '../../user';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  @Input() user !: User;
  disabled: string = "lp-start-true"
  hidden: string = 'active-join'

  onClick() {
    console.log('join!')
  }

}
