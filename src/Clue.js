import React from 'react';

class Clue extends React.Component {

    render() {
        const Pintar=this.props.Pintar;
        const clue = this.props.clue;
        return (
            <div className={(Pintar===1 ? "clue1" : "clue0")} >
                {clue.map((num, i) =>
                    <div key={i}>
                        {num}
                    </div>
                )}
            </div>
        );
    }
}

export default Clue;