const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));



// const {getHomePage} = require('./routes/index');
// const {addPlayerPage, addPlayer, deletePlayer, editPlayer, editPlayerPage} = require('./routes/player');
const port = process.env.PORT || 8080; 

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
//mysql://ba9565c7d6951a:5230e113@us-cdbr-iron-east-02.cleardb.net/heroku_f254459ae2fc71b?reconnect=true 
//mysql://b8e9343b8899d6:2e4e9219@us-cdbr-east-04.cleardb.com/heroku_e4fdf0fa21e6848?reconnect=true
const db_config = {
  host: 'us-cdbr-east-04.cleardb.com',
  user: 'b0d954228b2de3', // your database username
  password: 'ced00eb6', // your database password
  database: 'heroku_e742caad00cb973',  // FYI export the tshirtshop.sql to this database
  multipleStatements: true
}

// //This is for nodejs only that connected from mysql
// const db_config = {
//   host: 'localhost',
//   user: 'root', // your database username
//   password: 'Merciful$100', // your database password
//   database: 'tshirtshop',  // FYI export the tshirtshop.sql to this database
//   multipleStatements: true
// }

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);                                               
    }    
    /*
        We introduce a delay before attempting to reconnect,
        to avoid a hot loop, and to allow our node script to
        process asynchronous requests in the meantime.
        If you're also serving http, display a 503 error.
    */                                                                            
    global.db = connection;
    console.log(`Connected to database ${db_config.host} >> ${db_config.database}`);    
  });                                                                                   
                                          
  
  /*
    Connection to the MySQL server is usually
    lost due to either server restart, or a
    connnection idle timeout (the wait_timeout
    server variable configures this)
  */
  connection.on('error', function(err) {
    console.log('db error', err);
    handleDisconnect();    
  });
}

handleDisconnect();



// configure middleware
app.set('port', process.env.port || port); // set express to use this port
// app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
// app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload

app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// import routes
const departmentRoutes = require('./routes/department');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const shippingRoutes = require('./routes/shipping');
const customerRoutes = require('./routes/customer');
const orderRoutes = require('./routes/order');

app.get('/', function (request, response, next) {
    db.query("SELECT * FROM category", function (error, rows) {
        return response.json(rows);
    });
});


app.get("/", (req, res) => {
  res.json({ message: "Welcome to Chukz application." });
});


// set routes to api
app.use('/api/department', departmentRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/order', orderRoutes);

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Server running on port: ${port}`);
});