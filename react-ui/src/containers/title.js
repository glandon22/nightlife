import React from 'react';

function titleBlock(props) {
    return (
        <div className="container">
            <div className="jumbotron center-align">
                <h1 className="display-3">{props.title}</h1>
                <hr className="my-4"></hr>
                <p className="lead">{props.info}</p>
            </div>
        </div>
    );
}

export default titleBlock;