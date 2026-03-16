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
    onAuth,
    authUrl
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        // Expose a global callback for the widget only if using onAuth flow
        if (onAuth && !authUrl) {
            window.onTelegramAuth = (user) => {
                onAuth(user);
            };
        }

        const scriptUrl = 'https://telegram.org/js/telegram-widget.js?22';

        // Clear container before adding script
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;

        // Customizing widget params
        script.setAttribute('data-telegram-login', botName);
        script.setAttribute('data-size', buttonSize);
        script.setAttribute('data-radius', cornerRadius);
        script.setAttribute('data-request-access', requestAccess);
        script.setAttribute('data-userpic', usePic.toString());

        if (authUrl) {
            script.setAttribute('data-auth-url', authUrl);
        } else if (onAuth) {
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        }

        if (containerRef.current) {
            containerRef.current.appendChild(script);
        }

        return () => {
            if (window.onTelegramAuth) delete window.onTelegramAuth;
        };
    }, [botName, buttonSize, cornerRadius, requestAccess, usePic, onAuth, authUrl]);

    return (
        <div ref={containerRef} className="flex justify-center items-center h-[40px] w-[220px]" />
    );
};

export default TelegramLoginWidget;
