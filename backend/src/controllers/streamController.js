const Stream = require('../models/Stream');

// @desc    Get all streams
// @route   GET /api/streams
// @access  Private (with valid subscription)
exports.getStreams = async (req, res) => {
  try {
    const streams = await Stream.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: streams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single stream
// @route   GET /api/streams/:id
// @access  Private (with valid subscription)
exports.getStream = async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);
    
    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found' });
    }

    res.status(200).json({ success: true, data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create stream
// @route   POST /api/streams
// @access  Private/Admin
exports.createStream = async (req, res) => {
  try {
    const stream = await Stream.create(req.body);
    res.status(201).json({ success: true, data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update stream
// @route   PUT /api/streams/:id
// @access  Private/Admin
exports.updateStream = async (req, res) => {
  try {
    const stream = await Stream.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found' });
    }

    res.status(200).json({ success: true, data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete stream
// @route   DELETE /api/streams/:id
// @access  Private/Admin
exports.deleteStream = async (req, res) => {
  try {
    const stream = await Stream.findByIdAndDelete(req.params.id);

    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found' });
    }

    res.status(200).json({ success: true, message: 'Stream deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get live streams (public preview)
// @route   GET /api/streams/public/live
// @access  Public
exports.getLiveStreamsPublic = async (req, res) => {
  try {
    const streams = await Stream.find({ isLive: true })
      .select('title category thumbnailUrl viewerCount')
      .sort({ viewerCount: -1 });
    res.status(200).json({ success: true, data: streams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
