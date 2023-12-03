import React from 'react'
import { Link } from 'react-router-dom'

export const SuperAdmin = () => {
    return (
        <div>
            <Link to = "/signup">Sign Up</Link><br></br>
            <Link to = "/login">Login</Link>
        </div>
    )
}