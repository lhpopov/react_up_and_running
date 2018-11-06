var headers = [
    "Book", "Author", "Language", "Published", "Sales"
];

var data = [
    ["The Lord of the Rings", "J. R. R. Tolkien",
        "English", "1954–1955", "150 million"
    ],
    ["Le Petit Prince (The Little Prince)", "Antoine de Saint-Exupéry",
        "French", "1943", "140 million"
    ],
    ["Harry Potter and the Philosopher's Stone", "J. K. Rowling",
        "English", "1997", "107 million"
    ],
    ["And Then There Were None", "Agatha Christie",
        "English", "1939", "100 million"
    ],
    ["Dream of the Red Chamber", "Cao Xueqin",
        "Chinese", "1754–1791", "100 million"
    ],
    ["The Hobbit", "J. R. R. Tolkien",
        "English", "1937", "100 million"
    ],
    ["She: A History of Adventure", "H. Rider Haggard",
        "English", "1887", "100 million"
    ],
];

var Excel = createReactClass({
    diplayName: "Excel",

    propTypes: {
        headers: PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ])
        ),

        initialData: PropTypes.arrayOf(
            PropTypes.arrayOf(
                PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.number
                ])
            )
        )
    },

    _preSearchData: null,

    getInitialState() {
        return {
            data: this.props.initialData,
            sortby: null,
            descending: false,
            edit: null,
            search: false,
            needles: []
        };
    },

    componentDidMount(){
        document.onkeydown = function(e){
            if(e.altKey && e.shiftKey && e.keyCode === 82){
                this._replay();
            }
        }.bind(this);
    },

    componentWillUpdate(oldState, newState){
        this._log.push(JSON.parse(JSON.stringify(this._log.length === 0 ? this.state : newState)));
    },

    shouldComponentUpdate(newProps, newState){
        //TODO prevent setting state, when it comes from replay
    },  

    _replay(){
        if(this._log.length === 0){
            console.warn('No state to replay yet.');
            return;
        }

        let idx = -1,
            interval = setInterval(function(){
                idx++;
                if(idx === this._log.length - 1){
                    clearInterval(interval);
                }

                this.setState(this._log[idx]);
            }.bind(this), 1000);
    },

    _log: [],

    _logSetState(newState){
        this._log.push(JSON.parse(JSON.stringify(this._log.length === 0 ? this.state : newState)));
        this.setState(newState);
    },

    _sort(e) {
        let column = e.target.cellIndex,
            data = Array.from(this.state.data),
            descending = this.state.sortby === column && !this.state.descending;

        data.sort((a, b) => {
            return descending ?
                (a[column] < b[column] ? 1 : -1) :
                (a[column] > b[column] ? 1 : -1);
        });

        this.setState({
            data: data,
            sortby: column,
            descending: descending
        });
    },

    _showEditor(e){
        let column = e.target.cellIndex,
            row = parseInt(e.target.dataset.row, 10);

        this.setState({edit: { row: row, column: column }});
    },

    _save(e){
        e.preventDefault();
        
        let input = e.target.firstChild,
            data = this.state.data.slice();
            
        data[this.state.edit.row][this.state.edit.column] = input.value;

        this.setState({ data: data, edit: null });
    },

    _renderTable() {
        return React.createElement(
            'table', { className: 'excel' },
            React.createElement(
                'thead', { onClick: this._sort },
                React.createElement(
                    'tr',
                    null,
                    this.props.headers.map((title, index) => {
                        if(this.state.sortby === index){
                            title += this.state.descending ? ' \u2191' : ' \u2193';
                        }

                        return React.createElement('th', { key: index }, title);
                    })
                )
            ),
            React.createElement(
                'tbody',
                { onDoubleClick: this._showEditor },
                this._renderSearch(),
                this.state.data.map((row, rowIdx) => {
                    return (
                        React.createElement(
                            'tr', { key: rowIdx },
                            row.map((cell, idx) => {
                                let content = cell;
                                if(this.state.edit && this.state.edit.row === rowIdx && this.state.edit.column === idx){
                                    // content = React.createElement('input', { type: 'text', defaultValue: cell, onKeyUp: this._saveEditor });
                                    content = React.createElement('form', { onSubmit: this._save }, 
                                                React.createElement('input', { type: 'text', defaultValue: cell })
                                            );

                                }

                                return React.createElement('td',  { key: idx, 'data-row': rowIdx }, content);
                            })
                        )
                    );
                })
            )
        );
    },

    _renderSearch(){
        if(!this.state.search){
            return null;
        }


        return React.createElement('tr', { onChange: this._search },
            this.props.headers.map((_ignore, cellIdx) => {

                return React.createElement('td', { key: cellIdx }, 
                    React.createElement('input', { type: 'text', 'data-idx': cellIdx })
                );
            })
        );
    },

    _renderToolbar(){
        let toggleSearchBtn = React.createElement('button', { onClick: this._toggleSearch, className: 'toolbar' }, (this.state.search ? 'Done searching' : 'Search')),
            undoBtn = React.createElement('button', { onClick: this._undo, className: 'undo-btn' }, 'Undo'),
            redoBtn = React.createElement('button', { onClick: this._redo, className: 'redo-btn' }, 'Redo')

        // return React.createElement('div', { className: 'toolbar' }, buttons);
        return React.createElement('div', { className: 'toolbar' }, [toggleSearchBtn, undoBtn, redoBtn]);
    },

    _toggleSearch(){
        this.setState({ search: !this.state.search });

        if(this.state.search){
            this.setState({
                data: this._preSearchData,
                search: false
            });
        }else{
            this._preSearchData = this.state.data;
            this.setState({
                search: true
            });
        }
    },

    _search(e){
        let needle = e.target.value.toLowerCase(),
            idx = e.target.dataset.idx,
            newNeedles = this.state.needles.slice();


        if(!needle){
            newNeedles.splice(parseInt(idx),1);

            if(newNeedles.length === 0){
                this.setState({
                    data: this._preSearchData,
                    needles: []
                });

                return;
            }
        }

        let searchData = this._preSearchData.filter(function(row){
                return row[idx].toString().toLowerCase().indexOf(needle) > -1;
            });

        // if(this.state.needles.length > 0){
        //     this.state.needles.map((needleEl, idx) => {
        //         searchData = searchData.filter(function(row){
        //             return row[idx].toString().toLowerCase().indexOf(needleEl) > -1;
        //         });
        //     });
        // }

        newNeedles[idx] = needle;

        this.setState({ data: searchData, "needles": newNeedles });
    },

    render(){
        return React.createElement('div', null, this._renderToolbar(), this._renderTable());
    }
});

ReactDOM.render(React.createElement(Excel, { headers: headers, initialData: data }), document.getElementById('app'));