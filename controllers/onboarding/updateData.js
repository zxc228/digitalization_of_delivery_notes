const updateUserProfile = require('../../models/user/updateUserProfile');
const updateUserCompany = require('../../models/user/updateUserCompany');

async function updatePersonalData(req, res, next) {
  const { name, surnames, nif } = req.body;

  if (!name || !surnames || !nif) {
    const err = new Error('Missing required personal fields');
    err.status = 422;
    return next(err);
  }

  try {
    await updateUserProfile(req.user.id, name, surnames, nif);

    res.json({
      id: req.user.id,
      name,
      surnames,
      nif,
      message: 'Personal data updated successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function updatePersonalAndCompanyData(req, res, next) {
  const { name, surnames, nif, company_name, cif, address, selfEmployed } = req.body;

  if (!name || !surnames || !nif) {
    const err = new Error('Missing required personal fields');
    err.status = 422;
    return next(err);
  }

  try {
    await updateUserProfile(req.user.id, name, surnames, nif);

    if (company_name && cif && address) {
      await updateUserCompany(req.user.id, company_name, cif, address);
    } else if (selfEmployed === true) {
      await updateUserCompany(req.user.id, `${name} ${surnames}`, nif, 'N/A');
    }

    res.json({
      message: 'Personal and/or company data updated successfully'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  updatePersonalData,
  updatePersonalAndCompanyData
};
