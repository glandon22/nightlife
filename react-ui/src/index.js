import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
import Title from './containers/title';
import SearchBar from './containers/searchbar';
import NavBar from './containers/navbar';
import BarList from './containers/bar_list';
import _ from 'lodash';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bars: [],
      user: {
        status: false,
        image: '',
        name: '',
        handle: ''
      }    }
  }

  componentDidMount() {
    var self = this;
    axios.get('/verify').then(function(res) {
      if (res.data.length === 2) {
        self.setState({user: res.data[0]});
        self.locationSearch(res.data[1]);
      }

      else {
        self.setState({user: res.data});
      }
    });
  }

  locationSearch(term) {
    var self = this;
    axios.get('/api/' + term).then(function(res) {
      //if someone makes a bad search query, empty string or unknown location
      //react wil return me 'index' every time
      if (res.data !== 'index') {
        self.setState({bars: res.data});        
      }
    });
  }

  render() {
    const locationSearch = _.debounce(term => {
      this.locationSearch(term);
    }, 300);

    return (
      <div>
        <NavBar user={this.state.user} />
        <Title title="Planify" info="Where are we going tonight?"/>
        <SearchBar onSearchTermChange={locationSearch}/>
        <BarList bars={this.state.bars} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));