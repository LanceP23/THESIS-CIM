const jwt = require('jsonwebtoken');
const Organization = require('../models/organization');
const User = require('../models/user');
const Announcement = require('../models/announcement');

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
            createdAt: new Date(),
            members:[]
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
        if (req.user.adminType !== 'School Owner') {
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

const getPotentialMembers = async (req, res) => {
    try {
        const { orgName } = req.params;
        const organization = await Organization.findOne({ name: orgName });

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Fetch potential members from the database based on the organization ID
        const existingMemberIds = organization.members.map(member => member.toString());
        const potentialMembers = await User.find({ 
            _id: { $nin: existingMemberIds },
            organization: orgName
        });

        res.json(potentialMembers);
    } catch (error) {
        console.error('Error fetching potential members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const addPotentialMembers = async (req, res) => {
    try {
        // Extract organization name from the request params
        const { orgName } = req.params;
        const decodedOrgName = decodeURIComponent(orgName);

        console.log('Decoded Organization Name:', decodedOrgName);

        // Find the organization by name
        const organization = await Organization.findOne({ name: decodedOrgName });

        if (!organization) {
            console.log('Organization not found:', decodedOrgName);
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Extract potential member IDs from the request body
        const { potentialMemberIds } = req.body;

        // Check if the potential members exist
        const potentialMembers = await User.find({ _id: { $in: potentialMemberIds } });

        // Filter out existing members from potential members
        const nonExistingMembers = potentialMembers.filter(member => !organization.members.some(existingMember => existingMember.equals(member._id)));

        // Add non-existing members to the organization's members list
        organization.members.push(...nonExistingMembers);

        // Save the updated organization
        await organization.save();

        res.status(200).json({ message: 'Potential members added successfully', addedMembers: nonExistingMembers });
    } catch (error) {
        console.error('Error adding potential members:', error);
        res.status(500).json({ message: 'Failed to add potential members' });
    }
};



const getAddedMembers = async (req, res) =>{
    try {
        const { orgName } = req.params;

        // Find the organization by name
        const organization = await Organization.findOne({ name: orgName });

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Fetch the list of added members for the organization
        const addedMembers = await User.find({ _id: { $in: organization.members } });

        res.status(200).json({ addedMembers });
    } catch (error) {
        console.error('Error fetching added members:', error);
        res.status(500).json({ message: 'Failed to fetch added members' });
    }
};

const updateOrganizationMember = async (req, res) => {
    try {
      // Find the organization by ID
      const organization = await Organization.findById(req.params.orgId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
  
      // Find the member by ID
      const member = organization.members.find(member => member._id.toString() === req.params.memberId);
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }
  
      // Update the member's information
      member.name = req.body.name || member.name;
      member.email = req.body.email || member.email;
      member.position = req.body.position || member.position;
      member.schoolYear = req.body.schoolYear || member.schoolYear; // Include schoolYear update
  
      // Find the user in the database by email
      const user = await User.findById(member._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Update the user's name, position, and schoolYear in the database
      user.name = member.name;
      user.position = member.position;
      user.schoolYear = member.schoolYear;
      await user.save();
  
      // Save the updated organization
      await organization.save();
  
      res.json({ message: 'Member and user updated successfully', member, user });
    } catch (error) {
      console.error('Error updating member:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

  const deleteOrganizationMember = async (req, res) => {
    try {
      // Find the organization by ID
      const organization = await Organization.findById(req.params.orgId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
  
      // Find the member by ID
      const memberIndex = organization.members.findIndex(member => member._id.toString() === req.params.memberId);
      if (memberIndex === -1) {
        return res.status(404).json({ error: 'Member not found' });
      }
  
      // Remove the member from the organization's members list
      organization.members.splice(memberIndex, 1);
  
      // Save the updated organization
      await organization.save();
  
      res.json({ message: 'Member deleted successfully' });
    } catch (error) {
      console.error('Error deleting member:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const fetchOrganizationData = async (req, res) => {
    try {
        
        const userId = req.params.userId; 
        
        const user = await User.findById(userId);
    
    
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        // Respond with the user's organization and position
        res.json({ organization: user.organization, position: user.position });
      } catch (error) {
        console.error('Error checking authentication status with organization:', error);
        res.status(500).json({ error: 'Server error' });
      }
};

const getOrganizationId = async (req, res) => {
    try {
        const userId = req.params.userId; 
        const user = await User.findById(userId);
    
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Assuming the 'organization' field holds the name of the organization
        const organizationName = user.organization;

        if (!organizationName) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Find the organization by name
        const organization = await Organization.findOne({ name: organizationName });

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Return the organization ID
        return res.status(200).json({ organizationId: organization._id });
        
    } catch (error) {
        console.error('Error fetching organization ID:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getAnnouncementsByOrganizationName = async (req, res) => {
    try {
        const { organizationName } = req.params;

        // Fetch the organization by name to get its ID
        const organization = await Organization.findOne({ name: organizationName });
        
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        const organizationId = organization._id;

        // Fetch announcements filtered by organization ID
        const announcements = await Announcement.find({ organizationId });
        res.status(200).json(announcements);
    } catch (error) {
        console.error('Error fetching announcements by organization name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

  
  


module.exports = {
    createOrganization,
    authenticateUser,
    getOrganization,
    approveOfficer,
    getPotentialMembers,
    addPotentialMembers,
    getAddedMembers,
    updateOrganizationMember,
    deleteOrganizationMember,
    fetchOrganizationData,
    getOrganizationId,
    getAnnouncementsByOrganizationName
};
