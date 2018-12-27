import React from 'react';
import { NavLink } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import {get_posts} from '../../modules/get_posts';
import './Menu.css';

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: 0,
      likes: 0,
      saved: 0,
      selected: [true, false, false],
      url: '',
      loading: false
    }

    //this.get_posts = this.get_posts.bind(this);
    this.show_posts = this.show_posts.bind(this);
    this.show_likes = this.show_likes.bind(this);
    this.show_saved = this.show_saved.bind(this);
    this.set_border = this.set_border.bind(this);
    this.add_posts = this.add_posts.bind(this);
  }

  componentDidUpdate() {
    console.log('componentWillUpdate()');
    var url = window.location.href.toString();
    if(url != this.state.url) {
      this.props.setPosts([]);
      this.setState({url}, () => {
        setTimeout(() => {
          this.show_posts();
        }, 200);
      });
    }
  }

  componentDidMount() {
    this.set_border();

    document.addEventListener('scroll', (e) => {
      var y = e.pageY+document.body.clientHeight;
      //console.log('current:bottom='+y+':'+document.body.scrollHeight);
      if(y > document.body.scrollHeight-100 && !this.state.loading) {
        this.setState({loading: true}, () => {
          if(this.state.selected[0]) {
            this.show_posts();
          } else if(this.state.selected[1]) {
            this.show_likes();
          } else {
            this.show_saved();
          }
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      posts: nextProps.user.posts,
      likes: nextProps.user.likes,
      saved: nextProps.user.bookmarks
    });
  }

  componentWillUnmount() {
    this.props.setPosts([]);
  }

  add_posts(posts) {
    var newPosts = posts;
    var oldPosts = this.props.posts;
    if(oldPosts.length > 0) newPosts = oldPosts.concat(newPosts);
    //console.log('newPosts='+JSON.stringify(newPosts));
    this.setState({posts: newPosts.length, loading: false}, () => {
      this.props.setPosts(newPosts);
    });
  }

  show_posts(e) {
    this.props.setMode('posts');
    if(!this.state.selected[0]) this.props.setPosts([]);
    this.setState({
      selected: [true, false, false]
    }, () => {
      this.set_border();
      get_posts('/posts/readByUsername', {username: this.props.user.username, skip: this.props.posts.length}, (posts) => {
        if(posts) this.add_posts(posts);
      });
    });

  }

  show_likes(e) {
    this.props.setMode('likes');
    if(!this.state.selected[1]) this.props.setPosts([]);
    this.setState({
      selected: [false, true, false]
    }, () => {
      this.set_border();
      get_posts('/posts/readByLikes', {username: this.props.user.username, skip: this.props.posts.length}, (posts) => {
        if(posts) this.add_posts(posts);
      });
    });

  }

  show_saved(e) {
    this.props.setMode('saved');
    if(!this.state.selected[2]) this.props.setPosts([]);
    this.setState({
      selected: [false, false, true]
    }, () => {
      this.set_border();
      get_posts('/posts/readByBookmarks', {username: this.props.user.username, skip: this.props.posts.length}, (posts) => {
        if(posts) this.add_posts(posts);
      });
    });
  }

  set_border() {
    if(this.state.selected[0]) set_css('.user_posts > div', {borderTop: '1px solid #262626'});
    else set_css('.user_posts > div', {borderTop: '1px solid #ccc'});
    if(this.state.selected[1]) set_css('.user_likes > div', {borderTop: '1px solid #262626'});
    else set_css('.user_likes > div', {borderTop: '1px solid #ccc'});
    if(this.state.selected[2]) set_css('.user_saved > div', {borderTop: '1px solid #262626'});
    else set_css('.user_saved > div', {borderTop: '1px solid #ccc'});
    if(this.state.selected[0]) set_css('.user_posts > div', {color: '#262626'});
    else set_css('.user_posts > div', {color: '#999'});
    if(this.state.selected[1]) set_css('.user_likes > div', {color: '#262626'});
    else set_css('.user_likes > div', {color: '#999'});
    if(this.state.selected[2]) set_css('.user_saved > div', {color: '#262626'});
    else set_css('.user_saved > div', {color: '#999'});
  }

  render() {
    var posts = this.state.posts + ' Post';
    if(this.state.posts > 1) posts = this.state.posts + ' Posts';

    var likes = this.state.likes + ' Like';
    if(this.state.likes > 1) likes = this.state.likes + ' Likes';

    var saved = this.state.saved + ' Saved';

    return (
      <div className='row'>
        <ul className='menu'>
          <li className='user_posts' onClick={(e) => {this.show_posts(e)}} >
            <div><i className='fa fa-camera'></i><span> {posts}</span></div>
          </li>
          <li className='user_likes' onClick={(e) => {this.show_likes(e)}} >
            <div><i className='fa fa-heart-o'></i><span> {likes}</span></div>
          </li>
          <li className='user_saved' onClick={(e) => {this.show_saved(e)}} >
            <div><i className='fa fa-bookmark-o'></i><span> {saved}</span></div>
          </li>
        </ul>
      </div>
    );
  }
}

var mstp = state => ({
  user: state.user,
  posts: state.posts
});

var mdtp = dispatch => {
  return {
    setPosts: (posts) => {
      dispatch({type:'POSTS', payload: posts});
    },
    setMode: (mode) => {
      dispatch({type:'MODE', payload: mode});
    }
  }
}
export default connect(mstp, mdtp, null, {pure: false})(Menu);
