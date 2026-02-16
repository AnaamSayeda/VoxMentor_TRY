// app/layout.jsx
import './globals.css'

export const metadata = {
    title: 'VoxMentor - Communication Training',
    description: 'Master your self-introduction with AI-powered feedback',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
}