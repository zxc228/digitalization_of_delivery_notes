const updateUserProfile = require('../../models/user/updateUserProfile');
const updateUserCompany = require('../../models/user/updateUserCompany');

async function updatePersonalData(req, res) {
  const { name, surnames, nif } = req.body;

  if (!name || !surnames || !nif) {
    return res.status(422).json({ error: 'Missing required personal fields' });
  }

  try {
    await updateUserProfile(req.user._id, name, surnames, nif);

    res.json({
      _id: req.user._id,
      name,
      surnames,
      nif,
      message: 'Personal data updated successfully',
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updatePersonalAndCompanyData(req, res) {
  const { name, surnames, nif, company_name, cif, address, selfEmployed } = req.body;

  if (!name || !surnames || !nif) {
    return res.status(422).json({ error: 'Missing required personal fields' });
  }

  try {
    await updateUserProfile(req.user._id, name, surnames, nif);

    if (company_name && cif && address) {
      await updateUserCompany(req.user._id, company_name, cif, address);
    } else if (selfEmployed === true) {
      await updateUserCompany(req.user._id, `${name} ${surnames}`, nif, 'N/A');
    }

    res.json({
      message: 'Personal and/or company data updated successfully'
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  updatePersonalData,
  updatePersonalAndCompanyData
};