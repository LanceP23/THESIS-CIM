const jwt = require('jsonwebtoken');
const Organization = require('../models/organization');

const authenticateUser = (req, res, next) => {
    // Check if the authorization header exists
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

const getOrganization = async (req, res) => {
    try {
        const organization = await Organization.find();
        res.json(organization);
    } catch (error) {
        console.error('Error fetching organizations: ', error);
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
};

const approveOfficer = async (req, res) => {
    try {
        // Check if the requesting user has the necessary permissions to approve officers
        if (req.user.adminType !== 'AllowedAdminType') {
            return res.status(403).json({ error: 'You are not authorized to approve officers' });
        }

        const { officerId } = req.params;

        // Find the organization by ID
        const organization = await Organization.findById(req.params.orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Find the officer in the organization's officers array
        const officer = organization.officers.find(officer => officer._id === officerId);
        if (!officer) {
            return res.status(404).json({ error: 'Officer not found' });
        }

        // Update the officer's status to 'approved'
        officer.status = 'approved';

        // Save the organization with the updated officer status
        await organization.save();

        res.json({ message: 'Officer approved successfully', officer });
    } catch (error) {
        console.error('Error approving officer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createOrganization,
    authenticateUser,
    getOrganization,
    approveOfficer
};
