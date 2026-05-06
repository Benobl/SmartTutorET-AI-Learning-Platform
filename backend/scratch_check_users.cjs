const mongoose = require('mongoose');
const User = require('./src/modules/users/user.model');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const tutors = await User.find({ role: 'tutor' });
    tutors.forEach(t => {
        console.log(`Tutor: ${t.name}, Documents: `, JSON.stringify(t.documents, null, 2));
    });
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
