import React from 'react';
import Square from './Square';
import Clue from './Clue';


class Board extends React.Component {
    
    
    BuscarMaximoArray(array) {
            let toReturn=0;
            array.forEach(element => {
                if(toReturn<element.length)
                    toReturn=element.length;
            });
            return toReturn;
        }

    render() {
        const numOfRows = this.props.grid.length;
        const numOfCols = this.props.grid[0].length;

        const rowClues = this.props.rowClues;
        const colClues = this.props.colClues;

        const PistasFSatisfechas= this.props.PistasFSatisfechas;
        const PistasCSatisfechas= this.props.PistasCSatisfechas;

        const Victoria=this.props.Victoria;
       
        let maxCantCol=this.BuscarMaximoArray(colClues);
        let maxCantRow=this.BuscarMaximoArray(rowClues);

        const Boton=this.props.Boton;

        
        return (
            <div className="vertical">
                <div
                    className="colClues"            //
                    style={{
                        gridTemplateRows: maxCantCol*25+'px',
                        gridTemplateColumns: '60px repeat(' + numOfCols + ', 40px)'
                        /*
                           60px  40px 40px 40px 40px 40px 40px 40px   (gridTemplateColumns)
                          ______ ____ ____ ____ ____ ____ ____ ____
                         |      |    |    |    |    |    |    |    |  60px
                         |      |    |    |    |    |    |    |    |  (gridTemplateRows)
                          ------ ---- ---- ---- ---- ---- ---- ---- 
                         */
                    }}
                >
                    <div>{Boton}</div>
                    {colClues.map((clue, i) =>
                        <Clue clue={clue} key={i} Pintar={PistasCSatisfechas[i]} />
                    )}
                </div>
                <div className="horizontal">
                    <div
                        className="rowClues"
                        style={{
                            gridTemplateRows: 'repeat(' + numOfRows + ', 40px)',
                            gridTemplateColumns: maxCantRow*35+'px'
                            /* IDEM column clues above */
                        }}
                    >
                        {rowClues.map((clue, i) =>
                            <Clue clue={clue} key={i} Pintar={PistasFSatisfechas[i]}/>
                        )}
                    </div>
                    <div className="board"
                        style={{
                            gridTemplateRows: 'repeat(' + numOfRows + ', 40px)',
                            gridTemplateColumns: 'repeat(' + numOfCols + ', 40px)'
                        }}>
                        {this.props.grid.map((row, i) =>
                            row.map((cell, j) =>
                                <Square
                                    value={cell}
                                    onClick={() => this.props.onClick(i, j)}
                                    key={i + j}
                                />
                            )
                        )}
                    </div>
                    
                </div>
                <div className="Victoria">
                    {Victoria}
           
            </div>
            </div>
        );
    }
}

export default Board;