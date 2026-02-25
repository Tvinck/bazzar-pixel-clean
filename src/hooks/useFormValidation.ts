import { useState } from 'react';
import { validateForm } from '../utils/validation';

// --- TYPES ---

export interface ValidationRules {
    [key: string]: any;
}

export interface ValidationErrors {
    [key: string]: string | undefined;
}

export interface TouchedFields {
    [key: string]: boolean;
}

export interface FormValidationHook<T> {
    values: T;
    errors: ValidationErrors;
    touched: TouchedFields;
    handleChange: (field: keyof T, value: any) => void;
    handleBlur: (field: keyof T) => void;
    validate: () => boolean;
    reset: () => void;
}

/**
 * React Hook for form validation
 */
export const useFormValidation = <T extends Record<string, any>>(initialValues: T, rules: ValidationRules): FormValidationHook<T> => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<TouchedFields>({});

    const handleChange = (field: keyof T, value: any) => {
        const fieldStr = String(field);
        setValues(prev => ({ ...prev, [field]: value }));

        // Validate on change if touched
        if (touched[fieldStr]) {
            const result = validateForm({ [fieldStr]: value }, { [fieldStr]: rules[fieldStr] });
            setErrors(prev => ({ ...prev, [fieldStr]: result.errors[fieldStr] }));
        }
    };

    const handleBlur = (field: keyof T) => {
        const fieldStr = String(field);
        setTouched(prev => ({ ...prev, [fieldStr]: true }));

        const result = validateForm({ [fieldStr]: values[field] }, { [fieldStr]: rules[fieldStr] });
        setErrors(prev => ({ ...prev, [fieldStr]: result.errors[fieldStr] }));
    };

    const validate = (): boolean => {
        const result = validateForm(values, rules);
        setErrors(result.errors);
        return result.isValid;
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validate,
        reset
    };
};
