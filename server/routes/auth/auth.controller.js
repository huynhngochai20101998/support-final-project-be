
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');



// Bring in models and helpers
const User = require('../../models/user')
const mailgun = require('../../services/mailgun');
const template = require('../../services/template');
const keys = require('../../config/keys');


const { secret, tokenLife } = keys.jwt;

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400) .json({ 
          success : false,
          message: 'You must enter an email address.',
         });
    }

    if (!password) {
      return res.status(400).json({
        success : false,
        message: 'You must enter a password.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ 
          success : false,
          message : 'No user found for this email address.' ,
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password Incorrect',
      });
    }

    const payload = {
      id: user.id
    };

    const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

    if (!token) {
      throw new Error('failed to generate login access token');
    }
    res.status(200).json({
      success: true,
      message : "",
      token: token,
      data : {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}

async function register(req, res) {
  {
    try {
      const { email, firstName, lastName, password} = req.body;

      if (!email) {
        return res
          .status(400)
          .json({
             success : false,
             message: 'You must enter an email address.' ,
             data : null
            });
      }

      if (!firstName || !lastName) {
        return res.status(400).json({ 
          success : false,
          error: 'You must enter your full name.' ,
          data : null
        });
      }

      if (!password) {
        return res.status(400).json({ 
          success : false,
          error: 'You must enter a password.',
          data : null
         });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res
          .status(400)
          .json({ 
            success : false,
            message: 'That email address is already in use.' ,
            data : null
          });
      }
      const user = new User({
        email,
        password,
        firstName,
        lastName
      });
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);

      user.password = hash;
      const registeredUser = await user.save();

      const payload = {
        id: registeredUser.id
      };

      await mailgun.sendEmail(
        registeredUser.email,
        'signup',
        null,
        registeredUser
      );

      const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

      res.status(200).json({
        success: true,
        message : "Sign up successfullly! Please check your email for more information.",
        data : {
          id: registeredUser.id,
          firstName: registeredUser.firstName,
          lastName: registeredUser.lastName,
          email: registeredUser.email,
          role: registeredUser.role
        }
      });
    } catch (error) {
      res.status(400).json({
        success : false,
        message : 'Your request could not be processed. Please try again.',
        data : null
      });
    }
  }
}
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ 
          success : false,
          error: 'You must enter an email address.' ,
          data : null
        });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(400)
        .json({ 
          success : false,
          message : 'No user found for this email address.',
          data : null
        });
    }

    const buffer = crypto.randomBytes(48);
    const resetToken = buffer.toString('hex');
    console.log(resetToken);

    existingUser.resetPasswordToken = resetToken;
    existingUser.resetPasswordExpires = Date.now() + 3600000;

    existingUser.save();

    await mailgun.sendEmail(
      existingUser.email,
      'reset',
      keys.app.clientURL,
      existingUser
    );

    res.status(200).json({
      success: true,
      message: 'Please check your email for the link to reset your password.'
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}

function resetPasswordWithToken(req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    (err, resetUser) => {
      if (!resetUser) {
        return res.status(422).json({
         success : false,
         data : null,
         message : 'Your token has expired. Please attempt to reset your password again.'
        });
      }
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) {
            console.log(`err : ${err}`);
          }
          req.body.password = hash;

          resetUser.password = req.body.password;
          resetUser.resetPasswordToken = undefined;
          resetUser.resetPasswordExpires = undefined;

          resetUser.save(err => {
            if (err) {
              return next(err);
            }

            const message = template.confirmResetPasswordEmail();
            mailgun.sendEmail(resetUser.email, message);

            return res.status(200).json({
              success : true,
              data : null,
              message:
                'Password changed successfully. Please login with your new password.'
            });
          });
        });
      });
    }
  );
}

async function changePassword(req, res) {
  try {
    const { password, confirmPassword } = req.body;
    const email = req.user.email;

    if (!email) {
      return res.status(401).json({
        success : false,
        message : 'Unauthenticated',
        data : null
      });
    }

    if (!password) {
      return res.status(400).json({ 
        success : false,
        message: 'You must enter a password.' ,
        data : null
      });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ 
          success : false,
          message : 'That email address is already in use.' ,
          data : null
        });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ 
          success : false,
          message : 'Please enter your correct old password.',
          data : null
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(confirmPassword, salt);
    existingUser.password = hash;
    existingUser.save();

    await mailgun.sendEmail(existingUser.email, 'reset-confirmation');

    res.status(200).json({
      success: true,
      message:
        'Password changed successfully. Please login with your new password.',
      data : null
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}





module.exports = {
  login,
  register,
  forgotPassword,
  resetPasswordWithToken,
  changePassword
}
