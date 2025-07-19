import mongoose from 'mongoose';

// Schema for Manager 
const managerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
const Manager = mongoose.model('Manager', managerSchema);

// Schema for Queue (each queue is linked to a manager)
const queueSchema = new mongoose.Schema({
  name: String,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
  totalServed: { type: Number, default: 0 },
});
const Queue = mongoose.model('Queue', queueSchema);

// Schema for Person (represents a token in the queue)
const personSchema = new mongoose.Schema({
  name: String,
  queue: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
  addedAt: { type: Date, default: Date.now },
  position: { type: Number },
  status: {
    type: String,
    enum: ['waiting', 'served', 'cancelled'],
    default: 'waiting'
  },
});
const Person = mongoose.model('Person', personSchema);

// Export all models
export { Manager, Queue, Person };
