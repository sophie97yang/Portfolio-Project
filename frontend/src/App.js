import { Switch,Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { restoreUser } from "./store/session";
import Navigation from "./components/Navigation";
import LandingPage from "./components/LandingPage";
import Groups from './components/Groups';
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
      <Route exact path='/'> <LandingPage /> </Route>
      <Route path='/groups'> <Groups /> </Route>
    </Switch>)}
    </div>
  );
}

export default App;
