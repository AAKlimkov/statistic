import * as React from 'react'

interface CustomInputProps {
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	placeholder: string
	type?: string
	disabled?: boolean
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
	disabled = false,
}) => {
	return (
		<input
			type={type}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			style={inputStyle}
			disabled={disabled}
		/>
	)
}

export default InputField
