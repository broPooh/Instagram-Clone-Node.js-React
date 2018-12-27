const multer = require('multer');
const path = require('path');
const fs = require('fs');
const gm = require('gm');

module.exports = async function(req, res, user, callback) {
  // check if user dirs exist
  var userPath = './public/images/'+user._id;
  var dest = userPath + '/avatar/';
  var date = Date.now();
  var ext = '';
  var name = '';
  var oldPath = '';

  try {
    await fs.rmdirSync(dest);
  } catch(err) {}

  mkdirs(userPath, date, () => {
    const storage = multer.diskStorage({
      destination: dest,
      filename: async function(req, file, cb) {
        console.log('field='+file.fieldname);
        ext = path.extname(file.originalname);
        name = date+ext;
        if(file.fieldname == 'avatar') {
          try{await remove_avatar(dest);}catch(err){}
        } else {
          callback('');
        }
        cb(null, name); // + path.extname(file.originalname));
      }
    });

    const upload = multer({
      storage: storage,
      limits: {fileSize: 2000000},
      fileFilter: function(req, file, cb) {checkFileType(file, cb);}
    }).single('avatar');

    upload(req, res, async(err) => {
      if(err) callback('');
      else {
        await resize_image(dest+name);
        console.log('New image uploaded: '+dest);
        callback(name);
      }
    });
  });
};

function remove_avatar(dir) {
  console.log('dir='+dir);
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    console.log('files='+files.length);
    for (const file of files) {
      fs.unlink(path.join(dir, file), err => {
        if (err) throw err;
      });
    }
  });
}

function resize_image(dest) {
  if(fs.existsSync(dest)) {
    gm(dest).size(function(err, size) {
      if(err) return;
      var w, h;
      if(size.width > size.height) {
        w = null;
        h = 150;
      } else {
        w = 150;
        h = null;
      }
      gm(dest).resize(w, h, '!').write(dest, function() {
        gm(dest).crop(150, 150, 0, 0).write(dest, () => {
          //cb();
        });
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
    Promise.all([
      dirExists(images),
      dirExists(userPath),
      dirExists(avatar),
      dirExists(posts)
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
