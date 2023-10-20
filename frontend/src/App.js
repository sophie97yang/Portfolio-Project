import { Route,Switch } from "react-router-dom";
// import LoginFormPage from "./components/LoginFormPage";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { restoreUser } from "./store/session";
// import SignUpPage from "./components/SignupFormPage";
import Navigation from "./components/Navigation";
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

    {isLoaded && (<Switch></Switch>)}
    </div>
  );
}

export default App;
