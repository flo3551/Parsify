import { Component } from 'react';
import { Route, Switch } from "react-router-dom";
import './App.css';
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Login } from "./components/Login/Login";
import { Signup } from "./components/Signup/Signup";
import { Landing } from "./components/Landing/Landing";

class App extends Component {
  render() {

    return (
      <div className="App">
        <div className="App-content">
          <Switch>
            <Route exact path="/" component={Landing}></Route>
            <Route exact path="/login" component={Login}></Route>
            <Route exact path="/signup" component={Signup}></Route>
            <Route exact path="/dashboard" component={Dashboard}></Route>
          </Switch>
        </div>
      </div>
    );
  }
}
export default App;
