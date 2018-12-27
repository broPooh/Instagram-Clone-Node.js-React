import {http} from '../modules/http';
import {server} from '../modules/server';

export function get_posts(url, query, cb) {
  http.get(url, {params: query}) // get posts
  .then((res) => {
    //console.log('get_posts='+JSON.stringify(res.data));
    if(res.data.success) {
      var posts = res.data.posts;
      for(var i=0; i<posts.length; i++) {
        var p = posts[i];
        // get thumb
        var name = p.images[0];
        if(name) {
          //var ext = name.split('.').pop();
          var thumb = server+'/images/'+p.userId+'/posts/'+p.dir+'/thumb-'+name; //'0-thumb.'+ext;
          posts[i].thumb = thumb;
        } else {
          posts[i].thumb = '';
        }

        // get images
        var images = [];
        for(var j=0; j<p.images.length; j++) {
          images.push(server+'/images/'+p.userId+'/posts/'+p.dir+'/'+p.images[j]);
        }
        posts[i].images = images;

        // get avatar
        var avatar = res.data.avatars[p.username];
        if(avatar) posts[i].avatar = server+'/images/'+p.userId+'/avatar/'+avatar;
        else posts[i].avatar = '';

        // get a video url if it exists.
        if(p.video) posts[i].video = server+'/images/'+p.userId+'/posts/'+p.dir+'/'+p.video;
      }
      cb(posts);
    } else {
      cb(false);
    }
  });
}
