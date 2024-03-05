const jwt = require('jsonwebtoken');
const Organization = require('../models/organization');

const authenticateUser = (req, res, next) => {
    // Check if the authorization header is present
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token missing' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Store the decoded token in the request object
        req.user = decodedToken;
        next();
    });
};

const createOrganization = async (req, res) => {
    try {
        const { organizationName, schoolYear, semester } = req.body;

        if (!organizationName || !schoolYear || !semester) {
            return res.status(400).json({ error: 'Name, school year, and semester are required' });
        }

        // Create a new organization in the database
        const organization = await Organization.create({
            name: organizationName,
            schoolYear,
            semester,
            createdBy: req.user.id, // Assuming req.user has the user information
            createdAt: new Date()
        });

        res.json(organization);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createOrganization,
    authenticateUser // Exporting the authentication middleware if needed elsewhere
};
