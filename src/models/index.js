import userModel from './user.model.js';
import examModel from './exam.model.js';
import registrationModel from './registration.model.js';
import resultModel from './result.model.js';
import questionModel from './question.model.js';
import optionModel from './option.model.js';
import notificationModel from './notification.model.js';
import examBannerModel from './examBanner.model.js';
import examRecordingModel from './examRecording.model.js';
import contractEventModel from './contractEvent.model.js';

// Export model factories as named exports for mocking and test compatibility
export const User = userModel;
export const Exam = examModel;
export const Registration = registrationModel;
export const Result = resultModel;
export const Question = questionModel;
export const Option = optionModel;
export const Notification = notificationModel;
export const ExamBanner = examBannerModel;
export const ExamRecording = examRecordingModel;
export const ContractEvent = contractEventModel;

export async function syncDatabase() {
  // Dummy implementation for compatibility
  return Promise.resolve();
}
