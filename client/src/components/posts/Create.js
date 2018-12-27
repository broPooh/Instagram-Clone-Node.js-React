import React from "react";
import { Redirect } from 'react-router-dom';
import {connect} from 'react-redux';
import {_, _css, set_css, set_display} from '../../modules/script';
import {http} from '../../modules/http';
import './Create.css';

class Create extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: '',
      images: [0],
      files: [{}, {}, {}],
      title: '',
      caption: '',
      videoUploading: false,
      video: {},
      errorMsg: '',
      switchMsg: 'Switch to upload a video...'
    }

    this.change_title = this.change_title.bind(this);
    this.change_caption = this.change_caption.bind(this);
    this.change_image = this.change_image.bind(this);
    this.change_video = this.change_video.bind(this);
    this.add_more = this.add_more.bind(this);
    this.post_images = this.post_images.bind(this);
    this.post_video = this.post_video.bind(this);

    this.switch_uploading = this.switch_uploading.bind(this);
  }

  change_title(e) {
    this.setState({title: e.target.value});
  }

  change_caption(e) {
    this.setState({caption: e.target.value});
  }

  change_image(event, i) {
    var index = event.target.getAttribute('data-index');
    var files = this.state.files;
    files[index] = event.target.files[0];
    console.log('event.target.files[0]='+JSON.stringify(event.target.files[0].name));
    this.setState({
      files: files,
    });
    var images = this.state.images;
    images[index] = URL.createObjectURL(event.target.files[0]);
    this.setState({
      images
    });
  }

  add_more() {
    var images = this.state.images;
    images.push(0);
    this.setState({images});
  }

  post_images() {
    set_display('.loader', 'block');
    var data = {
      title: this.state.title,
      caption: this.state.caption
    }
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    if (localStorage.getItem("jwtToken") === null || !this.props.loggedIn) {
      set_display('.loader', 'none');
      this.setState({redirect: 'login'});
    } else {
      var fd = new FormData();
      var files = this.state.files;
      for(var i=0; i<files.length; i++) {
        if(files[i] != {}) {
          fd.append('file', files[i]);
          //console.log('add='+files[i].name);
        }
      }
      fd.append('title', this.state.title);
      console.log('title='+this.state.title);
      fd.append('caption', this.state.caption);
      http({
        method: 'post',
        url: '/posts/create',
        data: fd,
        config: {headers: {'Content-Type': 'multipart/form-data'}}
      })
      .then((res) => {
        console.log('/posts/create='+JSON.stringify(res.data));
        setTimeout(() => {
          set_display('.loader', 'none');
          if(res.data.success) {
            this.setState({redirect: '/posts?user='+this.props.username});
          } else {
            this.setState({errorMsg: res.data.msg});
          }
        }, 1000);
      })
      .catch((err) => {
        set_display('.loader', 'none');
      });
    }
  }

  switch_uploading() {
    if(this.state.videoUploading) {
      this.setState({videoUploading: false, switchMsg: 'Switch to upload a video...'});
    } else {
      this.setState({videoUploading: true, switchMsg: 'Switch to upload images...'});
    }
  }

  change_video(e) {
    var video = _('.create video');
    var input = e.target;
    if (input.files && input.files[0]) {
      var file = input.files[0];
      var url = URL.createObjectURL(file);
      console.log(url);
      var reader = new FileReader();
      reader.onload = () => {
          video.src = url;
          video.play();
          video.style.opacity = 1;
          this.setState({video: input.files[0]});
      }
      reader.readAsDataURL(file);
    }
  }

  post_video() {
    set_display('.loader', 'block');
    http.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken');
    if (localStorage.getItem("jwtToken") === null || !this.props.loggedIn) {
      set_display('.loader', 'none');
      this.setState({redirect: 'login'});
    } else {
      var fd = new FormData();
      fd.append('video', this.state.video);
      fd.append('title', this.state.title);
      fd.append('caption', this.state.caption);
      http({
        method: 'post',
        url: '/posts/video',
        data: fd,
        config: {headers: {'Content-Type': 'multipart/form-data'}}
      })
      .then((res) => {
        console.log('/posts/video='+JSON.stringify(res.data));
        setTimeout(() => {
          set_display('.loader', 'none');
          if(res.data.success) {
            var username = '';
            if(this.props.username) username = this.props.username;
            this.setState({redirect: '/posts?user='+username});
          } else {
            this.setState({errorMsg: res.data.msg});
          }
        }, 1000);
      })
      .catch((err) => {
        this.setState({errorMsg: err.toString()});
        set_display('.loader', 'none');
      });
    }
  }

  render() {
    var redirect = '';
    if(this.state.redirect != '') redirect = <Redirect to={this.state.redirect} />;

    var inputs = [];
    if(!this.state.videoUploading) {
      // for uploading images
      var images = this.state.images;
      for(var i=0; i<images.length; i++) {
        if(i < 5) {
          inputs.push(
            <div key={i} className='img_wrapper'>
              <img className='image' src={this.state.images[i]} alt={'Select Image '+(i+1)} />
              <input className={'form-control input_'+i} type='file' name='file'
               onChange={(e) => {this.change_image(e, i)}} accept='image/*' data-index={i} />
            </div>
          );
        }

        if(i >= images.length-1 && i < 4) {
          inputs.push(
            <div className='add_more'>
              <button className='btn btn-primary' onClick={(e) => {this.add_more(e)}}>
                <i className='fa fa-plus'></i>
              </button>
            </div>
          );
        }
      }

      var postButton = (
        <div className='form-group post_button'>
          <label className='message'>{this.state.errorMsg}</label>
          <div className='btn btn-primary post_button' onClick={() => {this.post_images()}}>POST</div>
        </div>
      );

    } else {
      // for uploading video
      inputs = (
        <div>
          <div className='video_wrapper'>
            <video controls></video>
          </div>
          <div className='video_input'>
            <div className='btn btn-default'>
              <i className=''>Select a video</i>
              <input type='file' name='video'
               onChange={(e) => {this.change_video(e)}} accept='video/*' />
            </div>
         </div>
       </div>
      );

      postButton = (
        <div className='form-group post_button'>
          <label className='message'>{this.state.errorMsg}</label>
          <div className='btn btn-primary post_button' onClick={() => {this.post_video()}}>Post Video</div>
        </div>
      );
    }


    return (
      <div className='create container'>
        {redirect}
        <form className='row' id='post_form'>
          <div className='col-6 images'>
            {inputs}
          </div>
          <div className='col-6'>
            <div className='form-group'>
              <label>Title</label>
              <input className='form-control' type='text' value={this.state.title} onChange={this.change_title}/>
            </div>
            <div className='form-group'>
              <label>Caption</label>
              <textarea className='form-control' value={this.state.caption} onChange={this.change_caption}></textarea>
            </div>
            {postButton}
            <div className='form-group to_video' onClick={() => {this.switch_uploading()}}>
              <label>{this.state.switchMsg}</label>
            </div>
          </div>
        </form>
      </div>
    );
  }
};

var mstp = state => ({
  username: state.username,
  loggedIn: state.loggedIn
});
export default connect(mstp)(Create);
