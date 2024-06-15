import mongoose from 'mongoose';  

/**
 * Connects to the MongoDB database using the connection URI specified in the environment variables.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is established, or rejects with an error.
 */
const connectMongoDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`Connected to MongoDB!: ${conn.connection.host}`);
	} catch (error) {
		console.log(`Error connecting to MongoDB: ${error.message}`);
		process.exit(1);
	}
};

export default connectMongoDB;