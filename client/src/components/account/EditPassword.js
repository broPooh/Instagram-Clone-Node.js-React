import React from "react";
import { NavLink, Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css} from '../../modules/script';
import {http} from '../../modules/http';
import './EditPassword.css';

class EditPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPass: '',
      newPass: '',
      confirmPass: ''
    }

    this.change_password = this.change_password.bind(this);
    this.post_data = this.post_data.bind(this);
  }

  change_password(e, key) {
    this.setState({
      [key]: e.target.value
    });
    console.log([key]+':'+e.target.value);
  }

  post_data(e) {
    var data = {
      currentPass: this.state.currentPass,
      newPass: this.state.newPass,
      confirmPass: this.state.confirmPass
    }

    http.post('/', data)
    .then((res) => {

    });
  }

  render() {
    return (
      <div className='edit_password'>
        <div>
          <h1>Change Password</h1>
        </div>
        <div className='row form-group'>
          <label>Current Password:</label>
          <input className='form-control' type='password' onChange={(e) => this.change_password(e, 'currentPass')} />
        </div>
        <div className='row form-group'>
          <label>New Password:</label>
          <input className='form-control' type='password' onChange={(e) => this.change_password(e, 'newPass')} />
        </div>
        <div className='row form-group'>
          <label>Confirm Password:</label>
          <input className='form-control' type='password' onChange={(e) => this.change_password(e, 'confirmPass')} />
        </div>
        <div className='row form-group'>
          <label className='message'></label>
          <button className='btn btn-primary btn_edit' onClick={(e) => this.post_data(e)}>Change Password</button>
        </div>
      </div>
    );
  }
};

var mstp = state => ({
});
export default connect(mstp)(EditPassword);
