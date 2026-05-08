const multer = require("multer")
const cloudinary = require("../config/cloudinary")
const CustomError = require("./customError")

// store file in memory (not disk)
const storage = multer.memoryStorage()

// file filter — only images allowed
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)   // accept file
  } else {
    cb(new CustomError("Only image files are allowed", 400), false)
  }
}

// multer config
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max
  }
})

// upload single image to Cloudinary
const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,                    // which folder in Cloudinary
        resource_type: "image",
        transformation: [
          { width: 800, crop: "limit" },  // max width 800px
          { quality: "auto" }             // auto optimize quality
        ]
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(fileBuffer)
  })
}

// delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId)
}

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary }