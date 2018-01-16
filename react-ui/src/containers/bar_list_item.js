import React from 'react';

//bar is passed in and saved under var variable
const BarListItem = ({bar}) => {
   return (
    
    <li className="list-group-item bar-list">
        <div className="row">
            <div className="float-left col-md-4">
                <a href={bar.yelpUrl} target="_blank" className="unstyled-link">
                    <img className="barImage" src={bar.image} alt="bar thumbnail"/>
                </a>    
            </div>
            <div className="float-right col-md-8">
                <div className="row h-50">
                    <div className="col-md-12 bar-name">
                        {bar.name}
                    </div>
                </div>
                <div className="row h-25">
                    <div className="col-md-4">
                        {bar.rating}/5
                    </div>
                    <div className="col-md-4">
                        {bar.category}
                    </div>
                    <div className="col-md-4">
                        {bar.price}
                    </div>
                </div>
                <div className="row h-25">
                    <div className="col-md-12">
                        <a href={"http://localhost:3001/attendingBar/" + encodeURIComponent(bar.yelpUrl)}>
                            {bar.votes} attending
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </li> 
   );
   
}

export default BarListItem;