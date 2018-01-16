import React, { Component } from 'react';

class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.state= {term: ''};
      
    }

    render() {
        return (
            <div className="container">
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Search for bars and restaurants"
              value={this.state.term}
              onChange={event => this.onInputChange(event.target.value)}>
              </input>
            </div>
          </div>
        );
    }

    onInputChange(term) {
        this.setState({term});
        this.props.onSearchTermChange(term);
    }
}

export default SearchBar;