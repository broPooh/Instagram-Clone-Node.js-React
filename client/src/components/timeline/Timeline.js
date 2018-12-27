import React from 'react';
import {Redirect, NavLink, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import {get_posts} from '../../modules/get_posts';
import './Timeline.css';

import TPost from './TPost';

class Timeline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      posts: [],
      loading: false,
      following: [],
      followers: []
    }

    this.add_posts = this.add_posts.bind(this);
    this.get_users = this.get_users.bind(this);
  }

  componentWillMount() {
    //console.log('Timeline - componentWillMount()');
    if(this.props.loggedIn) {
      http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
      get_posts('/posts/getTimeline', {skip: this.state.posts.length}, (posts) => {
        if(posts) this.add_posts(posts);
      });

      document.addEventListener('scroll', (e) => {
        var y = e.pageY+document.body.clientHeight;
        //console.log('current:bottom='+y+':'+document.body.scrollHeight);
        if(y > document.body.scrollHeight-100 && !this.state.loading) {
          this.setState({loading: true}, () => {
            get_posts('/posts/getTimeline', {skip: this.state.posts.length}, (posts) => {
              if(posts) this.add_posts(posts);
            });
          });
        }
      });
    } else {
      this.setState({redirect: '/login'});
    }
  }

  componentDidMount() {
    this.get_users('/relationships/followers');
    this.get_users('/relationships/following');
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.posts) {
      this.setState({posts: nextProps.posts});
    }
  }

  get_users(url) {
    if(!this.props.account) return;
    http.get(url, {params: {userId: this.props.account._id}})
    .then((res) => {
      //console.log(url+'='+JSON.stringify(res.data));
      if(res.data.success) {
        var users = res.data.users;
        var arr = [];
        for(var i=0; i<users.length; i++) {
          if(users[i]) {
            if(users[i].avatar) users[i].avatar = server+'/images/'+users[i]._id+'/avatar/'+users[i].avatar;
            arr.push(users[i]);
          }
        }
        if(url.indexOf('followers') > -1) {
          this.setState({followers: arr});
        } else {
          this.setState({following: arr});
        }
      }
    });
  }

  add_posts(posts) {
    var newPosts = posts;
    var oldPosts = this.state.posts;
    if(oldPosts.length > 0) newPosts = oldPosts.concat(newPosts);
    this.setState({posts: newPosts, loading: false}, () => {
      this.props.setPosts(newPosts);
    });
  }

  render() {
    var redirect = (this.state.redirect) ? <Redirect to={this.state.redirect} /> : '';

    // posts
    var posts = [];
    if(this.state.posts) {
      for(var i=0; i<this.state.posts.length; i++) {
        var id = this.state.posts[i]._id;
        posts.push(
          <TPost key={i} index={i} post={this.state.posts[i]} />
        );
      }
    }

    // account avatar
    var avatar = (this.props.account.avatar) ? <img src={this.props.account.avatar} /> : '';

    // following
    var following = [];
    if(this.state.following) {
      for(var i=0; i<this.state.following.length; i++) {
        var img = (this.state.following[i].avatar) ? <img src={this.state.following[i].avatar} /> : '';
        following.push(
          <li key={i}>
            <Link to={'/posts?user='+this.state.following[i].username}>
              <div className='avatar'>{img}</div>
              <div className='username'>@{this.state.following[i].username}</div>
              <div className='info'>{this.state.following[i].posts} posts</div>
            </Link>
          </li>
        );
      }
    }

    // followers
    var followers = [];
    if(this.state.followers) {
      for(var i=0; i<this.state.followers.length; i++) {
        followers.push(
          <li key={i}>
            <Link to={'/posts?user='+this.state.followers[i].username}>
              <div className='avatar'><img src={this.state.followers[i].avatar} /></div>
              <div className='username'>@{this.state.followers[i].username}</div>
              <div className='info'>{this.state.followers[i].posts} posts</div>
            </Link>
          </li>
        );
      }
    }

    return (
      <div className='timeline'>
        {redirect}
        <div className='container'>
          <div className='row'>
            <div className='col-lg-8'>
              {posts}
            </div>
            <div className='col-lg-4 right_profile'>
              <div className='profile'>
                <div className='avatar'>
                  {avatar}
                </div>
                <div className='username'>
                  <h1><Link to={'/posts?user='+this.props.account.username}>@{this.props.account.username}</Link></h1>
                  <div className='info'>{this.props.account.posts} posts</div>
                </div>
              </div>
              <div className='following'>
                <h3 className='title'>Following</h3>
                <ul>{following}</ul>
              </div>
              <div className='followers'>
                <h3 className='title'>Followers</h3>
                <ul>{followers}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

var mstp = state => ({
  posts: state.posts,
  account: state.account,
  loggedIn: state.loggedIn,
});

var mdtp = dispatch => {
  return {
    setPosts: (data) => {
      dispatch({type: 'POSTS', payload: data});
    }
  };
};

export default connect(mstp, mdtp)(Timeline);
