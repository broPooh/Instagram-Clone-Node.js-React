import React from "react";
import { Redirect, NavLink } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import {get_posts} from '../../modules/get_posts';
import './Posts.css';

import User from './User';
import Post from './Post';

class Posts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      username: '',
      hashtag: '',
      posts: [],
      loading: false,
      mode: this.props.mode
    }

    this.get_by_url = this.get_by_url.bind(this);
    this.add_posts = this.add_posts.bind(this);

    console.log('this.props.mode='+this.props.mode);
  }

  componentWillMount() {
    console.log('componentWillMount()');

    var url = window.location.href;
    if(url.indexOf('posts') === -1 && url.indexOf('account') === -1) {
      this.setState({redirect: '/posts'}, () => {
        redirect: ''
      });
    }

    this.props.setPosts([]);
    this.props.setPostIndex(0);
    this.props.setSlideIndex(0);
  }

  componentDidMount() {
    if(!this.state.username && !this.state.hashtag) {
      document.addEventListener('scroll', (e) => {
        var y = e.pageY+document.body.clientHeight;
        //console.log('current:bottom='+y+':'+document.body.scrollHeight);
        if(y > document.body.scrollHeight-100 && !this.state.loading) {
          this.setState({loading: true}, () => {
            //this.props.setPosts([]);
            this.get_by_url();
          });
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps()');
    // detect url was changed
    var href = (window.location.href).toString();
    if(href != this.state.url) {
      this.setState({url: href, posts: []}, () => {
        this.props.setPosts([]);
        this.get_by_url();
      });
    }
  }

  add_posts(posts) {
    var newPosts = posts;
    var oldPosts = this.state.posts;
    if(oldPosts.length > 0) newPosts = oldPosts.concat(newPosts);
    this.setState({posts: newPosts, loading: false}, () => {
      this.props.setPosts(newPosts);
    });
  }

  get_by_url() {
    var skip = (this.state.posts.length) ? this.state.posts.length : 0;

    var username =  window.location.search.split('?user=')[1];

    var hashtag = window.location.search.split('?tag=')[1];
    if(hashtag) {
      get_posts('/posts/tag/'+hashtag, {skip: this.state.posts.length}, (posts) => {
        if(posts) this.add_posts(posts);
      });
    }

    if(!username && !hashtag) {
      if(window.location.href.indexOf('?account=') === -1) {
        //_('nav > ul.top').children[1].children[0].classList.add('active');
      }
      get_posts('/posts/read', {skip: this.state.posts.length}, (posts) => {
        if(posts) this.add_posts(posts);
      });
    }

    this.setState({username, hashtag});
  }

  render() {
    var redirect = (this.state.redirect != '') ? <Redirect to={this.state.redirect} /> : '';

    var posts = [];
    for(var i=0; i<this.props.posts.length; i++) {
      posts.push(
        <Post key={i} index={i} post={this.props.posts[i]} />
      );
    }

    var user;
    if(!this.state.username) {
      user = '';
    } else {
      user = <User />;
    }

    var tag;
    if(!this.state.hashtag) {
      tag = '';
    } else {
      tag = <div className='hashtag'>{'#'+this.state.hashtag}</div>;
    }

    return (
      <div className={'posts container'}>
        {redirect}
        {user}
        {tag}
        <div>
          {posts}
        </div>
      </div>
    );
  }
};

var mstp = state => ({
  posts: state.posts,
  account: state.account,
  dialog: state.dialog,
  mode: state.mode
});

var mdtp = dispatch => {
  return {
    setPosts: (posts) => {
      dispatch({type: 'POSTS', payload: posts});
    },
    setPostIndex: (postIndex) => {
      dispatch({type: 'POSTINDEX', payload: postIndex});
    },
    setSlideIndex: (slideIndex) => {
      dispatch({type: 'SLIDEINDEX', payload: slideIndex});
    }
  };
};
export default connect(mstp, mdtp, null, {pure: false})(Posts);
