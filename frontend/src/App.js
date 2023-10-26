import { Switch,Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch} from "react-redux";
import { restoreUser } from "./store/session";
import Navigation from "./components/Navigation";
import LandingPage from "./components/LandingPage";
import Groups, { CurrentGroups } from './components/Groups';
import GroupDetails from "./components/GroupDetails";
import Events from "./components/Events";
import EventDetails from "./components/EventDetails";
import UpdateGroup from "./components/GroupForm/UpdateGroup";
import CreateGroup from "./components/GroupForm/CreateGroup";
import CreateEvent from "./components/EventForm/CreateEvent";
function App() {
  const dispatch = useDispatch();
  const [isLoaded,setIsLoaded] = useState(false);

  useEffect(()=> {
    dispatch(restoreUser())
    .then(setIsLoaded(true));

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
        <CreateGroup />
      </Route>

      <Route exact path='/groups/current'>
        <CurrentGroups />
      </Route>

      <Route path='/groups/:id/events/new'>
        <CreateEvent />
      </Route>

      <Route path='/groups/:id/edit'>
        <UpdateGroup />
      </Route>

      <Route path='/groups/:id/join'>
        <h2>Feature coming soon!</h2>
      </Route>

      <Route path='/groups/:id'>
          <GroupDetails/>
      </Route>

      <Route path='/groups'>
          <Groups />
      </Route>
      <Route path='/events/:id/edit'>
        <h2>Feature Coming Soon!</h2>
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
