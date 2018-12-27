import React from "react";
import { Link, NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {http} from '../../modules/http';
import {_, _all} from '../../modules/script';
import './Navigation.css';
import Search from './Search';

class Navigation extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      redirect: '',
      activeUser: false,
      mobileList: false,
    }

    this.log_out = this.log_out.bind(this);
    this.set_color = this.set_color.bind(this);
    this.show_mobile_list = this.show_mobile_list.bind(this);
    this.hide_mobile_list = this.hide_mobile_list.bind(this);
  }

  log_out(e) {
    http.get('/users/logout')
    .then((res) => {
      //console.log('/users/logout='+JSON.stringify(res.data));
      if(res.data.success) {
        localStorage.setItem("jwtToken", null);
        this.props.setLoggedIn(false);
        this.props.setUsername('');
        this.props.setAccount({});
        console.log('log out');
        this.setState({
          redirect: '/login'
        });
      }
    });
  }

  set_color(e, i) {
    e.preventDefault();
    var list = _all('nav ul li');
    for(var j=0; j<list.length; j++) {
      list[j].querySelector('a').classList.remove('active');
    }
    if(i > -1) list[i].querySelector('a').classList.add('active');
  }

  show_mobile_list() {
    if(this.state.mobileList) this.hide_mobile_list();
    else this.setState({mobileList: true});
  }

  hide_mobile_list() {
    _('.mobile_list').classList.add('toLeft');
    setTimeout(() => {
      this.setState({mobileList: false});
    }, 500);

  }

  componentDidMount() {
    window.addEventListener('scroll', () => {
      console.log();
      var t = document.body.scrollTop;
      if(t < 15) {
        _('nav').classList.remove('scrolled');
      } else {
        _('nav').classList.add('scrolled');
      }
    });

  }

  componentWillReceiveProps() {
    // set default after logout
    this.setState({
      redirect: ''
    });

    // active navigation @user
    var href = (new URL(window.location.href)).toString();
    //var url = new URL(window.location.href);
    //var username = url.searchParams.get('user');
    var username = window.location.search.split('?user=')[1];
    if(_('li_login')) {
      if(href.indexOf('account') > -1 && this.props.username == username) {
        _('li_login').querySelector('a').classList.add('active');
      } else {
        _('li_login').querySelector('a').classList.remove('active');
      }
    }
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />;

    // end list items
    var login = '';
    var register = '';
    if(!this.props.loggedIn) {
      console.log('render: 1 token='+localStorage.getItem("jwtToken"));
      login = (<NavLink to="/login" activeClassName='active'>Log in</NavLink>);
      register = (<NavLink to="/register" activeClassName='active'>Register</NavLink>);
    } else {
      login = (<span onClick={(e) => {this.log_out(e)}}>Log out</span>);
      register = (<NavLink to={'/account?user='+this.props.username} activeClassName='active'>@{this.props.username}</NavLink>);
    }

    var mobileList = '';
    if(this.state.mobileList) {
      mobileList = (
        <ul className='mobile_list' onClick={() => {this.hide_mobile_list()}}>
          <li><i className='fa fa-image'></i><NavLink to="/posts" activeClassName='active'>Instagram</NavLink></li>
          <li><i className='fa fa-image'></i><NavLink to="/create"  activeClassName='active'>Create</NavLink></li>
          <li><i className='fa fa-image'></i>{login}</li>
          <li><i className='fa fa-image'></i>{register}</li>
        </ul>
      );
    }

    return (
      <nav>
        {redirect}
        <ul className='container top desktop'>
          <li><NavLink to="/timeline"  activeClassName='active'><i className='fa fa-instagram'></i></NavLink></li>
          <li><NavLink to="/posts" activeClassName='active'>Instagram</NavLink></li>
          <li><Search /></li>
          <li className='li_register'>{register}</li>
          <li className='li_login'>{login}</li>
        </ul>
        <ul className='container top mobile'>
          <li className='toggle' onClick={() => {this.show_mobile_list()}}><i className='fa fa-bars'></i></li>
          <li><Search /></li>
        </ul>
        {mobileList}
      </nav>
    );
  }
};

var mstp = state => ({
  username: state.username,
  loggedIn: state.loggedIn
});

var mdtp = dispatch => {
  return {
    setLoggedIn: (data) => {
      dispatch({
        type: 'LOGGEDIN',
        payload: data
      });
    },
    setUsername: (data) => {
      dispatch({
        type: 'USERNAME',
        payload: data
      });
    },
    setAccount: (data) => {
      dispatch({
        type: 'ACCOUNT',
        payload: data
      });
    }
  };
};

export default connect(mstp, mdtp, null, {pure: false})(Navigation);
