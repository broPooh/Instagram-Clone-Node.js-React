import React from "react";
import { Link, NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import './Edit.css';

import EditProfile from './EditProfile';
import EditPassword from './EditPassword';

class Edit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true
    }

    this.edit_profile = this.edit_profile.bind(this);
    this.edit_password = this.edit_password.bind(this);
    this.set_colors = this.set_colors.bind(this);
  }

  edit_profile() {
    this.setState({visible: true});
    this.set_colors(0);
  }

  edit_password() {
    this.setState({visible: false});
    this.set_colors(1);
  }

  set_colors(i) {
    var ele = _all('.edit .edit_menu li');
    for(var j=0; j<ele.length; j++) {
      ele[j].classList.remove('active');
    }
    ele[i].classList.add('active');
  }

  render() {
    var comp = '';
    if(this.state.visible) {
      comp = <EditProfile />
    } else {
      comp = <EditPassword />
    }

    return (
      <div className='container edit'>
        <div className='col-md-4 edit_menu'>
          <ul>
            <li className='active' onClick={this.edit_profile}>Edit Profile</li>
            <li onClick={this.edit_password}>Change Password</li>
            <li onClick={this.edit_comments}>Comments</li>
          </ul>
        </div>
        <div className='col-md-8'>
          {comp}
        </div>
      </div>
    );
  }
};

var mstp = state => ({
});
export default connect(mstp)(Edit);
