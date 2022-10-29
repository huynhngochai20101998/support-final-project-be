require('dotenv').config();
const express = require('express');
const historyApiFallback = require('connect-history-api-fallback');
const compression = require('compression');
const cors = require('cors');
const bcrypt = require('bcryptjs')
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const dbConnection = require ('./config/db.config.js');
const keys = require('./config/keys');


const app = express();
const { jwt , port } = keys;
const apiURl = `/${keys.app.apiURL}`;

//Router
const routes = require('./routes');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(session({secret : jwt.secret}));
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: true
  })
);
// Connect to MongoDB
dbConnection()


require('./config/passport')(app);
app.use(apiURl,routes);
  
// if development
if (process.env.NODE_ENV !== 'production') {
  app.use(
    historyApiFallback({
      verbose: false
    })
  );
} else {
  app.use(compression());
}


app.listen(port, () => {
  console.log(
      `Listening on port ${port}. Visit http://localhost:${port}/ in your browser.`
  );
});
