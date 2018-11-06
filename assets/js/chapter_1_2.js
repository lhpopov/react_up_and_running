/*Chapter 1*/
// ReactDOM.render(
//     React.createElement('h1', null, 'Hello World!'),
//     document.getElementById('app')
// );

/*Chapter 2*/
class Component extends React.Component {

    render() {
        return React.createElement('h1', null, 'Hello ' + this.props.name + '!');
    }
};

Component.propTypes = {
    name: PropTypes.string.isRequired
};

// ReactDOM.render(
//     React.createElement(Component, {name: 'Component'}),
//     document.getElementById('app')
// );

/* Text area */
var logMixin = {

    _log: function(methodName, args) {
        console.log(this.name + '::' + methodName, args);
    },

    componentWillUpdate: function() {
        this._log('componentWillUpdate', arguments);
    },

    componentDidUpdate: function() {
        this._log('componentDidUpdate', arguments);
    },

    componentWillMount: function() {
        this._log('componentWillMount', arguments);
    },

    componentDidMount: function() {
        this._log('componentDidMount', arguments);
    },

    componentWillUnmount: function() {
        this._log('componentWillUnmount', arguments);
    },
};

let Counter = createReactClass({
    name: 'Counter',
    // mixins: [logMixin],
    mixins: [React.addons.PureRenderMixin, logMixin],
    propTypes: {
        count: PropTypes.number.isRequired
    },

    render() {
        console.log(this.name + '::render called');
        return React.createElement('h3', null, this.props.count);
    }
});

let TextAreaCounter = createReactClass({
    name: 'TextAreaCounter',

    // mixins: [logMixin],

    propTypes: {
        text: PropTypes.string
    },

    getInitialState: function() {
        return {
            text: this.props.text
        };
    },

    _textChange: function(ev) {
        this.setState({
            text: ev.target.value,
        });
    },

    render() {
        console.log(this.name + '::render called');
        let counter = null;

        if (this.state.text.length > 0) {
            counter = React.createElement(Counter, { count: this.state.text.length });
        }

        return React.createElement('div', null, React.createElement('textarea', { value: this.state.text, onChange: this._textChange }), counter);
        // return React.createElement('div', null, React.createElement('textarea', { value: this.state.text, onChange: this._textChange }), React.createElement('h3', null, this.state.text.length));
    }
});

TextAreaCounter.defaultProps = {
    text: ''
};

let textAreaCounter = ReactDOM.render(
    React.createElement(TextAreaCounter, { text: 'Dilan' }),
    document.getElementById('app')
);

/* Prevent Component Updates */