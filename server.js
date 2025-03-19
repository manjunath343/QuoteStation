process.env.DATABASE_URL = 'postgresql://postgres:Manju343@localhost:5432/personalDB';

const app = require('./app'); // Adjust the path as necessary

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
