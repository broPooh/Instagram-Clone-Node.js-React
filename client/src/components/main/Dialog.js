import React from 'react';
import { NavLink } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import './Dialog.css';

class Dialog extends React.Component {
  constructor(props) {
    super(props);

    this.click_button = this.click_button.bind(this);
  }

  click_button(e, i) {
    if(i > 0) {
      this.props.dialog.action();
    }
    var dialog = {
      message: '',
      cancel: '',
      ok: '',
      action: null
    }
    this.props.setDialog(dialog);
    set_display('.dialog', 'none');
  }

  render() {
    var btn_0 = '', btn_1 = '';
    if(this.props.dialog.cancel != null) {
      btn_0 = (
        <button className='btn btn-default btn_0' onClick={(e) => {this.click_button(e, 0)}}>{this.props.dialog.cancel}</button>
      );
    }
    if(this.props.dialog.ok != null) {
      btn_1 = (
        <button className='btn btn-danger btn_1' onClick={(e) => {this.click_button(e, 1)}}>{this.props.dialog.ok}</button>
      );
    }

    return (
      <div className='dialog'>
        <div className='dialog_wrapper'>
          <div className='message'>
            <p>{this.props.dialog.message}</p>
          </div>
          <div className='buttons'>
            {btn_1}
            {btn_0}
          </div>
        </div>
      </div>
    );
  }
}

var mstp = state => ({
  dialog: state.dialog
});

var mdtp = dispatch => {
  return {
    setDialog: (dialog) => {
      dispatch({type: 'DIALOG', payload: dialog});
    }
  };
};

export default connect(mstp, mdtp)(Dialog);
