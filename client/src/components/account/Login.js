import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {http} from '../../modules/http';
import {_all, set_display} from '../../modules/script';
import {server} from '../../modules/server';
import './Login.css';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      message: '',
      redirect: ''
    }

    this.change_username = this.change_username.bind(this);
    this.change_password = this.change_password.bind(this);
    this.log_in = this.log_in.bind(this);
  }

  change_username(event) {
    this.setState({username: event.target.value});
  }

  change_password(event) {
    this.setState({password: event.target.value});
  }

  log_in() {
    set_display('.loader', 'block');
    var data = {
      username: this.state.username,
      password: this.state.password
    }
    http.post('/users/login', data)
    .then((res) => {
      set_display('.loader', 'none');
      console.log('/users/login='+JSON.stringify(res.data));
      if(res.data.success) {
        localStorage.setItem('jwtToken', res.data.token);
        var user = res.data.user;
        if(user.avatar) user.avatar = server+'/images/'+user._id+'/avatar/'+user.avatar;
        this.props.setUsername(user.username);
        this.props.setAccount(user);
        this.props.setUser(user);
        this.props.setLoggedIn(true);
        this.setState({
          username: '',
          password: '',
          redirect: '/account?user='+user.username
        });
      } else {
        this.setState({message: res.data.msg});
      }
    })
    .catch((err) => {
      set_display('.loader', 'none');
      this.setState({message: err.toString()});
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      username: nextProps.username
    });
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />;

    return (
      <div className={'login container'}>
        {redirect}
        <header><h1>Log In</h1></header>
        <form>
          <div className="form-group">
            <label>Username:</label>
            <input type="text" className="form-control" id="username" value={this.state.username}
            onChange={this.change_username} />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" className="form-control" id="password" value={this.state.password}
            onChange={this.change_password} />
          </div>
          <div className="form-group">
            <label className='message'>{this.state.message}</label>
            <input type="button" className="form-control" id="login" value="Log In" onClick={this.log_in} />
          </div>
        </form>
        <div className='to_register'>
          <p>If you don&#39;t have an account, <NavLink to="/register">Sign up</NavLink>.</p>
        </div>
      </div>
    );
  }
};

var mstp = state => ({
  username: state.username
});

var mdtp = dispatch => {
  return {
    setUsername: (username) => {
      dispatch({type: 'USERNAME', payload: username});
    },
    setLoggedIn: (loggedIn) => {
      dispatch({type: 'LOGGEDIN', payload: loggedIn});
    },
    setAccount: (account) => {
      dispatch({type: 'ACCOUNT', payload: account});
    },
    setUser: (user) => {
      dispatch({type: 'USER', payload: user});
    }
  };
};
export default connect(mstp, mdtp)(Login);
