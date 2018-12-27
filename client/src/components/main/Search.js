import React from 'react';
import { Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {http} from '../../modules/http';
import {server} from '../../modules/server';
import {_, _all, _css, set_css, set_display} from '../../modules/script';
import './Search.css';

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      results: {},
      value: '',
      visibleHolder: true
    }

    this.on_focus = this.on_focus.bind(this);
    this.on_blur = this.on_blur.bind(this);
    this.on_change = this.on_change.bind(this);
    this.on_click = this.on_click.bind(this);
  }

  on_focus(e) {
    console.log('focus');
    _all('.search input')[0].focus();
    _all('.search input')[1].focus();
    this.setState({visibleHolder: false});
  }

  on_blur(e) {
    if(this.state.value.length == 0) {
      this.setState({visibleHolder: true});
    }
  }

  on_change(e) {
    var val = e.target.value;
    this.setState({value: val});
    if(val.length <= 1) {
      this.setState({results: {}});
      return;
    }
    http.get('/posts/search/' + val)
    .then((res) => {
      //console.log('/posts/search='+JSON.stringify(res.data));
      if(res.data.success) {
        var tags = res.data.tags;
        if(Object.keys(tags).length > 0) this.setState({results: tags});
        else this.setState({results: {}});
      }
    });
  }

  on_click(e) {
    var tag = '';
    if(e.target.tagName == 'SPAN') tag = e.target.parentNode.firstChild.innerHTML;
    else tag = e.target.firstChild.innerHTML;
    tag = tag.replace('#', '');
    //this.props.setPosts({});
    this.setState({
      redirect: '/posts?tag='+tag
    }, () => {
      this.setState({redirect: '', results: {}, value: tag});
    });
  }

  componentDidMount() {
    
  }

  render() {
    var redirect = '';
    if(this.state.redirect) redirect = <Redirect to={this.state.redirect} />;

    var results = [];
    var list = '';
    var obj = this.state.results;
    if(Object.keys(obj).length > 0) {
      for(var i=0; i<Object.keys(obj).length; i++) {
        var tag = Object.keys(obj)[i];
        var li = (
          <li key={i} onClick={(e) => {this.on_click(e)}}>
            <span>{'#'+tag} </span>
            <span>{obj[tag]} </span>
            <span>{(obj[tag] > 1) ? 'posts' : 'post'}</span>
          </li>
        );
        results.push(li);
      }

      list = (
        <div>
          {redirect}
          <div className='triangleUp'><div></div></div>
          <ul className='results'>
            {results}
          </ul>
        </div>
      );
    }

    var holder = 'holder';
    if(!this.state.visibleHolder) holder = 'holder none';

    return (
      <div className='search'>
        <input type='text' className='form-control' value={this.state.value}
        onChange={(e) => {this.on_change(e)}}
        onClick={(e) => {this.on_focus(e)}}
        onBlur={(e) => {this.on_blur(e)}}  />
        <div className={holder} onClick={(e) => {this.on_focus(e)}}>
          <i className='fa fa-search'></i>
          <span>Search</span>
        </div>
        {list}
      </div>
    );
  }
}

var mstp = state => ({
});

var mdtp = dispatch => {
  return {
    setPostIndex: (postIndex) => {
      dispatch({type: 'POSTINDEX', payload: postIndex});
    },
    setPosts: (posts) => {
      dispatch({type: 'POSTS', payload: posts});
    }
  };
};

export default connect(mstp, mdtp)(Search);
