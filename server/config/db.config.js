const mongoose = require ('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
//const Product = require('../models/product');
const User = require('../models/user');

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });  
        //await Product.insertMany(data.products);
        // const salt = await bcrypt.genSalt(10);
        // const hash = await bcrypt.hash('123456', salt);
        // await User.updateMany({},{password:hash});


        console.log("Connected to the database")
    } catch (error) {
        console.log(`Could not connect to the database with error : ${error}`);
        process.exit(1);
    }
}





module.exports = connectDatabase;