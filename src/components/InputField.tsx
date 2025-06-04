import React from 'react'

interface CustomInputProps {
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	placeholder: string
	type?: string
}

const inputStyle: React.CSSProperties = {
	padding: '10px',
	fontSize: '16px',
	borderRadius: '4px',
	border: '1px solid #ccc',
	outline: 'none',
	width: '100%',
}

const InputField: React.FC<CustomInputProps> = ({
	value,
	onChange,
	placeholder,
	type = 'text',
}) => {
	return (
		<input
			type={type}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			style={inputStyle}
		/>
	)
}

export default InputField
