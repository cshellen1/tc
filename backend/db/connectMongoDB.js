import mongoose from 'mongoose';  

/**
 * Connects to the MongoDB database using the connection URI specified in the environment variables.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is established, or rejects with an error.
 */
const connectMongoDB = async () => {
	let connectionString = process.env.MONGO_URI;

	if (process.env.NODE_ENV === 'test') {
		connectionString = process.env.MONGO_URI_TEST;
	} 
	try {
		const conn = await mongoose.connect(connectionString);
		console.log(`Connected to MongoDB!: ${conn.connection.host}`);
	} catch (error) {
		console.log(`Error connecting to MongoDB: ${error.message}`);
		process.exit(1);
	}
};

export default connectMongoDB;