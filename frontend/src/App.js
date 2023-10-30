import { Switch,Route,NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch} from "react-redux";
import { restoreUser } from "./store/session";
import Navigation from "./components/Navigation";
import LandingPage from "./components/LandingPage";
import Groups, { CurrentGroups } from './components/Groups';
import GroupDetails from "./components/GroupDetails";
import Events, { CurrEvents } from "./components/Events";
import EventDetails from "./components/EventDetails";
import UpdateGroup from "./components/GroupForm/UpdateGroup";
import CreateGroup from "./components/GroupForm/CreateGroup";
import CreateEvent from "./components/EventForm/CreateEvent";


function App() {
  const dispatch = useDispatch();
  const [isLoaded,setIsLoaded] = useState(false);

  useEffect(()=> {
    dispatch(restoreUser())
    .then(()=> setIsLoaded(true));

  },[dispatch]);

  return (
    <div>
    <Navigation isLoaded={isLoaded}/>

    {isLoaded && (
    <Switch>

      <Route exact path='/'>
          <LandingPage />
      </Route>

      <Route exact path='/groups/new'>
        <CreateGroup isLoaded={isLoaded}/>
      </Route>

      <Route exact path='/groups/current'>
        <CurrentGroups />
      </Route>

      <Route path='/groups/:id/events/new'>
        <CreateEvent isLoaded={isLoaded}/>
      </Route>

      <Route path='/groups/:id/edit'>
        <UpdateGroup isLoaded={isLoaded}/>
      </Route>

      <Route path='/groups/:id/join'>
        <h2 className='feature-coming-soon'>Feature coming soon! 🙏</h2>
        <NavLink to='/groups' className='feature-coming-soon'>Click here to go back to Groups</NavLink>
      </Route>

      <Route path='/groups/:id'>
          <GroupDetails/>
      </Route>

      <Route path='/groups'>
          <Groups />
      </Route>

      <Route path='/events/current'>
        <CurrEvents />
      </Route>

      <Route path='/events/:id/edit'>
        <h2 className='feature-coming-soon'>Feature Coming Soon! 🙏</h2>
        <NavLink to='/events' className='feature-coming-soon'>Click here to go back to Events</NavLink>
      </Route>
      <Route path='/events/:id'>
        <EventDetails />
      </Route>

      <Route path='/events'>
          <Events />
      </Route>
      <Route>
        <h2>Page Not Found 😞</h2>
      </Route>
    </Switch>)}
    </div>
  );
}

export default App;
