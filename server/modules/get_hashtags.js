module.exports = function(str) {
  var regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
  var matches = [];
  var match;

  while ((match = regex.exec(str))) {
      matches.push(match[1]);
  }

  return matches;
}
