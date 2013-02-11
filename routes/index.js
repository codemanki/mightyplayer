
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.html', { title: 'Express' });
};

exports.remote = function(req, res){
  res.render('remote.html', {clientId: req.params.clientId});
};