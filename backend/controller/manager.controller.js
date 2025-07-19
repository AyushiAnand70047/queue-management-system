import { Manager, Queue, Person } from '../models/manager.model.js';
import bcrypt from 'bcrypt';

// Register a new manager
const registerManager = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return res.status(400).json({ message: 'Manager already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const manager = new Manager({ name, email, password: hashedPassword });

    await manager.save();
    return res.status(201).json({ message: 'Manager created successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Manager login
const loginManager = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const isPasswordValid = await bcrypt.compare(password, manager.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful', managerId: manager._id });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Get manager details by ID
const getManagerById = async (req, res) => {
  const manager = await Manager.findById(req.params.id);
  if (!manager) return res.status(404).send({ message: 'Manager not found' });
  res.send(manager);
};

// Create a new queue for a manager
const createQueue = async (req, res) => {
  const { name, managerId } = req.body;

  try {
    const queue = new Queue({ name, manager: managerId });
    await queue.save();
    res.status(201).json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create queue', error });
  }
};

// Add a person or token to the queue
const addPersonToQueue = async (req, res) => {
  const { name, queueId, position } = req.body;

  try {
    const queue = await Queue.findById(queueId).populate('manager');
    if (!queue) return res.status(404).json({ message: 'Queue not found' });

    const person = new Person({
      name,
      queue: queue._id,
      manager: queue.manager._id,
      position,
    });

    await person.save();
    res.status(201).json(person);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add person to queue', error });
  }
};

// Get all queues created by a manager
const getQueuesByManager = async (req, res) => {
  const { managerId } = req.params;
  try {
    const queues = await Queue.find({ manager: managerId });
    res.status(200).json(queues);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch queues', error });
  }
};

// Get all persons or tokens in a specific queue for a manager
const getPersonsByManagerAndQueue = async (req, res) => {
  const { managerId, queueId } = req.params;

  try {
    const queue = await Queue.findOne({ _id: queueId, manager: managerId });
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found for this manager' });
    }

    const persons = await Person.find({ queue: queueId })
      .populate('queue')
      .sort({ position: 1 });

    res.status(200).json(persons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch persons', error });
  }
};

// Delete a person or token by ID
const deletePersonById = async (req, res) => {
  try {
    const { personId } = req.params;
    const deleted = await Person.findByIdAndDelete(personId);
    if (!deleted) {
      return res.status(404).json({ message: 'Person not found' });
    }
    res.status(200).json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Delete person error:', error);
    res.status(500).json({ message: 'Failed to delete person', error });
  }
};

export {
  registerManager,
  loginManager,
  getManagerById,
  createQueue,
  addPersonToQueue,
  getQueuesByManager,
  getPersonsByManagerAndQueue,
  deletePersonById
};