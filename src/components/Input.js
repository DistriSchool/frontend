const Input = ({ disabled = false, className = '', ...props }) => (
    <input
        disabled={disabled}
        className={`rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        {...props}
    />
)

export default Input
