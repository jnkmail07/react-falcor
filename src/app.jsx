let React = require('react'),
    falcor = require('../node_modules/falcor/browser'),
    Todo = require('./todo.jsx');

let todoModel = new falcor.Model({
  cache: {
    todos: {
      length: 10,
      0: {
        name: 'get milk from corner store',
        done: false
      },
      1: {
        name: 'take a dump',
        done: true
      },
      2:{
        name: 'eat a dump',
        done: false
      }
    }
  },
  onChange:function() {
    if(todoModel)
      React.render(
        <Todos model={todoModel}/>,document.querySelector('#todoapp')
      )
  }
});

let Todos = React.createClass({
  filters: {
    all: x=>true,
    completed: x=>x.done,
    active: x=>!x.done,
  },
  getInitialState: function() {
    return {
      range: 0,
      todos: [],
      filter: this.filters.all
    }
  },
  _changeFilter: function(filter) {
    this.setState({filter: this.filters[filter]})
  },
  _updateState: function(model) {
    model.getValue("todos.length").then(len => {
      this.setState({range:len})
      return len-1;
    }).then(range=>model.get(`todos[0..${range}].done`))
        .then(res=>this.setState(res.json))
  },
  _handleNewTodo: function(e) {
    e.preventDefault();
    let newtodo = {}
    newtodo[this.state.range]={
      name: this.refs.newtodo.getDOMNode().value,
      done:false
    }
    newtodo.length=this.state.range+1
    this.props.model.set({json: {todos:newtodo}})
                       .then(_=>this.setState({range:this.state.range+1}))
      .then(_=>this.refs.newtodo.getDOMNode().value='')
  },
  componentDidMount: function() {
    this._updateState(this.props.model);
  },
  componentWillReceiveProps: function(nextProps) {
    this._updateState(nextProps.model);
  },
  render: function() {
    let todoList = fjs.toArray(this.state.todos)
                      .filter(x=>this.state.filter(x[1]))
                      .map((todo,idx)=>(                        
                        <Todo todoid={todo[0]} key={todo[0]} model={this.props.model}/>
                      ))
      return (
        <div>
          <header className="header">
            <h1>todos</h1>
            <form onSubmit={this._handleNewTodo}>
              <input ref="newtodo" className="new-todo" placeholder="What needs to be done?" autofocus/>
            </form>
          </header>
          <section class="main">
            <div>
              <input className="toggle-all" type="checkbox"/>
              <label for="toggle-all">Mark all as complete</label>
              <ul className="todo-list">
                {todoList}
              </ul>
            </div>
          </section>
          <Footer filter={this._changeFilter} count={fjs.toArray(this.state.todos).filter(x=>!x[1].done).length}/>
        </div>
      )
  }
});

let Footer = React.createClass({
  getInitialState:function() {
    return {
      selected: "all"
    }
  },
  _handleClick: function(e) {
    let val = e.target.dataset.name;
    this.props.filter(val);
    this.setState({selected: val});
  },
  render: function() {
    return (
      <footer className="footer">
        <span className="todo-count"><strong>{this.props.count}</strong> item left</span>
        <ul className="filters">
          <li>
            <a className={this.state.selected=="all"?"selected":""} data-name="all"
               onClick={this._handleClick}>
              All
            </a>
          </li>
          <li>
            <a className={this.state.selected=="active"?"selected":""} data-name="active" onClick={this._handleClick}>Active</a>
          </li>
          <li>
            <a className={this.state.selected=="completed"?"selected":""} data-name="completed" onClick={this._handleClick}>Completed</a>
          </li>
        </ul>

        <button className="clear-completed">Clear completed</button>
      </footer>
    )
  }
});

React.render(
  <Todos model={todoModel}/>,document.querySelector('#todoapp')
)
