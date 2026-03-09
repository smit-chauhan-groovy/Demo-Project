import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().catch((error) => {
  console.error('Database connection failed:', error.message);
  console.log('Server starting without database...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
