const multer = require('multer');
const path = require('path');
const fs = require('fs');
const gm = require('gm');

module.exports = function(req, res, user, callback) {
  var userPath = './public/images/'+user._id;
  var date = Date.now();
  var ext = '';
  var dest = userPath + '/posts/'+date +'/';
  var index = -1;
  var names = [];

  console.log('before mkdirs()');
  mkdirs(userPath, date, function() { // make dirs if not exist;
    console.log('after mkdirs()');
    const storage = multer.diskStorage({
      destination: dest,
      filename: function(req, file, cb) {
        index++;
        ext = path.extname(file.originalname);
        console.log('file.originalname='+file.originalname);
        names.push(index+ext);
        cb(null, index+ext); // + path.extname(file.originalname));
      }
    });

    const upload = multer({
      storage: storage,
      limits: {fileSize: 20000000},
      fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
      }
    }).any(); //array('file', 4); //single('file_'+index);

    upload(req, res, (err) => {
      if(err) res.send({success: false, msg: err});
      else {
        if(!names || names.length == 0) {
          removePostDir(dest);
          res.send({success: false, msg: 'Error: image is undefined.'});
          return;
        }
        create_thumb(dest+names[0], dest+'thumb-'+names[0], async() => {
          for(var i=0; i<names.length; i++) {
            await resize_image(dest+names[i]);
          }
          console.log('New image uploaded: '+dest);
          callback(date, names);
        });
      }
    });
  });
};

function create_thumb(dest, newDest, cb) {
  if(fs.existsSync(dest)) {
    gm(dest).size((err, size) => {
      if(err) console.log('err: create_thumb()'+err);
      var w, h, x, y;
      if(size.width > size.height) {
        w = null;
        h = 300;
        x = ((size.width*300/size.height) - 300) / 2;
        y = 0;
      } else {
        w = 300;
        h = null;
        x = 0;
        y = ((size.height*300/size.width) - 300) / 2;
      }
      gm(dest).resize(w, h, '!').write(newDest, () => {
        gm(newDest).crop(300, 300, x, y).write(newDest, () => {
          cb();
        });
      });
    });
  } else {
    cb();
  }
}


async function resize_others(dest, names, cb) {
  try {
    var promises = [];
    for(var i=1; i<names.length; i++) {
      console.log('added promise');
      promises.push(resize_image(dest+'/'+names[i]));
    }
    Promise.all(promises).then(cb());
  } catch(err) {}
}

function resize_image(dest) {
  if(fs.existsSync(dest)) {
    gm(dest).size(function(err, size) {
      if(err) return;
      var w, h;
      if(size.width > size.height) {
        w = 600;
        h = null;
      } else {
        w = null;
        h = 600;
      }
      gm(dest).resize(w, h, '!').write(dest, function() {
        //cb();
      });
    });
  }
}

// make dirs (async)
async function mkdirs(userPath, date, cb) {
  try {
    var images = './public/images';
    var avatar = userPath+'/avatar';
    var posts = userPath+'/posts';
    var dir = userPath+'/posts/'+date;
    Promise.all([
      dirExists(images),
      dirExists(userPath),
      dirExists(avatar),
      dirExists(posts),
      dirExists(dir)
    ]).then(cb());
  } catch(err) {}
}

function dirExists(path) {
  if(!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

function removePostDir(path) {
  if(fs.existsSync(path)) {
    console.log('exists='+path);
    fs.readdirSync(path).forEach(function(file, index) {
      var filePath = path + '/' + file;
      fs.unlinkSync(filePath);
    });
    fs.rmdirSync(path);
  } else {
    console.log('not exists='+path);
  }
}
