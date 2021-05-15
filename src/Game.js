import React from 'react';
import PengineClient from './PengineClient';
import Board from './Board';

class Game extends React.Component {

  pengine;

  constructor(props) {
    super(props);
    this.state = {
      grid: null,
      rowClues: null,
      colClues: null,
      waiting: false,
      mode: '#'
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
          grid: response['Grilla'],
          rowClues: response['PistasFilas'],
          colClues: response['PistasColumns'],
        });
      }
    });
  }
  cambioDeEstado(){
    if(this.state.mode==='#'){
      this.setState({mode:'X'})         //investigar poque si la x es mayuscula se cambia por una A solo en la grilla
    }
    else this.setState( {mode:'#'})
  }
  
  

  handleClick(i, j) {
    // No action on click if we are waiting.
    if (this.state.waiting) {
      return;
    }
    // Build Prolog query to make the move, which will look as follows:
    // put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
   
    var posicion
    const squaresS = JSON.stringify(this.state.grid).replaceAll('"_"', "_"); // Remove quotes for variables.
    const queryFind ='find('+ i + ',' + j + ','+squaresS+', R)'
    
    
    this.setState({
      waiting: true
    });
    this.pengine.query(queryFind, (success, response) => {
      if (success) {
        posicion= response['R'];
        this.setState({
          waiting: false
        });
      } else {
        this.setState({
          waiting: false
        });
        
      }this.agregarElemento(posicion,i,j,squaresS);
    }); 
  }


agregarElemento(posicion,i,j,squaresS){ //se encarga de agregar el elemento que corresponda en la grilla
    let nuevoElem;
    let filaPista;
      if(posicion === this.state.mode)
        nuevoElem='_'                   
        else
        nuevoElem='"'+this.state.mode+'"'

        const queryS = 'put('+nuevoElem+', [' + i + ',' + j + '], [], [],' + squaresS + ', GrillaRes, FilaSat, ColSat)';
    
    
    this.setState({
      waiting: true
    });
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        
        filaPista = response['FilaSat']
        this.setState({
          grid: response['GrillaRes'],
          
          waiting: false
        });
      } else {
        this.setState({
          waiting: false
        });
      }
      console.log(filaPista);
    });
  }


  render() {
    if (this.state.grid === null) {
      return null;
    }
    const statusText = 'Keep playing!';
    return (
      <div className="game">
        <div>
       <button type="button" className="box" onClick={this.cambioDeEstado} >
         {this.state.mode.replace(/['"]+/g, '')}  
      </button> 
       </div>
        <Board
          grid={this.state.grid}
          rowClues={this.state.rowClues}
          colClues={this.state.colClues}
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
