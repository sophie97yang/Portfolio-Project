import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { GroupsComponent } from './components/groups/groups.component';

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
