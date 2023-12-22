const mongoose = require('mongoose');

module.exports = async () => {
    const connectionParams = {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }
    try {
        await mongoose.connect(process.env.DB, connectionParams);
        console.log('connected!!');
    } catch (error) {
        console.log('could not connect to database!!')
    }
}