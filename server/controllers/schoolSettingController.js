const AcademicYear = require('../models/academicYear');
const SchoolSemester = require('../models/schoolSemester');
const ArchivedAccount = require('../models/archivedAccounts');

// Controller to update academic year, school semester, and archive accounts
const updateAcademicSettingsAndArchiveAccounts = async (req, res) => {
  const { academicYearData, schoolSemesterData, archivedAccountsData } = req.body;

  try {
    // Update academic year if data is provided
    let updatedAcademicYear;
    if (academicYearData) {
      updatedAcademicYear = await AcademicYear.findOneAndUpdate({}, academicYearData, { new: true, upsert: true });
    }

    // Update school semester if data is provided
    let updatedSchoolSemester;
    if (schoolSemesterData) {
      updatedSchoolSemester = await SchoolSemester.findOneAndUpdate({}, schoolSemesterData, { new: true, upsert: true });
    }

    // Archive accounts if data is provided
    let archivedAccounts;
    if (archivedAccountsData) {
      archivedAccounts = await archiveAccounts(archivedAccountsData);
    }

    res.status(200).json({
      academicYear: updatedAcademicYear,
      schoolSemester: updatedSchoolSemester,
      archivedAccounts,
      message: 'Academic settings and archived accounts updated successfully',
    });
  } catch (error) {
    console.error('Error updating academic settings and archiving accounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to archive accounts
const archiveAccounts = async (accountsData) => {
  return Promise.all(accountsData.map(async (accountData) => {
    const archivedAccount = new ArchivedAccount(accountData);
    await archivedAccount.save();
    return archivedAccount;
  }));
};

const unarchiveAccounts = async (req, res) => {
    const { unarchiveAccountsData } = req.body;
  
    try {
      const unarchivedAccounts = await Promise.all(unarchiveAccountsData.map(async (accountId) => {
        const unarchivedAccount = await ArchivedAccount.findByIdAndUpdate(accountId, { archivedAt: null }, { new: true });
        return unarchivedAccount;
      }));
  
      res.status(200).json({
        unarchivedAccounts,
        message: 'Accounts unarchived successfully',
      });
    } catch (error) {
      console.error('Error unarchiving accounts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

module.exports = {
  updateAcademicSettingsAndArchiveAccounts,
  archiveAccounts,
  unarchiveAccounts

};
