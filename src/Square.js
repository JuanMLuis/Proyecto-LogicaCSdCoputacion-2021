import React from 'react';

class Square extends React.Component {
    render() {
        let String=""
        if(this.props.value === "#")
            String=" paintB"
        return (
            <button className={"square"+String} onClick={this.props.onClick}>
                {this.props.value === 'X' ? this.props.value : null}
            </button>
        );
    }
}

export default Square;