// This is a reference schema file for the Node.js backend to support scalable maps.
// Replace or update your existing models/Issue.js with this structure.

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved'],
        default: 'pending'
    },
    category: {
        type: String,
        required: true
    },

    // ==========================================
    // PRODUCTION GEOJSON LOCATION SCHEMA
    // Why GeoJSON is better than basic {lat, lng}:
    // 1. MongoDB has native spatial indexes (2dsphere) optimized for GeoJSON.
    // 2. It allows extremely fast "$geoWithin" bounding box queries.
    // 3. Instead of fetching 100,000 issues, you only fetch the 50 inside the user's current screen view.
    // ==========================================
    locationData: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        // Coordinates must be in [longitude, latitude] format for GeoJSON (lng first, then lat)
        coordinates: {
            type: [Number],
            required: true
        },
        // Optional human-readable address or landmark name
        addressName: {
            type: String
        }
    },

    imageUrl: {
        type: String
    },
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetDepartment: {
        type: String,
        required: true
    }
}, { timestamps: true });

// CRITICAL FOR SCALE: Create a 2dsphere index on the locationData field
issueSchema.index({ locationData: '2dsphere' });

// Compound index for getting issues in an area filtered by status quickly
issueSchema.index({ 'locationData': '2dsphere', 'status': 1 });

module.exports = mongoose.model('Issue', issueSchema);

/* 
  Example Backend API Controller for bounds:
  
  exports.getIssuesInBounds = async (req, res) => {
    try {
      const { swLat, swLng, neLat, neLng, status } = req.query;
      
      const query = {
        locationData: {
          $geoWithin: {
            $box: [
               [parseFloat(swLng), parseFloat(swLat)], // Bottom Left
               [parseFloat(neLng), parseFloat(neLat)]  // Top Right
            ]
          }
        }
      };

      if (status) query.status = status;

      // Select only fields needed for markers to reduce payload size
      const issues = await Issue.find(query)
        .select('_id title status locationData')
        .limit(500); // Cap it just in case

      res.status(200).json(issues);
    } catch (error) {
      res.status(500).json({ message: "Error fetching map data", error: error.message });
    }
  };
*/
