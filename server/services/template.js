
function resetEmail(host, user){
    const message = {
      subject: 'Reset Password',
      text:
        `Hi ${user.firstName},\n\n`+
          `${'Forgot your password?\n'+
          'We receive a request to reset your password for your account.\n\n' +
          'To reset your password click on the following link, or paste this into your browser:\n' +
          ''}${host}/forgot-password-update-password/${user.resetPasswordToken}\n\n` +
        `If you did not make this request then please ignore this email.\n`
    };
  
    return message;
  };
  
  function confirmResetPasswordEmail() {
    const message = {
      subject: 'Password Changed',
      text:
        'You are receiving this email because you changed your password. \n\n' +
        'If you did not request this, please contact us immediately.'
    };
  
    return message;
  };
  
  function signupEmail(name){
    const message = {
      subject: 'Account Registration',
      text:
        `Hi ${name.firstName}!\n`+ 
        `Your account has been signed up sucessfully!\n` + 
        `Thank you for joining with us!. \n\n` +
        `If you did not request this, please contact us immediately.`
    };
  
    return message;
  }

  function merchantApplicationEmail(name){
    const message = {
      subject: 'Sell on MERN Store',
      text: `We received your request! Our team will contact you soon. \n\n`
    };

    return message;
  }

  function merchantSignup(host,resetToken){
    const message = {
      subject: 'Merchant Registration',
      text: `${
        'Congratulations! Your application has been accepted. Please change your password for your account by clicking on the link below. \n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://'
      }${host}/forgot-password-update-password/${resetToken}\n\n`
    };
  
    return message;
  };
  
  function merchantWelcome(name) {
    const message = {
      subject: 'Merchant Registration',
      text:
        `Hi ${name}! Congratulations! Your application for merchant account has been accepted. \n\n` +
        `It looks like you already have a member account with us. Please sign in with your member credentials and you will be able to see your merchant account.`
    };
  
    return message;
  };
  module.exports = {
      resetEmail,
      confirmResetPasswordEmail,
      signupEmail,
      merchantApplicationEmail,
      merchantSignup,
      merchantWelcome
  }