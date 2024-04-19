import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { GroupsComponent } from './groups/groups.component';

export const routes: Routes = [
    {
        path:'',
        component:LandingComponent,
        title:'Meet U | Find Local Groups, Events, and Activities Near You'
    },
    {
        path:'groups',
        component: GroupsComponent,
        title: 'Meet U | All Groups'
    }
];
