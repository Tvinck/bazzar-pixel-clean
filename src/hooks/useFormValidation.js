import { useState } from 'react';
import { validateForm } from '../utils/validation';

/**
 * React Hook для валидации формы
 */
export const useFormValidation = (initialValues, rules) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (field, value) => {
        setValues(prev => ({ ...prev, [field]: value }));

        // Валидация при изменении
        if (touched[field]) {
            const result = validateForm({ [field]: value }, { [field]: rules[field] });
            setErrors(prev => ({ ...prev, [field]: result.errors[field] }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));

        const result = validateForm({ [field]: values[field] }, { [field]: rules[field] });
        setErrors(prev => ({ ...prev, [field]: result.errors[field] }));
    };

    const validate = () => {
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
