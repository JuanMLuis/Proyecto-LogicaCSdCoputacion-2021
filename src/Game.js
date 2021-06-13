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
      mode: '#',
      PistasFilasSatisfechas: null,
      PistasColumnasSatisfechas: null,
      matrizSolucionada:null,
      victoria : false
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
        let CantFilas=Object.keys(response['PistasFilas']).length;
        let CantColumnas=Object.keys(response['PistasColumns']).length;
        
        this.setState({
          grid: response['Grilla'],
          rowClues: response['PistasFilas'],
     
          colClues: response['PistasColumns'],
          PistasFilasSatisfechas:new Array(CantFilas).fill(0),          //preguntar, inicializamos en 0, si no se inicializa aca, explota
          PistasColumnasSatisfechas: new Array(CantColumnas).fill(0),
          

          
        });

      }
      this.inicializarPistasSat();
      this.inicializarMatrizSoluciones();
    });
  }

  inicializarMatrizSoluciones(){
    
    let PistasF= JSON.stringify(this.state.rowClues.slice());     
    let PistasC= JSON.stringify(this.state.colClues.slice()); 
    const queryMat='completarNonograma('+PistasC+','+PistasF+',GrillaR)'

    this.pengine.query(querySat, (success, response) => {
      if (success) {
        this.setState({
          matrizSolucionada :response['GrillaR'],

        });
       
      }
    });


    
  }

  inicializarPistasSat(){   //inicializa los estados de las pistas por si alguna comienza en 1
   const squaresS = JSON.stringify(this.state.grid).replaceAll('"_"', "_");
   let PistasF= JSON.stringify(this.state.rowClues.slice());     
   let PistasC= JSON.stringify(this.state.colClues.slice());    
    
    const querySat='estadoDePistasGeneral('+squaresS+','+PistasF+','+PistasC+',ListaCumplidaF,ListaCumplidaC)'
    this.pengine.query(querySat, (success, response) => {
      if (success) {
        this.setState({
          PistasFilasSatisfechas:response['ListaCumplidaF'],
          PistasColumnasSatisfechas: response['ListaCumplidaC']

          
        });
       
      }
    });
  }



  
  

  cambioDeEstado(){
    if(!this.state.victoria){       //si la partida no termino, permito el cambio de modo
    if(this.state.mode==='#'){
      this.setState({mode:'X'})
    }
    else this.setState( {mode:'#'})
  }
  }
  
  

  handleClick(i, j) {
    if(!this.state.victoria){
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
  }


agregarElemento(posicion,i,j,squaresS){ //se encarga de agregar el elemento que corresponda en la grilla
    let nuevoElem;
    let filaPista;
    let columnaPista;
      if(posicion === this.state.mode)
        nuevoElem='_'                   
        else
        nuevoElem='"'+this.state.mode+'"'
        let PistF = this.state.rowClues[i].toString();
        let PistC = this.state.colClues[j].toString();

        const queryS = 'put('+nuevoElem+', [' + i + ',' + j + '], ['+PistF+'], ['+PistC+'],' + squaresS + ', GrillaRes, FilaSat, ColSat)';
    
    
    this.setState({
      waiting: true
    });
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        filaPista = response['FilaSat'];
        columnaPista= response['ColSat']
        this.setState({
          grid: response['GrillaRes'],
          waiting: false
        });
      } else {
        this.setState({
          waiting: false
        });
      }
      let ArrayAuxFil = this.state.PistasFilasSatisfechas.slice();
      ArrayAuxFil[i]=filaPista
      this.setState({PistasFilasSatisfechas:ArrayAuxFil});

      let ArrayAuxCol = this.state.PistasColumnasSatisfechas.slice();
      ArrayAuxCol[j]=columnaPista
      this.setState({PistasColumnasSatisfechas:ArrayAuxCol});

      this.victoria();
      
    });
  }


  victoria(){
    let seguirRecorriendo = true;
    let arregloPistasFilasSat = this.state.PistasFilasSatisfechas;
    let arregloPistasColumnasSat = this.state.PistasColumnasSatisfechas;
    let i = 0;
    let r = 0;

    while( seguirRecorriendo){

      for( i; i < arregloPistasFilasSat.length; i++)
          if (arregloPistasFilasSat[i] === 0)
          seguirRecorriendo = false;
      

      if (seguirRecorriendo){

        for(r; r < arregloPistasColumnasSat.length; r++)
          if (arregloPistasColumnasSat[r] === 0)
          seguirRecorriendo = false;
      }

      if(seguirRecorriendo){
        this.setState({victoria : true});
        seguirRecorriendo = false;
      }
        
  }

}

  render() {
    if (this.state.grid === null) {
      return null;
    }

    let TextoVictoria
      if (this.state.victoria === true)
        TextoVictoria = 'Victoria!';
      else TextoVictoria="";

    

    
  
    
    return (
      <div className="game">
        <div> 
       </div>
        <Board
          grid={this.state.grid}
          rowClues={this.state.rowClues}
          colClues={this.state.colClues}
          PistasFSatisfechas={this.state.PistasFilasSatisfechas}
          PistasCSatisfechas={this.state.PistasColumnasSatisfechas}
          Boton={ <button type="button" className="box" onClick={this.cambioDeEstado} >{this.state.mode} </button> } //boton de cambio de estado
          Victoria={TextoVictoria}
          onClick={(i, j) => this.handleClick(i,j)}
        />
        
      </div>
    );
  }
}

export default Game;
