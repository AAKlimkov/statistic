import { Link as MuiLink, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

interface AuthFooterLinkProps {
	text: string
	linkText: string
	to: string
}

export const AuthFooterLink = ({ text, linkText, to }: AuthFooterLinkProps) => {
	return (
		<Typography variant='body2' sx={{ mt: 3, textAlign: 'center' }}>
			{text}{' '}
			<MuiLink component={RouterLink} to={to}>
				{linkText}
			</MuiLink>
		</Typography>
	)
}
