import Manager from '../models/Manager.model.js';
import bcrypt from 'bcrypt';

const registerManager = async (req, res) => {
    // get manager details from request body
    const { name, email, password } = req.body;

    // validate
    if(!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

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

        if(!manager) {
            return res.status(500).json({ message: 'Failed to create manager' });
        }

        await manager.save();
        return res.status(201).json({ message: 'Manager created successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}

export {registerManager};