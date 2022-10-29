
const User = require('../../models/user');

async function getUserProfile(req, res){
  try {
    const userId = req.user._id;
    const userDoc = await User.findById(userId, { password: 0 });

    res.status(200).json({
      user: userDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
}

async function updateUserProfile(req, res){
  try {
    const userId = req.user._id;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNumber = req.body.phoneNumber;
    const update = {
      firstName,
      lastName,
      phoneNumber
    }
    const query = { _id: userId };

    const userDoc = await User.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true,
      message: 'Your profile is successfully updated!',
      user: userDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again. error: ' + error
    });
  }
}
  //Get all merchants

  //Create merchants

  //Delete merchants

module.exports = {
    getUserProfile,
    updateUserProfile
}
