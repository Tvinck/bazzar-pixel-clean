/**
 * Валидация и санитизация пользовательского ввода
 * Защита от XSS, SQL Injection, и других атак
 */

import DOMPurify from 'dompurify';

// --- TYPES ---

export interface ValidationResult {
    valid: boolean;
    sanitized?: string;
    error?: string;
    value?: any;
}

export interface FileValidationOptions {
    maxSize?: number;
    allowedTypes?: string[];
}

export interface FormRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
    validator?: (value: any) => { valid: boolean; error?: string };
}

export interface FormRules {
    [field: string]: FormRule;
}

export interface FormValidationResult {
    isValid: boolean;
    errors: Record<string, string | undefined>;
}

// --- UTILS ---

/**
 * Санитизация HTML для защиты от XSS
 */
export const sanitizeHTML = (dirty: string): string => {
    if (typeof dirty !== 'string') return '';

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'target'],
        ALLOW_DATA_ATTR: false
    });
};

/**
 * Санитизация текста (удаление всех HTML тегов)
 */
export const sanitizeText = (text: string): string => {
    if (typeof text !== 'string') return '';

    return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });
};

/**
 * Валидация email
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Валидация username
 */
export const validateUsername = (username: string): boolean => {
    if (!username || typeof username !== 'string') return false;

    // 3-20 символов, только буквы, цифры, подчеркивание
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

/**
 * Валидация промпта для генерации
 */
export const validatePrompt = (prompt: string): ValidationResult => {
    if (!prompt || typeof prompt !== 'string') {
        return { valid: false, error: 'Промпт не может быть пустым' };
    }

    const sanitized = sanitizeText(prompt);

    if (sanitized.length < 3) {
        return { valid: false, error: 'Промпт слишком короткий (минимум 3 символа)' };
    }

    if (sanitized.length > 1000) {
        return { valid: false, error: 'Промпт слишком длинный (максимум 1000 символов)' };
    }

    // Проверка на запрещенные слова
    const forbiddenWords = ['script', 'onclick', 'onerror', 'javascript:'];
    const lowerPrompt = sanitized.toLowerCase();

    for (const word of forbiddenWords) {
        if (lowerPrompt.includes(word)) {
            return { valid: false, error: 'Промпт содержит запрещенные слова' };
        }
    }

    return { valid: true, sanitized };
};

/**
 * Валидация URL
 */
export const validateURL = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        // Разрешаем только http и https
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
};

/**
 * Валидация числового значения
 */
export const validateNumber = (value: any, min: number = -Infinity, max: number = Infinity): ValidationResult => {
    const num = Number(value);

    if (isNaN(num)) {
        return { valid: false, error: 'Значение должно быть числом' };
    }

    if (num < min) {
        return { valid: false, error: `Значение должно быть не меньше ${min}` };
    }

    if (num > max) {
        return { valid: false, error: `Значение должно быть не больше ${max}` };
    }

    return { valid: true, value: num };
};

/**
 * Валидация файла
 */
export const validateFile = (file: File | null, options: FileValidationOptions = {}): ValidationResult => {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB по умолчанию
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    } = options;

    if (!file) {
        return { valid: false, error: 'Файл не выбран' };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `Размер файла превышает ${Math.round(maxSize / 1024 / 1024)}MB`
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Недопустимый тип файла. Разрешены: ${allowedTypes.join(', ')}`
        };
    }

    return { valid: true };
};

/**
 * Экранирование специальных символов для предотвращения XSS
 */
export const escapeHTML = (str: string): string => {
    if (typeof str !== 'string') return '';

    const htmlEscapes: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
};

/**
 * Валидация JSON
 */
export const validateJSON = (str: string): ValidationResult => {
    try {
        JSON.parse(str);
        return { valid: true };
    } catch (error) {
        return { valid: false, error: 'Некорректный JSON' };
    }
};

/**
 * Валидация формы
 */
export const validateForm = (fields: Record<string, any>, rules: FormRules): FormValidationResult => {
    const errors: Record<string, string | undefined> = {};
    let isValid = true;

    for (const [field, value] of Object.entries(fields)) {
        const fieldRules = rules[field];

        if (!fieldRules) continue;

        // Required
        if (fieldRules.required && (!value || value.toString().trim() === '')) {
            errors[field] = 'Это поле обязательно';
            isValid = false;
            continue;
        }

        // Min length
        if (fieldRules.minLength && value && value.toString().length < fieldRules.minLength) {
            errors[field] = `Минимум ${fieldRules.minLength} символов`;
            isValid = false;
            continue;
        }

        // Max length
        if (fieldRules.maxLength && value && value.toString().length > fieldRules.maxLength) {
            errors[field] = `Максимум ${fieldRules.maxLength} символов`;
            isValid = false;
            continue;
        }

        // Pattern
        if (fieldRules.pattern && value && !fieldRules.pattern.test(value.toString())) {
            errors[field] = fieldRules.message || 'Некорректный формат';
            isValid = false;
            continue;
        }

        // Custom validator
        if (fieldRules.validator) {
            const result = fieldRules.validator(value);
            if (!result.valid) {
                errors[field] = result.error;
                isValid = false;
            }
        }
    }

    return { isValid, errors };
};

const validation = {
    sanitizeHTML,
    sanitizeText,
    validateEmail,
    validateUsername,
    validatePrompt,
    validateURL,
    validateNumber,
    validateFile,
    escapeHTML,
    validateJSON,
    validateForm
};

export default validation;
