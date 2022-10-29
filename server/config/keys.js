require('dotenv').config()
module.exports = {
    app: {
      name: 'Ecommerce store',
      apiURL: `${process.env.BASE_API_URL}`,
      serverURL: process.env.BASE_SERVER_URL,
      clientURL: process.env.BASE_CLIENT_URL
    },
    port: process.env.PORT || 3000,
    database: {
      url: process.env.MONGO_URI
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      tokenLife: '7d'
    },
    mailgun: {
      key: process.env.MAILGUN_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    },
    cloudinary:{
      name : process.env.CLOUD_NAME,
      key:  process.env.CLOUDINARY_API_KEY,
      secret: process.env.CLOUDINARY_SECRET_KEY,
    },
    paypal : {
      clientId: process.env.PAYPAL_CLIENT_ID,
      secret : process.env.PAYPAL_SECRET
    }
  };
  