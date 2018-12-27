import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Navigation from './components/main/Navigation';
import Dialog from './components/main/Dialog';
import Loader from './components/main/Loader';
import Create from './components/posts/Create';
import Posts from './components/posts/Posts';
import Login from './components/account/Login';
import Register from './components/account/Register';
import Edit from './components/account/Edit';
import Modal from './components/modal/Modal';
import Timeline from './components/timeline/Timeline';


import './App.css';

class App extends Component {

  render() {
    return (
      <BrowserRouter>
        <div>
          <Navigation />
          <Modal />
          <Dialog />
          <Loader />
          <Switch>
            <Route path="/create" component={Create} />
            <Route path="/posts" component={Posts} />
            <Route path="/account" component={Posts} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/edit" component={Edit} />
            <Route path="/timeline" component={Timeline} />
            <Route path="/" component={Posts} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
