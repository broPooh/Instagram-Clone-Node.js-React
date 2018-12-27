import React from 'react';
import { NavLink, Link, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import './User.css';

import Menu from './Menu';
import UsersWindow from './UsersWindow';

class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      followed: false,
      user: {},
      unselected: false,
      url: '',
      usersWindow: ''
    }

    this.get_user = this.get_user.bind(this);
    this.follow_user = this.follow_user.bind(this);
    this.followed_or_not = this.followed_or_not.bind(this);
    this.set_window = this.set_window.bind(this);
  }

  get_user() {
    var username = window.location.search.split('user=')[1];
    if(username && username != this.state.user.username) {
      console.log('username='+username);
      http.get('/users/'+username) // get user data
      .then((res) => {
        console.log('res.data.user='+JSON.stringify(res.data.user));
        if(res.data.success) {
          var user = res.data.user;
          if(user.avatar) user.avatar = server+'/images/'+user._id+'/avatar/'+user.avatar;
          this.props.setUser(user);
          this.setState({user}, () => {
            this.followed_or_not();
          });
        }
      });
    }

  }

  follow_user() {
    if(this.props.loggedIn) {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.post('/relationships/follow', {username: this.props.user.username})
      .then((res) => {
        console.log('/relationships/follow/='+JSON.stringify(res.data));
        if(res.data.success) {
          var user = this.props.user;
          user.followers = res.data.followers;
          this.props.setUser(user);
          var account = this.props.account;
          account.following = res.data.following;
          this.props.setAccount(account);
          this.setState({
            followed: res.data.followed,
            user: user
          });

        }
      });
    } else {
      this.setState({
        redirect: '/login'
      });
    }
  }

  followed_or_not() {
    if(this.props.loggedIn) {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.get('/relationships/followed', {params: {followedId: this.state.user._id}})
      .then((res) => {
        console.log('followed='+JSON.stringify(res.data));
        if(res.data.success) {
          this.setState({followed: res.data.followed});
        }
      });
    }
  }

  set_window(name) {
    this.setState({usersWindow: name});
  }

  componentWillMount() {
    // set data to redux(user: {})
    this.get_user();
  }

  componentDidMount() {
    if(window.location.href.indexOf('account?') > -1) {
      _('.li_register > a').classList.add('active');
    } else {
      _('.li_register > a').classList.remove('active');
    }
  }

  componentWillReceiveProps() {
    this.get_user();
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />;

    // follow button
    var button = '';
    if(!this.state.followed) {
      button = (
        <button className='btn btn-primary follow_button' onClick={() => {this.follow_user()}}>Follow</button>
      );
    } else {
      button = (
        <button className='btn btn-default follow_button following' onClick={() => {this.follow_user()}}></button>
      );
    }

    var createButton = '';
    if(this.state.user.username === this.props.username) {
      createButton = <Link to='/create'><button className='btn btn-default'>Post Image</button></Link>
    }

    // edit button
    if(this.props.loggedIn) {
      if(this.props.username == this.props.user.username) {
        button = <NavLink to='/edit' className='btn btn-default'>Edit Profile</NavLink>;
      }
    }

    // avatar
    var avatar = (this.state.user.avatar) ? <img src={this.state.user.avatar} /> : '';

    // show followers or following
    var usersWindow = (this.state.usersWindow) ?
      <UsersWindow set_window={this.set_window} name={this.state.usersWindow}
      userId={this.state.user._id} accountId={this.props.account._id} /> : '';


    return (
      <div className='user'>
        {redirect}
        <div className='row'>
          <div className='avatar'>
            <div className='avatar_border'>
              <div className='avatar_wrapper'>
                {avatar}
              </div>
            </div>
          </div>
          <div className='profile'>
            <div className='row top'>
              <div className='username'>@{this.state.user.username}</div>
              <div className='topButtons'>
                <div className='edit_button'>{button}</div>
                <div className='create_button'>{createButton}</div>
              </div>
            </div>
            <ul className='row info'>
              <li><span>{this.state.user.posts}</span> <span>posts</span></li>
              <li onClick={() => {this.set_window('Followers')}}>
                <span>{this.state.user.followers}</span> <span>followers</span>
              </li>
              <li onClick={() => {this.set_window('Following')}}>
                <span>{this.state.user.following}</span> <span>following</span>
              </li>
            </ul>
            <p className='row bio'>{this.state.user.bio}</p>
          </div>
        </div>
        <Menu user={this.state.user} />
        {usersWindow}
      </div>
    );
  }
}

var mstp = state => ({
  loggedIn: state.loggedIn,
  username: state.username,
  user: state.user,
  account: state.account
});

var mdtp = dispatch => {
  return {
    setAccount: (data) => {
      dispatch({
        type: 'ACCOUNT',
        payload: data
      });
    },
    setUser: (data) => {
      dispatch({
        type: 'USER',
        payload: data
      });
    },
    setPosts: (data) => {
      dispatch({
        type: 'POSTS',
        payload: data
      });
    }
  };
};
export default connect(mstp, mdtp, null, {pure: false})(User);
