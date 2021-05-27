// Imports
const mongoose = require('mongoose');


// DB Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB Connected ${conn.connection.host}`);

    } catch(err) {
        console.log(err);
        connectDB();
    }
}

module.exports = connectDB;
