var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var passport    = require('passport');
var cors        = require('cors');
var apiRoutes = express.Router();

var port        = process.env.PORT || 3000;
var io = require('socket.io').listen(8080);

var index = require('./routes/index');
var users = require('./routes/users');

var wordConekttaApi         = require('./routes/wordConekttaApi');
var creditOperation         = require('./routes/creditOperation');
var smtpAmazon              = require('./routes/smtpAmazon');
var usuariosSmartWifi       = require('./routes/usuariosSmartWifi');
var sms                     = require('./routes/sms');
var email                   = require('./routes/email');
var login                   = require('./routes/login');
var createTemplateEmail     = require('./routes/createTemplateEmail');
var relatorios              = require('./routes/relatorios');
var dashboard               = require('./routes/dashboard');
var ads                     = require('./routes/ads');
var estatisticas            = require('./routes/estatisticas');
var uploadBanner            = require('./routes/uploadBanner');
var resetPassword           = require('./routes/resetPassword');
var orders                  = require('./routes/orders');
var userRegistration        = require('./routes/userRegistration');
var configs                 = require('./routes/configs');
//var teste = require('./routes/teste');


// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

var allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
   // console.log(req.headers['authorization']);
    global.token = req.headers['authorization'];


    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};

app.use(allowCrossDomain);

// Use the passport package in our application
app.use(passport.initialize());


// demo Route (GET http://localhost:8080)
app.use('/', index);
app.use('/api/users', users);


app.use('/api/creditOperation',creditOperation);
app.use('/api/wordConekttaApi',wordConekttaApi);
app.use('/api/login',login);
app.use('/api/sms',sms);
app.use('/api/usuariosSmartWifi',usuariosSmartWifi);
app.use('/api/email',email);
app.use('/api/smtpAmazon',smtpAmazon);
app.use('/api/createTemplateEmail',createTemplateEmail);
app.use('/api/relatorios',relatorios);
app.use('/api/dashboard',dashboard);
app.use('/api/ads',ads);
app.use('/api/estatisticas',estatisticas);
app.use('/api/uploadBanner',uploadBanner);
app.use('/api/resetPassword',resetPassword);
app.use('/api/orders',orders);
app.use('/api/userRegistration',userRegistration);
app.use('/api/configs',configs);

app.use('/api', apiRoutes);

app.use(allowCrossDomain);
app.use(cors({origin: '*'}));
app.disable('etag');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log(">>> URL: "+req.url);
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



// set up our socket server

require('./sockets/base')(io);
require('./sockets/emailBase')(io);
require('./sockets/smsBase')(io);

apiRoutes.post('/websocket' , function(req, res){
    console.log(req.body);
    //res.json(req.body);
    io.sockets.emit('send:websocket', req.body);
    res.json(200, {message: "Message received!"});

});

apiRoutes.post('/banner' , function(req, res){

    //res.json(req.body);
    io.sockets.emit('send:banner', req.body);
    res.json(200, {message: "Message received!"});

});

app.get("/", function (req, res) {
});


// Start the server
module.exports = app;

