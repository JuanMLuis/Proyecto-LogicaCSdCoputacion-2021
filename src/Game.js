import React from 'react';
import PengineClient from './PengineClient';
import Board from './Board';


class Game extends React.Component {

  pengine;

  constructor(props) {
    super(props);
    this.state = {
      grid: null,
      waiting: false,
      mode: '#',
  
    };
    this.handleClick = this.handleClick.bind(this);
    this.handlePengineCreate = this.handlePengineCreate.bind(this);
    this.pengine = new PengineClient(this.handlePengineCreate);
    this.cambioDeEstado = this.cambioDeEstado.bind(this);
  }

  handlePengineCreate() {
    const queryS = 'init(PistasFilas, PistasColumns, Grilla)';
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        this.setState({
          grid: response['Grilla']
        });
      }
    });
  }

  handleClick(i, j) {
    // No action on click if we are waiting.
    if (this.state.waiting) {
      return;
    }
    // Build Prolog query to make the move, which will look as follows:
    // put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
    const squaresS = JSON.stringify(this.state.grid).replaceAll('"_"', "_"); // Remove quotes for variables.
    const queryS = 'put(['+this.state.mode+'], [' + i + ',' + j + ']' 
    + ', [], [],' + squaresS + ', GrillaRes, FilaSat, ColSat)';
    this.setState({
      waiting: true
    });
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        this.setState({
          grid: response['GrillaRes'],
          waiting: false
        });
      } else {
        this.setState({
          waiting: false
        });
      }
    });
  }

  cambioDeEstado(){
    if(this.state.mode==='#'){
      this.setState({mode:'x'})         //investigar poque si la x es mayuscula se cambia por una A solo en la grilla
    }
    else this.setState( {mode:'#'})
  }
  

  render() {
    if (this.state.grid === null) {
      return null;
    }
    const statusText = 'Keep playing!';
    return (
      <div className="game"> 
      <div>
       
          <button type="submit" class="btn btn-primary btn-sm" onClick={this.cambioDeEstado} >
        
            {this.state.mode}  
            
         </button> 
          </div>
        <Board
          grid={this.state.grid}
          onClick={(i, j) => this.handleClick(i,j)}
        />
        <div className="gameInfo">
          {statusText}
        </div>
        
        
        
      </div>
    );
  }
}

export default Game;
