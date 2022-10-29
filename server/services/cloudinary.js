const cloudinary = require('cloudinary');
const keys = require('../config/keys');


const {name,key,secret}  = keys.cloudinary;

cloudinary.config({
  cloud_name: name,
  api_key: key,
  api_secret: secret
})

exports.uploads = (file, folder) => {
  return new Promise(resolve => {
    cloudinary.uploader.upload(file, (result) => {
      resolve({
        url: result.url,
        id: result.public_id
      })
    }, {
      resource_type: "auto",
      folder: folder
    })
  })
}