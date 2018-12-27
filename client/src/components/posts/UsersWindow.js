import React from 'react';
import {Redirect, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import './UsersWindow.css';

class UsersWindow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      users: []
    }

    this.close_window = this.close_window.bind(this);
    this.close_to_redirect = this.close_to_redirect.bind(this);
    this.get_users = this.get_users.bind(this);
    this.follow_user = this.follow_user.bind(this);
  }

  close_window(e) {
    console.log(e.target.classList);
    if(e.target.className.indexOf('usersWindow') > -1 || e.target.className.indexOf('close') > -1) {
      this.props.set_window('');
    }
  }

  componentDidMount() {
    console.log('componentDidMount()');
    if(this.props.name === 'Followers') {
      this.get_users('/relationships/followers');
    } else if(this.props.name === 'Following') {
      this.get_users('/relationships/following');
    }
  }

  get_users(url) {
    console.log('get_users() by username='+this.props.userId);
    if(localStorage.getItem('jwtToken')) http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    http.get(url, {params: {userId: this.props.userId}})
    .then((res) => {
      console.log(url+'='+JSON.stringify(res.data));
      if(res.data.success) {
        var users = res.data.users;
        var arr = []; // new users array for not null user
        for(var i=0; i<users.length; i++) {
          if(users[i]) {
            console.log(users[i].username);
            if(users[i].avatar) users[i].avatar = server+'/images/'+users[i]._id+'/avatar/'+users[i].avatar;
            arr.push(users[i]);
          }
        }
        this.setState({users: arr, redirect: ''});
      }
    });
  }

  close_to_redirect(e) {
    var text = e.target.innerText;
    var username = text.substr(1, text.length-1);
    this.setState({redirect: '/posts?user='+username}, () => {
      this.setState({redirect: ''}, () => {
        this.props.set_window('');
      });
    });
  }

  follow_user(e) {
    var username = e.target.getAttribute('name');
    if(localStorage.getItem('jwtToken')) {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      http.post('/relationships/follow', {username})
      .then((res) => {
        console.log('/relationships/follow/='+JSON.stringify(res.data));
        if(res.data.success) {
          var users = this.state.users;
          for(var u of users) {
            if(u.username == username) {
              u.followed = res.data.followed;
            }
          }
          this.setState({users});
          /*
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
          */
        }
      });
    } else {
      this.setState({redirect: '/login'}, () => {
        redirect: ''
      });
    }

  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    // users
    var users = [];
    for(var i=0; i<this.state.users.length; i++) {
      console.log(i);
      var user = this.state.users[i];
      var none = '';
      if(user._id == this.props.accountId) none = 'none';
      var li = (
        <li key={i}>
          <div className='avatar'>
            <img src={user.avatar} />
          </div>
          <div className='username' onClick={(e) => this.close_to_redirect(e)}>@{user.username}</div>
          <div className='info'>
            <span>{user.posts} posts</span>
            <span>{user.likes} likes</span>
          </div>
          <button className={'btn btn-default '+((user.followed) ? 'followed' : '')+' '+none} name={user.username}
          onClick={(e) => {this.follow_user(e)}}></button>
        </li>
      );
      users.push(li);
    }

    return (
      <div className='usersWindow' onClick={(e) => {this.close_window(e)}}>
        {redirect}
        <div className='wrapper'>
          <h3>
            {this.props.name}<i className='fa fa-close close'></i>
          </h3>
          <ul>
            {users}
          </ul>
        </div>
      </div>
    );
  }
}

export default UsersWindow;
