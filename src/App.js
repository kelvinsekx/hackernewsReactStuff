import React, { Component } from "react";
import axios from "axios"
import "./App.css";

//API stuff
const DEFAULT_QUERY = "redux";
const DEFAULT_HPP = 100

const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = `page=`
const PARAM_HPP = `hitsPerPage=`

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this)
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this)
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this)
  }

  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm]
  }

  fetchSearchTopStories(searchTerm, page=0){
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(response=>response.json())
    .then(response=>this.setSearchTopStories(response))
    .catch(err=> this.setState({error:err}))
  }
  setSearchTopStories(result) {
    const {hits, page} = result
    const {searchKey, results} = this.state

    const oldHits = results && results[searchKey] ? results[searchKey].hits: [];
    const updatedList = [
      ...oldHits,
      ...hits
    ]

    this.setState({
      results:{
        ...results,
        [searchKey]: {hits: updatedList, page}},
    });
  }

  onSearchSubmit(event){
    event.preventDefault()
    const {searchTerm} = this.state
    this.setState({searchKey: searchTerm})

    if(this.needsToSearchTopStories(searchTerm)){
      this.fetchSearchTopStories(searchTerm)
    }
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({searchKey: searchTerm})
    this.fetchSearchTopStories(searchTerm)
  }

  onDismiss = (id) => {
    const {searchKey, results} = this.state
    const {hits, page}= results[searchKey]

    const updatedList = hits.filter(
      (hit) => hit.objectID !== id
    );
    this.setState({
      results: { ...results, [searchKey]: {hits:updatedList, page} },
    });
  };

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  render() {
    const { searchTerm, results, searchKey, error } = this.state;
    const page = (results && results[searchKey] && results.page) || 0
    const list = (
      results && results[searchKey] && results[searchKey].hits
    ) || []

    
    return (
      <div className="page">
        <div className="interations">
          <Search 
          value={searchTerm} 
          onChange={this.onSearchChange}
          onSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        {error ?
        <div className="interations" style={{textAlign:"center"}}>
          <h1>:(</h1>
          <h2>Something went wrong.Please, try back after some time</h2>
        </div> :
        <Table
          lists={list}
   s       onDismiss={this.onDismiss}
        />}
        <div className="interactions">
          <Button
          onClick={()=> this.fetchSearchTopStories(searchKey, page+1)}>More</Button>
        </div>
      </div>
    );
  }
}

function Search({ onChange, children, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      {children}
      <input type="text" onChange={onChange} 
      />
      <button type="submit">{children}</button>
    </form>
  );
}

class Table extends Component {
  render() {
    const { lists, onDismiss } = this.props;
    return (
      <div className="table">
        {lists.map((list) => {
          return (
            <div key={list.objectID} className="table-row">
              <span>
                <a href={list.url}>{list.title}</a>
              </span>
              <span>{list.author}</span>
              <span>{list.num_comments}</span>
              <span>{list.points}</span>
              <span>
                <Button
                  onClick={() => onDismiss(list.objectID)}
                  className="button-inline"
                >
                  Dismiss me
                </Button>
              </span>
            </div>
          );
        })}
      </div>
    );
  }
}

function Button({ onClick, className = "", children }) {
  return (
    <button onClick={onClick} className={className} type="button">
      {children}
    </button>
  );
}
export default App;
