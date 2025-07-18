// models/Manager.js
import mongoose from 'mongoose';

const ManagerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const ManagerModel = mongoose.model('Manager', ManagerSchema);

export default ManagerModel;