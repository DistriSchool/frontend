const InputError = ({ messages = [], className = '' }) => {
    const errorMessages = Array.isArray(messages)
        ? messages
        : messages && typeof messages === 'string'
            ? [messages]
            : [];

    return (
        <>
            {errorMessages.length > 0 && (
                <>
                    {errorMessages.map((message, index) => (
                        <p
                            className={`${className} text-sm text-red-600`}
                            key={index}>
                            {message}
                        </p>
                    ))}
                </>
            )}
        </>
    );
};

export default InputError;
