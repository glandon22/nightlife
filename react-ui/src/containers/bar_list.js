import React from 'react';
import BarListItem from './bar_list_item';

const BarList = (props) => {
    const barItems = props.bars.map((bar) => {
        return (
            <BarListItem 
            key={bar.yelpUrl}
            bar={bar}
            />
        );
    });

    return (
        <div className="container">
            <ul>
                {barItems}
            </ul>
        </div>
        
    )
}

export default BarList;