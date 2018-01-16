import React from 'react';

const SignIn = (props) => {
    if (props.user.status) {
        return (
            <a href='http://localhost:5000/logout'>
                <img src={props.user.image} className="profile-image" alt="profile thumbnail"/>  
            </a>
        );
    }

    else {
        return (
            <button type="button" 
            className="btn btn-default navbar-btn">
                <a href="/api">Log In</a>
            </button>
        );
    }
    
}

export default SignIn;