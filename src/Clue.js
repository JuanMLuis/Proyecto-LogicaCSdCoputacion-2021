import React from 'react';

class Clue extends React.Component {
constructor(props){
    super(props);
    this.state={
        Pintado:"clue1"
    }
}

    cambiarmodo(valor){
        if(valor===0)
            this.setState({pintado:"clue0"})
            else
            this.setState({pintado:"clue1"})
    }

    render() {

        const clue = this.props.clue;
        return (
            <div className={this.state.Pintado} >
                {clue.map((num, i,v) =>
                    <div key={i}>
                        {num}
                    </div>
                )}
            </div>
        );
    }
}

export default Clue;