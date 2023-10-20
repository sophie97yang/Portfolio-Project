import { Route,Switch } from "react-router-dom";
import LoginFormPage from "./components/LoginFormPage";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { restoreUser } from "./store/session";
import SignUpPage from "./components/SignupFormPage";
function App() {
  const dispatch = useDispatch();
  const [isLoaded,setIsLoaded] = useState(false);

  useEffect(()=> {
    dispatch(restoreUser())
    .then(setIsLoaded(true));

  },[dispatch]);

  return (
    <div>
    <h1>MeetYou</h1>
    <Switch>
    <Route path='/login'>
      <LoginFormPage />
    </Route>

    <Route path='/signup'>
      <SignUpPage />
    </Route>
    </Switch>

    </div>
  );
}

export default App;
