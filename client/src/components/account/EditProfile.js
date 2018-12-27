import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import './EditProfile.css';

class EditProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      avatarURL: '',
      avatar: '',
      username: '',
      email: '',
      bio: '',
      message: '',
      redirect: false,
      redirectTo: '',
      wait: false
    }

    this.on_load = this.on_load.bind(this);
    this.change_avatar = this.change_avatar.bind(this);
    this.change_text = this.change_text.bind(this);
    this.post_data = this.post_data.bind(this);
    this.click_username = this.click_username.bind(this);
  }

  on_load(e) {
    console.log('on_load()');
    var img = e.target;
    if(img.clientHeight < 75) {
      img.style.width = 'auto';
      img.style.height = '101%';
    } else {
      img.style.width = '101%';
      img.style.height = 'auto';
    }
  }

  change_avatar(e) {
    this.setState({
      avatarURL: URL.createObjectURL(e.target.files[0]),
      avatar: e.target.files[0]
    });
  }

  change_text(e, key) {
    this.setState({
      [key]: e.target.value
    });
  }

  post_data(e) {
    if(!this.state.wait) {
      this.setState({wait: true});
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      if (localStorage.getItem("jwtToken") === null) {
        this.setState({redirect: true, redirectTo: 'login'});
      } else {
        var fd = new FormData();
        fd.append('avatar', this.state.avatar);
        fd.append('username', this.state.username);
        fd.append('email', this.state.email);
        fd.append('bio', this.state.bio);
        http({
          method: 'post',
          url: '/users/edit',
          data: fd,
          config: {headers: {'Content-Type': 'multipart/form-data'}}
        })
        .then((res) => {
          console.log('/users/edit='+JSON.stringify(res.data));
          if(res.data.success) {
            var user = res.data.user;
            if(user.avatar) user.avatar = server+'/images/'+user._id+'/avatar/'+user.avatar;
            this.props.setUsername(user.username);
            this.props.setAccount(user);
            this.props.setUser(user);
            this.setState({redirect: true, redirectTo: 'posts?user='+user.username});
          } else {
            this.setState({
              message: res.data.msg,
              wait: false
            });
          }
        });
      }
    }
  }

  click_username() {
    console.log('click_username()');
    this.setState({redirect: true, redirectTo: '/posts?user='+this.state.username});
  }

  componentDidMount() {
    this.setState({
      avatarURL: this.props.user.avatar,
      username: this.props.user.username,
      email: this.props.user.email,
      bio: this.props.user.bio
    });
  }

  render() {
    var redirect = '';
    if(this.state.redirect) redirect = <Redirect to={this.state.redirectTo} />;

    var img = (this.state.avatarURL) ? <img src={this.state.avatarURL} onLoad={(e) => {this.on_load(e)}} /> : '';

    return (
      <div className='edit_profile'>
        {redirect}
        <div className='row'>
          <div className='avatar_wrapper'>
            {img}
            <input type='file' onChange={(e) => {this.change_avatar(e)}} accept='image/*' />
          </div>
          <div className='name_wrapper'>
            <h1 onClick={() => {this.click_username()}}>@{this.state.username}</h1>
          </div>
        </div><br />
        <div className='row form-group'>
          <label>Username:</label>
          <input className='form-control' type='text'
          onChange={(e) => this.change_text(e, 'username')} value={this.state.username} />
        </div>
        <div className='row form-group'>
          <label>Email:</label>
          <input className='form-control' type='email'
          onChange={(e) => this.change_text(e, 'email')} value={this.state.email} />
        </div>
        <div className='row form-group'>
          <label>Bio:</label>
          <textarea className='form-control'
          onChange={(e) => this.change_text(e, 'bio')} value={this.state.bio} />
        </div>
        <div className='row form-group'>
          <label className='message'>{this.state.message}</label>
          <button className='btn btn-primary btn_edit' onClick={(e) => this.post_data(e)}>Edit Profile</button>
        </div>
      </div>
    );
  }
};

var mstp = state => ({
  user: state.user
});

var mdtp = dispatch => {
  return {
    setUsername: (username) => {
      dispatch({type: 'USERNAME', payload: username});
    },
    setAccount: (account) => {
      dispatch({type: 'ACCOUNT', payload: account});
    },
    setUser: (user) => {
      dispatch({type: 'USER', payload: user});
    }
  };
};

export default connect(mstp, mdtp)(EditProfile);
