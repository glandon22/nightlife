import React from 'react';
import LogIn from './log_in';

function NavBar(props) {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <a className="navbar-brand" href="/">Planify</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor02" aria-controls="navbarColor02" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse float-right" id="navbarColor02">
                <ul className="navbar-nav mr-auto no-padding-top">
                    <li className="nav-item">
                        <LogIn user={props.user} /> 
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;