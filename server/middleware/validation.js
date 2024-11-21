import { body } from 'express-validator';

export const validateDomain = [
  body('hostname')
    .trim()
    .notEmpty()
    .withMessage('Hostname is required')
    .matches(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/)
    .withMessage('Invalid hostname format'),
  body('port')
    .optional()
    .isInt({ min: 1, max: 65535 })
    .withMessage('Port must be between 1 and 65535'),
];