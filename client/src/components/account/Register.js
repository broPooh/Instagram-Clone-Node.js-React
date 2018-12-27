import React from "react";
import { Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import './Register.css';
import {http} from '../../modules/http';
import {_, _all, set_display} from '../../modules/script';

class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      error: '',
      user: {
        username: '',
        email: '',
        password: '',
        confirmation: ''
      }
    }

    this.on_change = this.on_change.bind(this);
    this.post_data = this.post_data.bind(this);
  }

  on_change(event) {
    const { name, value } = event.target;
    //console.log('['+name+']='+value);
    this.setState({
      user: {
          ...this.state.user,
          [name]: value
      }
    });
  }

  post_data() {
    set_display('.loader', 'block');
    var {user} = this.state;
    var data = {
      username: user.username,
      email: user.email,
      password: user.password,
      confirmation: user.confirmation
    }
    http.post('/users/register', data)
    .then((res) => {
      console.log('/users/register='+JSON.stringify(res.data));
      set_display('.loader', 'none');
      if(res.data.success) {
        //this.setState({redirect: 'login'});
        localStorage.setItem('jwtToken', res.data.token);
        this.props.setUsername(res.data.user.username);
        this.props.setAccount(res.data.user);
        this.props.setUser(res.data.user);
        this.props.setLoggedIn(true);
        this.setState({
          username: '',
          password: '',
          redirect: '/account?user='+data.username
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

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />;

    var {user} = this.state;

    console.log('user='+this.state.message);

    return (
      <div className={'register container'}>
        {redirect}
        <header><h1>Register</h1></header>
        <form>
          <div className="form-group">
            <label>Username: <span id='for_username'></span></label>
            <input type="text" className="form-control" id="username" name='username' onChange={this.on_change} />
          </div>
          <div className="form-group">
            <label>Email address: <span id='for_email'></span></label>
            <input type="email" className="form-control" id="email" name='email' onChange={this.on_change} />
          </div>
          <div className="form-group">
            <label>Password: <span id='for_password'></span></label>
            <input type="password" className="form-control" id="password" name='password' onChange={this.on_change} />
          </div>
          <div className="form-group">
            <label>Confirm password: <span id='for_confirmation'></span></label>
            <input type="password" className="form-control" id="confirmation" name='confirmation' onChange={this.on_change} />
          </div>
          <div className="form-group">
            <label><span id='for_post'>{this.state.message}</span></label>
            <input type="button" className="form-control" id="submit" value="Register" onClick={this.post_data} />
          </div>
        </form>
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

export default connect(mstp, mdtp)(Register);
