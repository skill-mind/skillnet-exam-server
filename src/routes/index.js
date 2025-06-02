// Central export for all route modules
module.exports = {
  userRoutes: require('./user.routes'),
  examRoutes: require('./exam.routes'),
  authRoutes: require('./auth.routes'),
  registrationRoutes: require('./registration.routes'),
  resultRoutes: require('./result.routes'),
  notificationRoutes: require('./notification.routes'),
  examBannerRoutes: require('./examBanner.routes'),
  examRecordingRoutes: require('./examRecording.routes'),
  indexerRoutes: require('./indexer.routes'),
};
