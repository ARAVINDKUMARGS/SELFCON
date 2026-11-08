const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// @desc    Upload single or multiple property images
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image file.' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'selfcon/properties',
            transformation: [{ width: 1600, height: 1060, crop: 'limit', quality: 'auto' }]
          });
          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            isPrimary: uploadedImages.length === 0
          });
          continue;
        } catch (cloudErr) {
          console.warn('[Cloudinary Upload Warning]:', cloudErr.message);
        }
      }

      // Local fallback
      const localUrl = `/uploads/${file.filename}`;
      uploadedImages.push({
        url: localUrl,
        publicId: file.filename,
        isPrimary: uploadedImages.length === 0
      });
    }

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

