import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { GroupsComponent } from './groups/groups.component';

export const routes: Routes = [
    {
        path:'',
        component:LandingComponent,
        title:'Home Page'
    },
    {
        path:'groups',
        component: GroupsComponent,
        title: 'Groups'
    }
];
