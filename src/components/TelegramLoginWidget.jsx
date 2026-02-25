import React, { useEffect, useRef } from 'react';

/**
 * Telegram Login Widget Wrapper
 * https://core.telegram.org/widgets/login
 */
const TelegramLoginWidget = ({
    botName,
    buttonSize = 'large',
    cornerRadius = 12,
    requestAccess = 'write',
    usePic = true,
    onAuth
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        // Expose a global callback for the widget to call upon successful auth
        window.onTelegramAuth = (user) => {
            if (onAuth) {
                onAuth(user);
            }
        };

        const scriptUrl = 'https://telegram.org/js/telegram-widget.js?22';

        // Prevent adding multiple scripts if re-rendering
        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;

            // Customizing widget params
            script.setAttribute('data-telegram-login', botName);
            script.setAttribute('data-size', buttonSize);
            script.setAttribute('data-radius', cornerRadius);
            script.setAttribute('data-request-access', requestAccess);
            script.setAttribute('data-userpic', usePic.toString());
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');

            if (containerRef.current) {
                containerRef.current.appendChild(script);
            }
        }

        return () => {
            // Cleanup global window object (optional, but good practice)
            delete window.onTelegramAuth;
        };
    }, [botName, buttonSize, cornerRadius, requestAccess, usePic, onAuth]);

    return (
        <div ref={containerRef} className="flex justify-center items-center h-[40px] w-[220px]" />
    );
};

export default TelegramLoginWidget;
