import Manager from '../models/Manager.model.js';
import bcrypt from 'bcrypt';

const registerManager = async (req, res) => {
    // get manager details from request body
    const { name, email, password } = req.body;

    // check if manager already exists
    try {
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({ message: 'Manager already exists' });
        }

        // manager not exist, create a manager in database
        const hashedPassword = await bcrypt.hash(password, 10);
        const manager = new Manager({
            name,
            email,
            password: hashedPassword
        });

        if (!manager) {
            return res.status(500).json({ message: 'Failed to create manager' });
        }

        await manager.save();
        return res.status(201).json({ message: 'Manager created successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}

const loginManager = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
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

        res.status(200).json({
            message: 'Login successful', managerId: manager._id
        });
    } catch (error) {
        res.status(400).json({
            error
        });
    }
}

const getManagerById = async (req, res) => {
  const manager = await Manager.findById(req.params.id);
  if (!manager) return res.status(404).send({ message: 'Manager not found' });
  res.send(manager);
}

export { registerManager, loginManager, getManagerById };